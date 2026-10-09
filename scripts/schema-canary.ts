#!/usr/bin/env tsx
import { appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getV1Countries, getV1CountriesCountryCodeForm } from '@/src/client';
import { Client } from '@/src/client/client';
import {
  DEFAULT_VERSION,
  getContractDetailsStrategy,
} from '@/src/flows/Onboarding/utils';
import { CONTRACT_DETAILS_SEEDS } from './contract-details-seeds';
import { createSandboxClient } from './schema-canary/auth';
import { KNOWN_UNSAVED_FIELDS } from './schema-canary/known-unsaved-fields';
import {
  buildReport,
  checkSchemaBuildsAndValidates,
  decideExitCode,
  formatFailures,
  formatSummaryTable,
  isSkipped,
  mapWithConcurrency,
  SCHEMA_CHECK_ORDER,
  SCHEMA_VERSION_TRACKS,
  SchemaCanaryRow,
  SchemaCheckType,
  SchemaVersionTrack,
  trackOf,
} from './schema-canary/lib';
import { resolvePinnedVersion } from './schema-canary/pinned-versions';
import { SCHEMA_CANARY_REPORT_PATH } from './schema-canary/report-path';
import { KeptEmployment } from './schema-canary/kept-employments';
import {
  archiveEmployment,
  seedEmploymentForCountry,
} from './schema-canary/seed-employment';
import { SCHEMA_CANARY_SKIP_LIST } from './schema-canary/skip-list';
import {
  seedFor,
  submitContractDetails,
} from './schema-canary/submit-contract-details';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.sandbox') });

function parseArgs(argv: string[]) {
  const args: Record<string, string | true> = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) args[match[1]] = match[2] ?? true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const COUNTRY_FILTER =
  typeof args.country === 'string' ? args.country.toUpperCase() : undefined;
const REQUESTED_CHECKS =
  typeof args.checks === 'string'
    ? (args.checks.split(',') as SchemaCheckType[])
    : SCHEMA_CHECK_ORDER;
const CHECK_TYPES = SCHEMA_CHECK_ORDER.filter((check) =>
  REQUESTED_CHECKS.includes(check),
);
const REQUESTED_TRACKS =
  typeof args.versions === 'string'
    ? (args.versions.split(',') as SchemaVersionTrack[])
    : SCHEMA_VERSION_TRACKS;
const TRACKS = SCHEMA_VERSION_TRACKS.filter((track) =>
  REQUESTED_TRACKS.includes(track),
);
const CONCURRENCY =
  typeof args.concurrency === 'string' ? Number(args.concurrency) : 6;
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1) {
  throw new Error(
    `--concurrency must be a positive integer, got ${args.concurrency}`,
  );
}
const WRITE_REPORT = args.write === true;
const FAILURES_OUT =
  typeof args['failures-out'] === 'string' ? args['failures-out'] : undefined;
const LATEST_FAILURES_OUT =
  typeof args['latest-failures-out'] === 'string'
    ? args['latest-failures-out']
    : undefined;
const KEEP_SUBMITTED =
  typeof args['keep-submitted'] === 'string'
    ? args['keep-submitted']
    : undefined;

async function fetchLiveCountries(client: Client): Promise<string[]> {
  const response = await getV1Countries({
    client,
    headers: { Authorization: '' },
  });
  if (response.error || !response.data) {
    throw new Error('Failed to fetch /v1/countries from the sandbox gateway');
  }
  return (response.data.data ?? [])
    .filter((country) => country.eor_onboarding)
    .map((country) => country.code)
    .filter((code) => !COUNTRY_FILTER || code === COUNTRY_FILTER);
}

function versionFor(country: string, track: SchemaVersionTrack) {
  return track === 'latest'
    ? 'latest'
    : resolvePinnedVersion(country, DEFAULT_VERSION);
}

async function fetchLiveSchema(
  client: Client,
  country: string,
  version: number | 'latest',
  employmentId: string,
): Promise<Record<string, unknown> | null> {
  const response = await getV1CountriesCountryCodeForm({
    client,
    headers: { Authorization: '' },
    path: { country_code: country, form: 'contract_details' },
    query: {
      skip_benefits: true,
      employment_id: employmentId,
      json_schema_version: version,
    },
  });
  if (response.error || !response.data) {
    throw new Error(
      `GET /v1/countries/${country}/contract_details?employment_id=${employmentId}&json_schema_version=${version} failed`,
    );
  }
  return response.data.data ?? null;
}

type CountryResult = { rows: SchemaCanaryRow[]; kept?: KeptEmployment };

const keptSoFar: KeptEmployment[] = [];

function recordKept(employment: KeptEmployment, keepFile: string) {
  keptSoFar.push(employment);
  writeFileSync(keepFile, `${JSON.stringify(keptSoFar, null, 2)}\n`);
}

async function checkCountry(
  client: Client,
  country: string,
  track: SchemaVersionTrack,
): Promise<CountryResult> {
  const strategy = getContractDetailsStrategy(country);
  const version = versionFor(country, track);
  const label = `${country}@${version}`;
  const rows: SchemaCanaryRow[] = [];
  let kept: KeptEmployment | undefined;

  let employmentId: string;
  let companyId: string;
  try {
    ({ employmentId, companyId } = await seedEmploymentForCountry(
      client,
      country,
    ));
    console.log(`[${label}] seeded employment ${employmentId}`);
  } catch (error) {
    const reason = `employment seeding failed: ${error instanceof Error ? error.message : String(error)}`;
    console.log(`[${label}] ${reason}`);
    for (const check of CHECK_TYPES) {
      const skipEntry = isSkipped(
        SCHEMA_CANARY_SKIP_LIST,
        country,
        check,
        track,
      );
      rows.push({
        country,
        version,
        strategy,
        check,
        outcome: skipEntry ? 'skip' : 'seed-error',
        error: skipEntry?.reason ?? reason,
      });
    }
    return { rows };
  }

  try {
    let schema: Promise<Record<string, unknown> | null> | undefined;
    let buildFailed = false;
    for (const check of CHECK_TYPES) {
      const skipEntry = isSkipped(
        SCHEMA_CANARY_SKIP_LIST,
        country,
        check,
        track,
      );

      if (skipEntry) {
        rows.push({
          country,
          version,
          strategy,
          check,
          outcome: 'skip',
          error: skipEntry.reason,
        });
        continue;
      }

      if (check === 'submit' && buildFailed) {
        rows.push({
          country,
          version,
          strategy,
          check,
          outcome: 'skip',
          error: 'the schema failed to build, so it was not submitted',
        });
        continue;
      }

      try {
        schema ??= fetchLiveSchema(client, country, version, employmentId);
        let result: { ok: true } | { ok: false; error: string };
        if (check === 'submit') {
          const submitted = await submitContractDetails(
            client,
            employmentId,
            await schema,
            version,
            {
              strategy,
              seed: seedFor(country),
              seedValues: CONTRACT_DETAILS_SEEDS[country],
              knownUnsavedFields: KNOWN_UNSAVED_FIELDS[country],
            },
          );
          if (submitted.ok) {
            kept = {
              country,
              employmentId,
              companyId,
              version,
              strategy,
              sent: submitted.sent,
              knownUnsavedFields: Object.keys(
                KNOWN_UNSAVED_FIELDS[country] ?? {},
              ),
            };
          }
          result = submitted;
        } else {
          result = await checkSchemaBuildsAndValidates(await schema, strategy);
          if (!result.ok) buildFailed = true;
        }
        console.log(
          `[${label}] ${check} -> ${result.ok ? 'pass' : `fail: ${result.error}`}`,
        );
        rows.push({
          country,
          version,
          strategy,
          check,
          outcome: result.ok ? 'pass' : 'fail',
          error: result.ok ? undefined : result.error,
        });
      } catch (error) {
        if (check === 'build') buildFailed = true;
        rows.push({
          country,
          version,
          strategy,
          check,
          outcome: 'fail',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    if (KEEP_SUBMITTED && kept) {
      recordKept(kept, KEEP_SUBMITTED);
      console.log(`[${label}] kept employment ${employmentId}`);
    } else {
      try {
        await archiveEmployment(client, employmentId);
        console.log(`[${label}] archived employment ${employmentId}`);
      } catch (error) {
        console.warn(
          `[${label}] failed to archive employment ${employmentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return { rows, kept };
}

async function runLive(): Promise<CountryResult[]> {
  const clientId = process.env.VITE_CLIENT_ID;
  const clientSecret = process.env.VITE_CLIENT_SECRET;
  const refreshToken = process.env.VITE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, or VITE_REFRESH_TOKEN (set them in .env.sandbox at the repo root, or as env vars)',
    );
  }

  const client = createSandboxClient(clientId, clientSecret, refreshToken);
  const countries = await fetchLiveCountries(client);
  const runs = countries.flatMap((country) =>
    TRACKS.map((track) => ({ country, track })),
  );
  return mapWithConcurrency(runs, CONCURRENCY, ({ country, track }) =>
    checkCountry(client, country, track),
  );
}

function report(rows: SchemaCanaryRow[]) {
  const table = formatSummaryTable(rows);
  console.log(table);

  const passCount = rows.filter((row) => row.outcome === 'pass').length;
  const failCount = rows.filter((row) => row.outcome === 'fail').length;
  const seedErrorCount = rows.filter(
    (row) => row.outcome === 'seed-error',
  ).length;
  const skipCount = rows.filter((row) => row.outcome === 'skip').length;
  console.log(
    `\n${passCount} passed, ${failCount} failed, ${seedErrorCount} seed errors, ${skipCount} skipped (${rows.length} checks total)`,
  );

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(
      summaryPath,
      `## Contract details schema canary\n\n${table}\n`,
    );
  }
}

function writeReport(rows: SchemaCanaryRow[]) {
  writeFileSync(
    SCHEMA_CANARY_REPORT_PATH,
    `${JSON.stringify(buildReport(rows), null, 2)}\n`,
  );
}

async function main() {
  const results = await runLive();
  const rows = results.flatMap((result) => result.rows);
  report(rows);

  if (KEEP_SUBMITTED) {
    console.log(
      `\nKept ${keptSoFar.length} submitted employment(s) in ${KEEP_SUBMITTED}`,
    );
  }

  if (WRITE_REPORT) {
    writeReport(rows);
  }
  if (FAILURES_OUT) {
    writeFileSync(FAILURES_OUT, formatFailures(rows, 'pinned'));
  }
  if (LATEST_FAILURES_OUT) {
    writeFileSync(LATEST_FAILURES_OUT, formatFailures(rows, 'latest'));
  }

  for (const track of TRACKS) {
    const problems = rows.filter(
      (row) =>
        trackOf(row.version) === track &&
        (row.outcome === 'fail' || row.outcome === 'seed-error'),
    );
    if (problems.length === 0) continue;
    const log = track === 'pinned' ? console.error : console.warn;
    log(
      `\n${problems.length} ${track} check(s) failed${track === 'latest' ? ' (warning only, does not fail the job)' : ''}:`,
    );
    for (const row of problems) {
      log(`  - ${row.country}@${row.version} ${row.check}: ${row.error}`);
    }
  }

  process.exitCode = decideExitCode(rows);
}

main().catch((error) => {
  console.error('schema-canary failed:', error);
  process.exitCode = 1;
});

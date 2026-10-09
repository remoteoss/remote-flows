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
  withJobTitleEligibilityRiskAcknowledgement,
} from '@/src/flows/Onboarding/utils';
import { createSandboxClient } from './schema-canary/auth';
import {
  buildReport,
  checkSchemaBuildsAndValidates,
  decideExitCode,
  formatFailures,
  formatSummaryTable,
  isSkipped,
  mapWithConcurrency,
  SCHEMA_CHECK_ORDER,
  SchemaCanaryRow,
  SchemaCheckType,
} from './schema-canary/lib';
import { resolvePinnedVersion } from './schema-canary/pinned-versions';
import {
  archiveEmployment,
  seedEmploymentForCountry,
} from './schema-canary/seed-employment';
import { SCHEMA_CANARY_SKIP_LIST } from './schema-canary/skip-list';

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
const unknownChecks = REQUESTED_CHECKS.filter(
  (check) => !SCHEMA_CHECK_ORDER.includes(check),
);
if (unknownChecks.length > 0) {
  throw new Error(
    `--checks got unknown value(s) ${unknownChecks.join(', ')}; expected ${SCHEMA_CHECK_ORDER.join(', ')}`,
  );
}
const CHECK_TYPES = SCHEMA_CHECK_ORDER.filter((check) =>
  REQUESTED_CHECKS.includes(check),
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
const REPORT_PATH = path.resolve(__dirname, 'reports', 'schema-canary.json');

async function fetchLiveCountries(client: Client): Promise<string[]> {
  const response = await getV1Countries({
    client,
    headers: { Authorization: '' },
  });
  if (response.error || !response.data) {
    throw new Error('Failed to fetch /v1/countries from the sandbox gateway');
  }
  const countries = (response.data.data ?? [])
    .filter((country) => country.eor_onboarding)
    .map((country) => country.code)
    .filter((code) => !COUNTRY_FILTER || code === COUNTRY_FILTER);
  if (countries.length === 0) {
    throw new Error(
      COUNTRY_FILTER
        ? `--country=${COUNTRY_FILTER} is not an EOR onboarding country on the sandbox gateway`
        : '/v1/countries returned no EOR onboarding countries',
    );
  }
  return countries;
}

function versionFor(country: string, check: SchemaCheckType) {
  return check === 'latest'
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
  return response.data.data
    ? withJobTitleEligibilityRiskAcknowledgement(response.data.data)
    : null;
}

async function checkCountry(
  client: Client,
  country: string,
): Promise<SchemaCanaryRow[]> {
  const strategy = getContractDetailsStrategy(country);
  const rows: SchemaCanaryRow[] = [];

  let employmentId: string;
  try {
    employmentId = await seedEmploymentForCountry(client, country);
    console.log(`[${country}] seeded employment ${employmentId}`);
  } catch (error) {
    const reason = `employment seeding failed: ${error instanceof Error ? error.message : String(error)}`;
    console.log(`[${country}] ${reason}`);
    for (const check of CHECK_TYPES) {
      const skipEntry = isSkipped(SCHEMA_CANARY_SKIP_LIST, country, check);
      rows.push({
        country,
        version: versionFor(country, check),
        strategy,
        check,
        outcome: skipEntry ? 'skip' : 'seed-error',
        error: skipEntry?.reason ?? reason,
      });
    }
    return rows;
  }

  const schemas = new Map<
    number | 'latest',
    Promise<Record<string, unknown> | null>
  >();
  const schemaFor = (version: number | 'latest') => {
    if (!schemas.has(version)) {
      schemas.set(
        version,
        fetchLiveSchema(client, country, version, employmentId),
      );
    }
    return schemas.get(version)!;
  };

  try {
    for (const check of CHECK_TYPES) {
      const skipEntry = isSkipped(SCHEMA_CANARY_SKIP_LIST, country, check);
      const version = versionFor(country, check);

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

      try {
        const schema = await schemaFor(version);
        const result = await checkSchemaBuildsAndValidates(schema, strategy);
        console.log(
          `[${country}] ${check}@${version} -> ${result.ok ? 'pass' : `fail: ${result.error}`}`,
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
    try {
      await archiveEmployment(client, employmentId);
      console.log(`[${country}] archived employment ${employmentId}`);
    } catch (error) {
      console.warn(
        `[${country}] failed to archive employment ${employmentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return rows;
}

async function runLive(): Promise<SchemaCanaryRow[]> {
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
  const rowsByCountry = await mapWithConcurrency(
    countries,
    CONCURRENCY,
    (country) => checkCountry(client, country),
  );
  return rowsByCountry.flat();
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
  writeFileSync(REPORT_PATH, `${JSON.stringify(buildReport(rows), null, 2)}\n`);
}

async function main() {
  const rows = await runLive();
  report(rows);

  if (WRITE_REPORT) {
    writeReport(rows);
  }
  if (FAILURES_OUT) {
    writeFileSync(FAILURES_OUT, formatFailures(rows));
  }

  const failedPinned = rows.filter(
    (row) => row.check === 'pinned' && row.outcome === 'fail',
  );
  const failedLatest = rows.filter(
    (row) => row.check === 'latest' && row.outcome === 'fail',
  );
  if (failedLatest.length > 0) {
    console.warn(
      `\n${failedLatest.length} "latest" check(s) failed (warning only, does not fail the job):`,
    );
    for (const row of failedLatest) {
      console.warn(`  - ${row.country}: ${row.error}`);
    }
  }
  const seedErrorCountries = [
    ...new Map(
      rows
        .filter((row) => row.outcome === 'seed-error')
        .map((row) => [row.country, row.error]),
    ),
  ];
  if (seedErrorCountries.length > 0) {
    console.error(
      `\n${seedErrorCountries.length} country(ies) could not be seeded, so their schemas were not checked:`,
    );
    for (const [country, error] of seedErrorCountries) {
      console.error(`  - ${country}: ${error}`);
    }
  }
  if (failedPinned.length > 0) {
    console.error(`\n${failedPinned.length} "pinned" check(s) failed:`);
    for (const row of failedPinned) {
      console.error(`  - ${row.country}: ${row.error}`);
    }
  }

  process.exitCode = decideExitCode(rows);
}

main().catch((error) => {
  console.error('schema-canary failed:', error);
  process.exitCode = 1;
});

#!/usr/bin/env tsx
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
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
  baselineExists,
  baselinePath,
  previousBaselineVersion,
} from './schema-snapshot/baselines';
import {
  diffFingerprints,
  fingerprintSchema,
  FingerprintChange,
  formatChanges,
  SchemaFingerprint,
} from './schema-snapshot/behaviour';
import { mapWithConcurrency } from './map-with-concurrency';
import {
  buildProvenance,
  describeProvenanceDrift,
} from './schema-snapshot/provenance';
import { assertServedVersion } from './schema-snapshot/served-version';
import { resolvePinnedVersion } from './schema-canary/pinned-versions';
import {
  archiveEmployment,
  seedEmploymentWithDetails,
} from './schema-canary/seed-employment';
import {
  findSkipEntry,
  SCHEMA_CANARY_SKIP_LIST,
} from './schema-canary/skip-list';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.sandbox') });

const BASELINE_DIR = path.resolve(
  __dirname,
  '..',
  'snapshots',
  'contract-details',
);

const args: Record<string, string | true> = {};
for (const raw of process.argv.slice(2)) {
  const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
  if (match) {
    args[match[1]] = match[2] ?? true;
  }
}
const UPDATE = args.update === true;
const CREATE_MISSING = args['create-missing'] === true;
const SUMMARY_OUT =
  typeof args['summary-out'] === 'string' ? args['summary-out'] : undefined;
const COUNTRY_FILTER =
  typeof args.country === 'string' ? args.country.toUpperCase() : undefined;
const FAILURES_OUT =
  typeof args['failures-out'] === 'string' ? args['failures-out'] : undefined;
const CONCURRENCY =
  typeof args.concurrency === 'string' ? Number(args.concurrency) : 6;
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1) {
  throw new Error(
    `--concurrency must be a positive integer, got ${args.concurrency}`,
  );
}

type CountryResult = {
  country: string;
  version: number;
  status:
    | 'unchanged'
    | 'changed'
    | 'updated'
    | 'created'
    | 'no-baseline'
    | 'error';
  changes: FingerprintChange[];
  provenanceDrift?: string[];
  previousVersion?: number;
  error?: string;
};

const writtenFiles: string[] = [];

function readBaseline(country: string, version: number): SchemaFingerprint {
  return JSON.parse(
    readFileSync(baselinePath(BASELINE_DIR, country, version), 'utf8'),
  ) as SchemaFingerprint;
}

function writeBaseline(
  country: string,
  version: number,
  fingerprint: SchemaFingerprint,
) {
  mkdirSync(BASELINE_DIR, { recursive: true });
  const file = baselinePath(BASELINE_DIR, country, version);
  writeFileSync(file, `${JSON.stringify(fingerprint, null, 2)}\n`);
  writtenFiles.push(file);
}

async function fetchPinnedSchema(
  client: Client,
  country: string,
  version: number,
  employmentId: string,
): Promise<Record<string, unknown>> {
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
  if (response.error || !response.data?.data) {
    throw new Error(
      `GET /v1/countries/${country}/contract_details?json_schema_version=${version} failed`,
    );
  }
  assertServedVersion(response.response?.headers, country, version);
  return withJobTitleEligibilityRiskAcknowledgement(response.data.data);
}

async function checkCountry(
  client: Client,
  country: string,
): Promise<CountryResult> {
  const version = resolvePinnedVersion(country, DEFAULT_VERSION);
  let employmentId: string | undefined;
  try {
    const seeded = await seedEmploymentWithDetails(client, country);
    employmentId = seeded.employmentId;
    const schema = await fetchPinnedSchema(
      client,
      country,
      version,
      employmentId,
    );
    const fingerprint: SchemaFingerprint = {
      ...(await fingerprintSchema(schema, getContractDetailsStrategy(country))),
      provenance: buildProvenance(schema, seeded.basicInformation),
    };

    if (UPDATE) {
      writeBaseline(country, version, fingerprint);
      return { country, version, status: 'updated', changes: [] };
    }
    if (!baselineExists(BASELINE_DIR, country, version)) {
      if (!CREATE_MISSING) {
        return { country, version, status: 'no-baseline', changes: [] };
      }
      const previousVersion = previousBaselineVersion(
        BASELINE_DIR,
        country,
        version,
      );
      const changes =
        previousVersion === undefined
          ? []
          : diffFingerprints(
              readBaseline(country, previousVersion),
              fingerprint,
            );
      writeBaseline(country, version, fingerprint);
      return { country, version, status: 'created', changes, previousVersion };
    }
    const baseline = readBaseline(country, version);
    const changes = diffFingerprints(baseline, fingerprint);
    return {
      country,
      version,
      status: changes.length > 0 ? 'changed' : 'unchanged',
      changes,
      provenanceDrift:
        changes.length > 0 && fingerprint.provenance
          ? describeProvenanceDrift(baseline.provenance, fingerprint.provenance)
          : undefined,
    };
  } catch (error) {
    return {
      country,
      version,
      status: 'error',
      changes: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (employmentId) {
      try {
        await archiveEmployment(client, employmentId);
      } catch (error) {
        console.warn(
          `[${country}] failed to archive employment ${employmentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}

function hasBreaking(result: CountryResult) {
  return (
    result.status === 'changed' &&
    result.changes.some((change) => change.severity === 'breaking')
  );
}

function describeCreated(result: CountryResult): string {
  if (result.previousVersion === undefined) {
    return `Baseline added for v${result.version}. There was no earlier baseline to compare it with.`;
  }
  const comparison =
    result.changes.length > 0
      ? `Compared with v${result.previousVersion}:\n\n${formatChanges(result.changes)}`
      : `It behaves the same as v${result.previousVersion}.`;
  return `Baseline added for v${result.version}. ${comparison}`;
}

function formatReport(results: CountryResult[]): string {
  const lines: string[] = [];
  for (const result of results) {
    const heading = `### ${result.country} (pinned v${result.version})`;
    if (result.status === 'changed') {
      lines.push(heading, formatChanges(result.changes), '');
      if (result.provenanceDrift) {
        lines.push(...result.provenanceDrift.map((line) => `> ${line}`), '');
      }
    } else if (result.status === 'created') {
      lines.push(heading, describeCreated(result), '');
    } else if (result.status === 'no-baseline') {
      lines.push(
        heading,
        'No baseline for this version. Run `pnpm run schema-snapshot --update` and commit the result.',
        '',
      );
    } else if (result.status === 'error') {
      lines.push(heading, `Could not be checked: ${result.error}`, '');
    }
  }
  return lines.join('\n');
}

async function main() {
  const { VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REFRESH_TOKEN } =
    process.env;
  if (!VITE_CLIENT_ID || !VITE_CLIENT_SECRET || !VITE_REFRESH_TOKEN) {
    throw new Error(
      'Missing VITE_CLIENT_ID, VITE_CLIENT_SECRET, or VITE_REFRESH_TOKEN (set them in .env.sandbox at the repo root, or as env vars)',
    );
  }
  const client = createSandboxClient(
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_REFRESH_TOKEN,
  );

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
    .filter((code) => !COUNTRY_FILTER || code === COUNTRY_FILTER)
    .filter((code) => !findSkipEntry(SCHEMA_CANARY_SKIP_LIST, code, 'pinned'))
    .filter(
      (code) =>
        !CREATE_MISSING ||
        !baselineExists(
          BASELINE_DIR,
          code,
          resolvePinnedVersion(code, DEFAULT_VERSION),
        ),
    );
  if (countries.length === 0) {
    if (CREATE_MISSING) {
      console.log('Every pinned version already has a baseline.');
      return;
    }
    throw new Error('No EOR onboarding countries to check');
  }

  const results = await mapWithConcurrency(countries, CONCURRENCY, (country) =>
    checkCountry(client, country),
  );

  if (writtenFiles.length > 0) {
    execFileSync('pnpm', ['exec', 'oxfmt', ...writtenFiles], {
      stdio: 'inherit',
    });
  }

  const report = formatReport(results);
  const count = (status: CountryResult['status']) =>
    results.filter((result) => result.status === status).length;
  const summary = `${count('unchanged')} unchanged, ${count('changed')} changed, ${count('updated')} updated, ${count('created')} created, ${count('no-baseline')} without baseline, ${count('error')} errors (${results.length} countries)`;
  console.log(report || 'No differences from the committed baselines.');
  console.log(`\n${summary}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Contract details schema snapshots\n\n${summary}\n\n${report}\n`,
    );
  }
  const failing = results.filter(
    (result) =>
      hasBreaking(result) ||
      result.status === 'no-baseline' ||
      result.status === 'error',
  );
  if (FAILURES_OUT) {
    writeFileSync(FAILURES_OUT, formatReport(failing));
  }
  if (SUMMARY_OUT) {
    writeFileSync(
      SUMMARY_OUT,
      formatReport(results.filter((result) => result.status === 'created')),
    );
  }
  process.exitCode = failing.length > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error('schema-snapshot failed:', error);
  process.exitCode = 1;
});

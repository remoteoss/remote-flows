#!/usr/bin/env tsx
import {
  appendFileSync,
  existsSync,
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
  diffFingerprints,
  fingerprintSchema,
  FingerprintChange,
  formatChanges,
  SchemaFingerprint,
} from './schema-canary/behaviour';
import { mapWithConcurrency } from './schema-canary/lib';
import { resolvePinnedVersion } from './schema-canary/pinned-versions';
import {
  archiveEmployment,
  seedEmploymentForCountry,
} from './schema-canary/seed-employment';
import {
  findSkipEntry,
  SCHEMA_CANARY_SKIP_LIST,
} from './schema-canary/skip-list';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.sandbox') });

const BASELINE_DIR = path.resolve(
  __dirname,
  'schema-baselines',
  'contract_details',
);

const args: Record<string, string | true> = {};
for (const raw of process.argv.slice(2)) {
  const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
  if (match) {
    args[match[1]] = match[2] ?? true;
  }
}
const UPDATE = args.update === true;
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
  status: 'unchanged' | 'changed' | 'updated' | 'no-baseline' | 'error';
  changes: FingerprintChange[];
  error?: string;
};

function baselinePath(country: string, version: number) {
  return path.join(BASELINE_DIR, `${country}.v${version}.json`);
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
  return withJobTitleEligibilityRiskAcknowledgement(response.data.data);
}

async function checkCountry(
  client: Client,
  country: string,
): Promise<CountryResult> {
  const version = resolvePinnedVersion(country, DEFAULT_VERSION);
  let employmentId: string | undefined;
  try {
    employmentId = await seedEmploymentForCountry(client, country);
    const schema = await fetchPinnedSchema(
      client,
      country,
      version,
      employmentId,
    );
    const fingerprint = await fingerprintSchema(
      schema,
      getContractDetailsStrategy(country),
    );
    const file = baselinePath(country, version);

    if (UPDATE) {
      mkdirSync(BASELINE_DIR, { recursive: true });
      writeFileSync(file, `${JSON.stringify(fingerprint, null, 2)}\n`);
      return { country, version, status: 'updated', changes: [] };
    }
    if (!existsSync(file)) {
      return { country, version, status: 'no-baseline', changes: [] };
    }
    const baseline = JSON.parse(
      readFileSync(file, 'utf8'),
    ) as SchemaFingerprint;
    const changes = diffFingerprints(baseline, fingerprint);
    return {
      country,
      version,
      status: changes.length > 0 ? 'changed' : 'unchanged',
      changes,
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
  return result.changes.some((change) => change.severity === 'breaking');
}

function formatReport(results: CountryResult[]): string {
  const lines: string[] = [];
  for (const result of results) {
    const heading = `### ${result.country} (pinned v${result.version})`;
    if (result.status === 'changed') {
      lines.push(heading, formatChanges(result.changes), '');
    } else if (result.status === 'no-baseline') {
      lines.push(
        heading,
        'No baseline for this version. Run `npm run schema-snapshot -- --update` and commit the result.',
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
    .filter((code) => !findSkipEntry(SCHEMA_CANARY_SKIP_LIST, code, 'pinned'));
  if (countries.length === 0) {
    throw new Error('No EOR onboarding countries to check');
  }

  const results = await mapWithConcurrency(countries, CONCURRENCY, (country) =>
    checkCountry(client, country),
  );

  const report = formatReport(results);
  const count = (status: CountryResult['status']) =>
    results.filter((result) => result.status === status).length;
  const summary = `${count('unchanged')} unchanged, ${count('changed')} changed, ${count('updated')} updated, ${count('no-baseline')} without baseline, ${count('error')} errors (${results.length} countries)`;
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
  process.exitCode = failing.length > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error('schema-snapshot failed:', error);
  process.exitCode = 1;
});

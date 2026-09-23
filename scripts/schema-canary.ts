#!/usr/bin/env tsx
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getV1Countries, getV1CountriesCountryCodeForm } from '@/src/client';
import { Client } from '@/src/client/client';
import { DEFAULT_VERSION } from '@/src/flows/Onboarding/utils';
import { createSandboxClient } from './schema-canary/auth';
import {
  checkSchemaBuildsAndValidates,
  decideExitCode,
  formatSummaryTable,
  isSkipped,
  resolveEngine,
  SchemaCanaryRow,
  SchemaCheckType,
} from './schema-canary/lib';
import { resolvePinnedVersion } from './schema-canary/pinned-versions';
import { SCHEMA_CANARY_SKIP_LIST } from './schema-canary/skip-list';
import { DRY_RUN_FIXTURES } from './schema-canary/dry-run-fixtures';

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
const DRY_RUN = args['dry-run'] === true;
const CHECK_TYPES: SchemaCheckType[] = ['pinned', 'latest'];

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

async function fetchLiveSchema(
  client: Client,
  country: string,
  version: number | 'latest',
): Promise<Record<string, unknown> | null> {
  const response = await getV1CountriesCountryCodeForm({
    client,
    headers: { Authorization: '' },
    path: { country_code: country, form: 'contract_details' },
    query: { skip_benefits: true, json_schema_version: version },
  });
  if (response.error || !response.data) {
    throw new Error(
      `GET /v1/countries/${country}/contract_details?json_schema_version=${version} failed`,
    );
  }
  return response.data.data as Record<string, unknown>;
}

async function runLive(): Promise<SchemaCanaryRow[]> {
  const clientId = process.env.SANDBOX_CLIENT_ID;
  const clientSecret = process.env.SANDBOX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing SANDBOX_CLIENT_ID or SANDBOX_CLIENT_SECRET (set them in .env.sandbox at the repo root, or as env vars)',
    );
  }

  const client = createSandboxClient(clientId, clientSecret);
  const countries = await fetchLiveCountries(client);
  const rows: SchemaCanaryRow[] = [];

  for (const country of countries) {
    const engine = resolveEngine(country);
    for (const check of CHECK_TYPES) {
      const skipEntry = isSkipped(SCHEMA_CANARY_SKIP_LIST, country, check);
      const version =
        check === 'pinned'
          ? resolvePinnedVersion(country, DEFAULT_VERSION)
          : 'latest';

      if (skipEntry) {
        rows.push({
          country,
          version,
          engine,
          check,
          outcome: 'skip',
          error: skipEntry.reason,
        });
        continue;
      }

      try {
        const schema = await fetchLiveSchema(client, country, version);
        const result = checkSchemaBuildsAndValidates(schema);
        rows.push({
          country,
          version,
          engine,
          check,
          outcome: result.ok ? 'pass' : 'fail',
          error: result.ok ? undefined : result.error,
        });
      } catch (error) {
        rows.push({
          country,
          version,
          engine,
          check,
          outcome: 'fail',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return rows;
}

function runDryRun(): SchemaCanaryRow[] {
  const rows: SchemaCanaryRow[] = [];
  const fixtures = DRY_RUN_FIXTURES.filter(
    (fixture) => !COUNTRY_FILTER || fixture.country === COUNTRY_FILTER,
  );

  for (const fixture of fixtures) {
    const engine = resolveEngine(fixture.country);
    for (const check of CHECK_TYPES) {
      const result = checkSchemaBuildsAndValidates(fixture.schema);
      rows.push({
        country: fixture.country,
        version: fixture.version,
        engine,
        check,
        outcome: result.ok ? 'pass' : 'fail',
        error: result.ok ? undefined : result.error,
      });
    }
  }

  return rows;
}

function report(rows: SchemaCanaryRow[]) {
  const table = formatSummaryTable(rows);
  console.log(table);

  const passCount = rows.filter((row) => row.outcome === 'pass').length;
  const failCount = rows.filter((row) => row.outcome === 'fail').length;
  const skipCount = rows.filter((row) => row.outcome === 'skip').length;
  console.log(
    `\n${passCount} passed, ${failCount} failed, ${skipCount} skipped (${rows.length} checks total)`,
  );

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(
      summaryPath,
      `## Contract details schema canary\n\n${table}\n`,
    );
  }
}

async function main() {
  const rows = DRY_RUN ? runDryRun() : await runLive();
  report(rows);

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

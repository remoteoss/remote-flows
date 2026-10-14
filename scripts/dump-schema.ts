#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getV1CountriesCountryCodeForm } from '@/src/client';
import { createSandboxClient } from './schema-canary/auth';
import {
  archiveEmployment,
  seedEmploymentForCountry,
} from './schema-canary/seed-employment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.sandbox') });

const args: Record<string, string> = {};
for (const raw of process.argv.slice(2)) {
  const match = raw.match(/^--([^=]+)=(.*)$/);
  if (match) {
    args[match[1]] = match[2];
  }
}
const country = args.country?.toUpperCase();
const form = args.form ?? 'contract_details';
const version: number | 'latest' =
  args.version === undefined || args.version === 'latest'
    ? 'latest'
    : Number(args.version);
if (version !== 'latest' && !Number.isInteger(version)) {
  throw new Error(
    `--version must be an integer or 'latest', got ${args.version}`,
  );
}
const outDir = args.out ?? path.resolve(__dirname, '..', '.schema-dumps');
if (!country) {
  throw new Error('--country=XXX is required');
}

const { VITE_CLIENT_ID, REMOTE_CLIENT_SECRET, REMOTE_REFRESH_TOKEN } =
  process.env;
if (!VITE_CLIENT_ID || !REMOTE_CLIENT_SECRET || !REMOTE_REFRESH_TOKEN) {
  throw new Error(
    'Missing VITE_CLIENT_ID, REMOTE_CLIENT_SECRET or REMOTE_REFRESH_TOKEN in .env.sandbox',
  );
}
const client = createSandboxClient(
  VITE_CLIENT_ID,
  REMOTE_CLIENT_SECRET,
  REMOTE_REFRESH_TOKEN,
);

let employmentId: string | undefined;
try {
  if (form === 'contract_details') {
    employmentId = await seedEmploymentForCountry(client, country);
  }
  const response = await getV1CountriesCountryCodeForm({
    client,
    headers: { Authorization: '' },
    path: { country_code: country, form },
    query: {
      skip_benefits: true,
      ...(employmentId ? { employment_id: employmentId } : {}),
      json_schema_version: version,
    },
  });
  if (response.error || !response.data) {
    throw new Error(`Fetch failed: ${JSON.stringify(response.error)}`);
  }
  mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${country}.${form}.v${version}.json`);
  writeFileSync(file, JSON.stringify(response.data.data, null, 2));
  console.log(`Wrote ${file}`);
} finally {
  if (employmentId) {
    try {
      await archiveEmployment(client, employmentId);
    } catch (error) {
      console.warn(
        `Failed to archive employment ${employmentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

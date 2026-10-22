#!/usr/bin/env tsx
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getV1CountriesCountryCodeForm } from '@/src/client';
import { ONBOARDING_JSON_SCHEMA_VERSION } from '../example/src/flows/Onboarding/jsonSchemaVersions';
import { createEnvClient } from './schema-canary/auth';
import {
  archiveEmployment,
  seedEmploymentForCountry,
} from './schema-canary/seed-employment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const args: Record<string, string> = {};
for (const raw of process.argv.slice(2)) {
  const match = raw.match(/^--([^=]+)=(.*)$/);
  if (match) {
    args[match[1]] = match[2];
  }
}
const envName = args.env ?? 'sandbox';
const envFile = path.resolve(__dirname, '..', `.env.${envName}`);
if (!existsSync(envFile)) {
  throw new Error(`--env=${envName}: ${envFile} does not exist.`);
}
dotenv.config({ path: envFile, override: true });
const country = args.country?.toUpperCase();
const FORM_ALIASES: Record<string, string> = {
  basic_information: 'employment_basic_information',
};
const requestedForm = args.form ?? 'contract_details';
const form = FORM_ALIASES[requestedForm] ?? requestedForm;
const defaultVersion: number | 'latest' =
  form === 'employment_basic_information'
    ? ONBOARDING_JSON_SCHEMA_VERSION.employment_basic_information
    : 'latest';
const version: number | 'latest' =
  args.version === undefined
    ? defaultVersion
    : args.version === 'latest'
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

const { buildGatewayURL } = require('../example/api/utils.js') as {
  buildGatewayURL: () => string | undefined;
};
const { fetchAccessToken } = require('../example/api/get_token.js') as {
  fetchAccessToken: () => Promise<{ accessToken: string; expiresIn?: number }>;
};
const gatewayUrl = buildGatewayURL();
if (!gatewayUrl) {
  throw new Error(`${envFile} doesn't set VITE_REMOTE_GATEWAY.`);
}
console.log(`Environment: ${envName} -> ${gatewayUrl} (from ${envFile})`);
const client = createEnvClient(gatewayUrl, fetchAccessToken);

let employmentId: string | undefined;
try {
  if (form === 'contract_details') {
    ({ employmentId } = await seedEmploymentForCountry(client, country));
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
    throw new Error(
      `Fetch failed for form '${form}' (HTTP ${response.response?.status}): ${JSON.stringify(response.error)}. Use the gateway form name, e.g. contract_details or employment_basic_information.`,
    );
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

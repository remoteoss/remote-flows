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
  if (match) args[match[1]] = match[2];
}
const country = args.country?.toUpperCase();
const form = args.form ?? 'contract_details';
const version = args.version ?? 'latest';
const outDir = args.out ?? path.resolve(__dirname, '..', '.schema-dumps');
if (!country) throw new Error('--country=XXX is required');

const HTML = /<\/?[a-z][\s\S]*?>/i;

function findHtml(node: unknown, trail: string[], hits: string[]) {
  if (typeof node === 'string') {
    if (HTML.test(node)) {
      hits.push(
        `${trail.join('.')}: ${node.replace(/\s+/g, ' ').slice(0, 120)}`,
      );
    }
  } else if (Array.isArray(node)) {
    node.forEach((item, i) => findHtml(item, [...trail, String(i)], hits));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      findHtml(value, [...trail, key], hits);
    }
  }
}

const { VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REFRESH_TOKEN } = process.env;
if (!VITE_CLIENT_ID || !VITE_CLIENT_SECRET || !VITE_REFRESH_TOKEN) {
  throw new Error(
    'Missing VITE_CLIENT_ID/SECRET/REFRESH_TOKEN in .env.sandbox',
  );
}
const client = createSandboxClient(
  VITE_CLIENT_ID,
  VITE_CLIENT_SECRET,
  VITE_REFRESH_TOKEN,
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
      json_schema_version: version as never,
    },
  });
  if (response.error || !response.data) {
    throw new Error(`Fetch failed: ${JSON.stringify(response.error)}`);
  }
  mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${country}.${form}.v${version}.json`);
  writeFileSync(file, JSON.stringify(response.data.data, null, 2));
  const hits: string[] = [];
  findHtml(response.data.data, [], hits);
  console.log(`Wrote ${file}`);
  console.log(`${hits.length} string(s) containing HTML:`);
  hits.forEach((hit) => console.log(`  ${hit}`));
} finally {
  if (employmentId) await archiveEmployment(client, employmentId);
}

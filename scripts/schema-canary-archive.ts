#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createSandboxClient } from './schema-canary/auth';
import { KeptEmployment } from './schema-canary/kept-employments';
import { mapWithConcurrency } from './schema-canary/lib';
import { archiveEmployment } from './schema-canary/seed-employment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.sandbox') });

const fromArg = process.argv.find((arg) => arg.startsWith('--from='));
if (!fromArg) {
  throw new Error('Usage: npm run schema-canary:archive -- --from=<file>');
}
const kept = JSON.parse(
  readFileSync(fromArg.slice('--from='.length), 'utf8'),
) as KeptEmployment[];

const { VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REFRESH_TOKEN } = process.env;
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

const failures = (
  await mapWithConcurrency(kept, 6, async ({ country, employmentId }) => {
    try {
      await archiveEmployment(client, employmentId);
      console.log(`[${country}] archived employment ${employmentId}`);
      return null;
    } catch (error) {
      console.warn(
        `[${country}] failed to archive employment ${employmentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return employmentId;
    }
  })
).filter(Boolean);

process.exitCode = failures.length > 0 ? 1 : 0;

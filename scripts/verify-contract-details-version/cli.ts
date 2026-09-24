#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');

function printUsageAndExit(): never {
  console.error(
    'Usage: npm run verify:contract-details -- --country=<ISO3> --version=<n> [--pass=required|full|both]',
  );
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    country: { type: 'string' },
    version: { type: 'string' },
    pass: { type: 'string', default: 'both' },
  },
});

const country = values.country;
const version = values.version;
const pass = String(values.pass);

if (!country || !version) {
  printUsageAndExit();
}

if (pass !== 'required' && pass !== 'full' && pass !== 'both') {
  printUsageAndExit();
}

const result = spawnSync(
  'npx',
  ['vitest', 'run', '--config', 'vitest.verify-contract-details.config.ts'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      VERIFY_COUNTRY: country.toUpperCase(),
      VERIFY_VERSION: version,
      VERIFY_PASS: pass,
    },
  },
);

process.exit(result.status ?? 1);

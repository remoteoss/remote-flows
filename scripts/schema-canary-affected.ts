#!/usr/bin/env tsx
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  affectedCountries,
  COUNTRY_SCOPED_FILES,
  FileExports,
} from './schema-canary/affected-countries';

const baseArg = process.argv.find((arg) => arg.startsWith('--base='));
if (!baseArg) {
  throw new Error('Usage: npm run schema-canary:affected -- --base=<git ref>');
}
const base = baseArg.slice('--base='.length);

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' });

async function exportsAt(
  ref: string | undefined,
  file: string,
): Promise<FileExports | undefined> {
  if (!ref) return import(pathToFileURL(path.resolve(file)).href);
  let source: string;
  try {
    source = git('show', `${ref}:${file}`);
  } catch {
    return undefined;
  }
  const copy = path.join(
    mkdtempSync(path.join(tmpdir(), 'schema-canary-')),
    path.basename(file),
  );
  writeFileSync(copy, source);
  return import(pathToFileURL(copy).href);
}

const changed = git('diff', '--name-only', `${base}...HEAD`)
  .split('\n')
  .filter(Boolean);

const files = await Promise.all(
  changed.map(async (file) =>
    COUNTRY_SCOPED_FILES[file]
      ? {
          path: file,
          before: await exportsAt(base, file),
          after: await exportsAt(undefined, file),
        }
      : { path: file },
  ),
);

const result = affectedCountries(files);
const countries = result === 'all' ? 'all' : result.join(',');
console.log(`Affected countries: ${countries || 'none'}`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `countries=${countries}\n`);
}

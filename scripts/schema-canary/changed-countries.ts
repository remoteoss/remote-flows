#!/usr/bin/env tsx
import { execFileSync } from 'node:child_process';

const VERSIONS_FILE = 'example/src/flows/Onboarding/jsonSchemaVersions.ts';
const BASE_REF = 'HEAD^1';

// Keep in sync with `pull_request.paths` in .github/workflows/schema-canary.yml.
// Files outside this list (docs, e2e, example app) cannot change canary results.
const OTHER_INPUTS = [
  'package-lock.json',
  'src/common/createHeadlessForm.tsx',
  'src/common/headlessForm.ts',
  'src/components/form/utils.ts',
  'src/flows/Onboarding/utils.ts',
  'scripts/contract-details-seeds.ts',
  'scripts/fill-schema.ts',
  'scripts/schema-canary.ts',
  '.github/workflows/schema-canary.yml',
];
const OTHER_INPUT_PREFIX = 'scripts/schema-canary/';

export function touchesOtherInputs(changedFiles: string[]): boolean {
  return changedFiles.some(
    (file) =>
      file !== VERSIONS_FILE &&
      (OTHER_INPUTS.includes(file) || file.startsWith(OTHER_INPUT_PREFIX)),
  );
}

const ENTRY_PATTERN =
  /^ {2}([A-Z]{3}): \{\n(?:\s*\/\/[^\n]*\n)?\s*contract_details: (\d+),/gm;

export function parsePinnedVersions(source: string): Map<string, number> {
  const versions = new Map<string, number>();
  for (const match of source.matchAll(ENTRY_PATTERN)) {
    versions.set(match[1], Number(match[2]));
  }
  return versions;
}

export function changedCountries(
  baseSource: string,
  headSource: string,
): string[] {
  const base = parsePinnedVersions(baseSource);
  return [...parsePinnedVersions(headSource)]
    .filter(([country, version]) => base.get(country) !== version)
    .map(([country]) => country)
    .sort();
}

function git(...args: string[]) {
  return execFileSync('git', args, { encoding: 'utf-8' });
}

function main() {
  const changedFiles = git('diff', '--name-only', BASE_REF, 'HEAD')
    .split('\n')
    .filter(Boolean);
  if (
    touchesOtherInputs(changedFiles) ||
    !changedFiles.includes(VERSIONS_FILE)
  ) {
    console.log('all');
    return;
  }
  const countries = changedCountries(
    git('show', `${BASE_REF}:${VERSIONS_FILE}`),
    git('show', `HEAD:${VERSIONS_FILE}`),
  );
  console.log(countries.length > 0 ? countries.join(',') : 'none');
}

if (process.argv[1]?.endsWith('changed-countries.ts')) {
  main();
}

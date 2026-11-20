import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const CORE_DIR = 'packages/core';

export function getLastReleaseTag(cwd = process.cwd()): string | null {
  try {
    return execFileSync(
      'git',
      ['describe', '--tags', '--abbrev=0', '--match', 'v*'],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
  } catch {
    return null;
  }
}

export function hasCoreChangedSince(tag: string, cwd = process.cwd()): boolean {
  try {
    execFileSync('git', ['diff', '--quiet', tag, '--', CORE_DIR], {
      cwd,
      stdio: 'ignore',
    });
    return false;
  } catch (error) {
    if ((error as { status?: number }).status === 1) {
      return true;
    }
    throw error;
  }
}

export function setCoreVersion(version: string, cwd = process.cwd()): void {
  const file = path.join(cwd, CORE_DIR, 'package.json');
  const packageJson = JSON.parse(readFileSync(file, 'utf8'));
  packageJson.version = version;
  writeFileSync(file, JSON.stringify(packageJson, null, 2) + '\n');
}

export function bumpCoreIfChanged(
  version: string,
  cwd = process.cwd(),
): boolean {
  const tag = getLastReleaseTag(cwd);
  if (tag && !hasCoreChangedSince(tag, cwd)) {
    console.log(`📦 Core unchanged since ${tag}, not bumping it`);
    return false;
  }
  setCoreVersion(version, cwd);
  console.log(
    `📦 Core changed since ${tag ?? 'the start'}: bumped to ${version}`,
  );
  return true;
}

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { bumpVersion, VersionBump } from './release-changelog';

const CORE_DIR = 'packages/core';

export function getLastReleaseTag(cwd = process.cwd()): string | null {
  const tags = execFileSync(
    'git',
    ['tag', '--merged', 'HEAD', '--list', 'v*', '--sort=-v:refname'],
    { cwd, encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean);
  return tags[0] ?? null;
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

const VERSION_PATTERN =
  /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function parseVersion(version: string) {
  const match = VERSION_PATTERN.exec(version);
  if (!match) {
    return null;
  }
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function comparePrerelease(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) {
    return b.length - a.length;
  }
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) {
      return -1;
    }
    if (b[i] === undefined) {
      return 1;
    }
    const aNumeric = /^\d+$/.test(a[i]);
    const bNumeric = /^\d+$/.test(b[i]);
    if (aNumeric && bNumeric && Number(a[i]) !== Number(b[i])) {
      return Number(a[i]) - Number(b[i]);
    }
    if (aNumeric !== bNumeric) {
      return aNumeric ? -1 : 1;
    }
    if (!aNumeric && a[i] !== b[i]) {
      return a[i] < b[i] ? -1 : 1;
    }
  }
  return 0;
}

export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) {
    throw new Error(`Cannot compare "${a}" and "${b}": not valid versions`);
  }
  for (let i = 0; i < 3; i++) {
    if (left.core[i] !== right.core[i]) {
      return left.core[i] - right.core[i];
    }
  }
  return comparePrerelease(left.prerelease, right.prerelease);
}

export function suggestCoreVersion(
  current: string,
  sdkBump: VersionBump,
): string {
  const parsed = parseVersion(current);
  if (!parsed) {
    throw new Error(`Core version "${current}" is not a valid version`);
  }
  const last = parsed.prerelease[parsed.prerelease.length - 1];
  if (parsed.prerelease.length > 0 && /^\d+$/.test(last)) {
    const base = current.slice(0, current.length - last.length);
    return `${base}${Number(last) + 1}`;
  }
  if (parsed.prerelease.length > 0) {
    return `${current}.1`;
  }
  return bumpVersion(current, sdkBump);
}

export function validateCoreVersion(
  next: string,
  current: string,
): string | null {
  if (!parseVersion(next)) {
    return `"${next}" is not a valid version (expected e.g. 0.0.1-alpha.3 or 1.2.3)`;
  }
  if (compareVersions(next, current) <= 0) {
    return `"${next}" must be greater than the current core version ${current}`;
  }
  return null;
}

export function readCoreVersion(cwd = process.cwd()): string {
  const file = path.join(cwd, CORE_DIR, 'package.json');
  return JSON.parse(readFileSync(file, 'utf8')).version;
}

export async function bumpCoreIfChanged(
  sdkBump: VersionBump,
  ask: (question: string) => Promise<string>,
  cwd = process.cwd(),
): Promise<string | null> {
  const tag = getLastReleaseTag(cwd);
  if (tag && !hasCoreChangedSince(tag, cwd)) {
    console.log(`📦 Core unchanged since ${tag}, not bumping it`);
    return null;
  }

  const current = readCoreVersion(cwd);
  const suggested = suggestCoreVersion(current, sdkBump);
  console.log(
    `📦 Core changed since ${tag ?? 'the start'} (currently ${current})`,
  );

  for (;;) {
    const answer = (await ask(`New core version [${suggested}]: `)).trim();
    const next = answer === '' ? suggested : answer;
    const error = validateCoreVersion(next, current);
    if (!error) {
      setCoreVersion(next, cwd);
      console.log(`📦 Core bumped: ${current} → ${next}`);
      return next;
    }
    console.log(`❌ ${error}`);
  }
}

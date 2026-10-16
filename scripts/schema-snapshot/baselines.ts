import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export function baselinePath(dir: string, country: string, version: number) {
  return path.join(dir, `${country}.v${version}.json`);
}

export function baselineExists(dir: string, country: string, version: number) {
  return existsSync(baselinePath(dir, country, version));
}

export function listBaselineVersions(dir: string, country: string): number[] {
  if (!existsSync(dir)) {
    return [];
  }
  const pattern = new RegExp(`^${country}\\.v(\\d+)\\.json$`);
  return readdirSync(dir)
    .map((file) => pattern.exec(file)?.[1])
    .filter((version): version is string => version !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
}

export function previousBaselineVersion(
  dir: string,
  country: string,
  version: number,
): number | undefined {
  return listBaselineVersions(dir, country)
    .filter((candidate) => candidate < version)
    .pop();
}

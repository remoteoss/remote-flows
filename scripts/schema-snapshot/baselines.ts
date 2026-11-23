import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

function trackName(country: string, model?: string) {
  return model ? `${country}.${model}` : country;
}

export function baselinePath(
  dir: string,
  country: string,
  version: number,
  model?: string,
) {
  return path.join(dir, `${trackName(country, model)}.v${version}.json`);
}

export function baselineExists(
  dir: string,
  country: string,
  version: number,
  model?: string,
) {
  return existsSync(baselinePath(dir, country, version, model));
}

export function listBaselineVersions(
  dir: string,
  country: string,
  model?: string,
): number[] {
  if (!existsSync(dir)) {
    return [];
  }
  const pattern = new RegExp(`^${trackName(country, model)}\\.v(\\d+)\\.json$`);
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
  model?: string,
): number | undefined {
  return listBaselineVersions(dir, country, model)
    .filter((candidate) => candidate < version)
    .pop();
}

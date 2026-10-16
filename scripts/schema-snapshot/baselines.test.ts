import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  baselineExists,
  listBaselineVersions,
  previousBaselineVersion,
} from './baselines';

describe('schema baselines', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), 'schema-baselines-'));
    for (const file of [
      'ESP.v6.json',
      'ESP.v7.json',
      'ESP2.v9.json',
      'PRT.v1.json',
    ]) {
      writeFileSync(path.join(dir, file), '{}');
    }
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('lists only the versions of the given country, in order', () => {
    expect(listBaselineVersions(dir, 'ESP')).toEqual([6, 7]);
    expect(listBaselineVersions(path.join(dir, 'missing'), 'ESP')).toEqual([]);
  });

  it('finds the closest lower version to compare a new baseline against', () => {
    expect(previousBaselineVersion(dir, 'ESP', 8)).toBe(7);
    expect(previousBaselineVersion(dir, 'ESP', 7)).toBe(6);
    expect(previousBaselineVersion(dir, 'ESP', 6)).toBeUndefined();
  });

  it('only matches the exact country and version', () => {
    expect(baselineExists(dir, 'ESP', 7)).toBe(true);
    expect(baselineExists(dir, 'ESP', 8)).toBe(false);
    expect(baselineExists(dir, 'ESP2', 9)).toBe(true);
    expect(baselineExists(dir, 'PRT', 1)).toBe(true);
  });
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOverride } from '@/scripts/verify-contract-details-version/overrides';

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures/overrides',
);

describe('loadOverride', () => {
  it('returns the override module default when a file exists for the country', async () => {
    const override = await loadOverride('ZZZ', fixturesDir);
    expect(override).toEqual({ annual_gross_salary: 5_000_000 });
  });

  it('is case-insensitive on the country code', async () => {
    const override = await loadOverride('zzz', fixturesDir);
    expect(override).toEqual({ annual_gross_salary: 5_000_000 });
  });

  it('returns an empty object when there is no override for the country', async () => {
    const override = await loadOverride('AAA', fixturesDir);
    expect(override).toEqual({});
  });
});

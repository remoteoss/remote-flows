import {
  basicInfoVersionChanged,
  changedCountries,
  parsePinnedVersions,
  touchesOtherInputs,
} from './changed-countries';

const source = (mex: number, pol = 5) => `export const X = {
  MEX: {
    // Mexico
    contract_details: ${mex},
  },
  MKD: {
    // North Macedonia
    contract_details: 1,
  },
  POL: {
    // Poland
    contract_details: ${pol},
  },
};
`;

describe('parsePinnedVersions', () => {
  it('reads each country pin', () => {
    expect([...parsePinnedVersions(source(8))]).toEqual([
      ['MEX', 8],
      ['MKD', 1],
      ['POL', 5],
    ]);
  });
});

describe('changedCountries', () => {
  it('returns only countries whose pin changed', () => {
    expect(changedCountries(source(2), source(8))).toEqual(['MEX']);
  });

  it('returns every changed country sorted', () => {
    expect(changedCountries(source(2, 1), source(8, 5))).toEqual([
      'MEX',
      'POL',
    ]);
  });

  it('returns nothing when no pin changed', () => {
    expect(changedCountries(source(8), source(8))).toEqual([]);
  });

  it('includes a newly pinned country', () => {
    expect(
      changedCountries(
        source(8).replace(/ {2}POL: \{[\s\S]*?\},\n/, ''),
        source(8),
      ),
    ).toEqual(['POL']);
  });
});

describe('basicInfoVersionChanged', () => {
  const withBasicInfo = (version: number) =>
    `export const V = {\n  employment_basic_information: ${version},\n};\n\n${source(8)}`;

  it('detects a bumped basic information version', () => {
    expect(basicInfoVersionChanged(withBasicInfo(4), withBasicInfo(5))).toBe(
      true,
    );
  });

  it('ignores a file where only a country pin changed', () => {
    expect(
      basicInfoVersionChanged(
        withBasicInfo(4) + source(2),
        withBasicInfo(4) + source(8),
      ),
    ).toBe(false);
  });
});

describe('touchesOtherInputs', () => {
  it('ignores the pins file itself', () => {
    expect(
      touchesOtherInputs([
        'example/src/flows/Onboarding/jsonSchemaVersions.ts',
      ]),
    ).toBe(false);
  });

  it('ignores docs, e2e and example files that are not canary inputs', () => {
    expect(
      touchesOtherInputs([
        'example/src/flows/Onboarding/jsonSchemaVersions.ts',
        'docs/schema-changes/eor/contract-details/countries/PRT.md',
        'example/e2e/onboard-portugal-employee.spec.ts',
        'example/e2e/helpers/onboarding.ts',
      ]),
    ).toBe(false);
  });

  it.each([
    'pnpm-lock.yaml',
    'src/common/createHeadlessForm.tsx',
    'scripts/schema-canary.ts',
    'scripts/schema-canary/lib.ts',
    'example/src/flows/Onboarding/features.ts',
    '.github/workflows/schema-canary.yml',
  ])('treats %s as a canary input', (file) => {
    expect(
      touchesOtherInputs([
        'example/src/flows/Onboarding/jsonSchemaVersions.ts',
        file,
      ]),
    ).toBe(true);
  });
});

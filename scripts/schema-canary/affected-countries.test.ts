import { affectedCountries } from './affected-countries';

const VERSIONS = 'example/src/flows/Onboarding/jsonSchemaVersions.ts';

describe('affectedCountries', () => {
  it('returns only the countries whose pinned version changed', () => {
    expect(
      affectedCountries([
        {
          path: VERSIONS,
          before: {
            ONBOARDING_JSON_SCHEMA_VERSION: { employment_basic_information: 4 },
            ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY: {
              CHN: { contract_details: 7 },
              DEU: { contract_details: 7 },
            },
          },
          after: {
            ONBOARDING_JSON_SCHEMA_VERSION: { employment_basic_information: 4 },
            ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY: {
              CHN: { contract_details: 8 },
              DEU: { contract_details: 7 },
              PRT: { contract_details: 2 },
            },
          },
        },
        { path: 'docs/schema-changes/eor/contract-details/countries/CHN.md' },
        { path: 'src/components/JsonSchemaComparison/schemaVersions.ts' },
      ]),
    ).toEqual(['CHN', 'PRT']);
  });

  it('merges the countries from every per-country file', () => {
    expect(
      affectedCountries([
        {
          path: 'scripts/contract-details-seeds.ts',
          before: { CONTRACT_DETAILS_SEEDS: { JAM: { a: 1 } } },
          after: { CONTRACT_DETAILS_SEEDS: { JAM: { a: 2 } } },
        },
        {
          path: 'scripts/schema-canary/known-unsaved-fields.ts',
          before: { KNOWN_UNSAVED_FIELDS: { GBR: { overtime_eligible: 'x' } } },
          after: { KNOWN_UNSAVED_FIELDS: {} },
        },
      ]),
    ).toEqual(['GBR', 'JAM']);
  });

  it('runs every country when another export of a per-country file changed', () => {
    expect(
      affectedCountries([
        {
          path: VERSIONS,
          before: {
            ONBOARDING_JSON_SCHEMA_VERSION: { employment_basic_information: 4 },
          },
          after: {
            ONBOARDING_JSON_SCHEMA_VERSION: { employment_basic_information: 5 },
          },
        },
      ]),
    ).toBe('all');
  });

  it('runs every country when code the canary depends on changed', () => {
    expect(
      affectedCountries([
        {
          path: VERSIONS,
          before: { ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY: {} },
          after: {
            ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY: {
              CHN: { contract_details: 8 },
            },
          },
        },
        { path: 'example/src/flows/Onboarding/constants.ts' },
      ]),
    ).toBe('all');
  });

  it('returns no countries when nothing the canary reads changed', () => {
    expect(affectedCountries([{ path: 'README.md' }])).toEqual([]);
  });
});

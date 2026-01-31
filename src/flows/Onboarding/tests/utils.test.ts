import { getContractDetailsSchemaVersion } from '../utils';

describe('getContractDetailsSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getContractDetailsSchemaVersion(undefined, 'PRT');

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with country-specific valid version', () => {
    const options = {
      jsonSchemaVersionByCountry: {
        DEU: {
          contract_details: 2,
          employment_basic_information: 2,
        },
      },
    };

    const result = getContractDetailsSchemaVersion(options, 'DEU');

    expect(result).toEqual(2);
  });
});

import { describe, it, expect } from 'vitest';
import { getContractDetailsSchemaVersion } from '../utils';

describe('getContractDetailsSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getContractDetailsSchemaVersion(undefined, null);

    expect(result).toEqual({
      form_schema: {
        contract_details: 1,
      },
    });
  });

  it('should return version 2 for Germany', () => {
    const result = getContractDetailsSchemaVersion(undefined, 'DEU');
    expect(result).toEqual({
      form_schema: {
        contract_details: 2,
      },
    });
  });

  it('should override external jsonSchemaVersion with country-specific version', () => {
    const externalVersion = {
      form_schema: {
        contract_details: 5,
        employment_basic_information: 2,
      },
    };

    const result = getContractDetailsSchemaVersion(externalVersion, null);

    expect(result).toEqual({
      form_schema: {
        contract_details: 1,
        employment_basic_information: 2,
      },
    });
  });
});

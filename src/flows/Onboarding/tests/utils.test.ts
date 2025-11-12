// src/flows/Onboarding/tests/utils.test.ts

import { describe, it, expect } from 'vitest';
import { getContractDetailsSchemaVersion } from '../utils';

describe('getContractDetailsSchemaVersion', () => {
  it('should return version 1 for Germany (DEU)', () => {
    const result = getContractDetailsSchemaVersion('DEU', undefined);

    expect(result).toEqual({
      form_schema: {
        contract_details: 1,
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

    const result = getContractDetailsSchemaVersion('DEU', externalVersion);

    expect(result).toEqual({
      form_schema: {
        contract_details: 1,
        employment_basic_information: 2,
      },
    });
  });

  it('should return undefined for unknown country', () => {
    const result = getContractDetailsSchemaVersion('US', undefined);

    expect(result).toBeUndefined();
  });
});

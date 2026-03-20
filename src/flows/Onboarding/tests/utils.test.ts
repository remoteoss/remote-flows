import {
  getBasicInformationSchemaVersion,
  getBenefitOffersSchemaVersion,
  getContractDetailsSchemaVersion,
} from '../utils';

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
        },
      },
    };

    const result = getContractDetailsSchemaVersion(options, 'DEU');

    expect(result).toEqual(2);
  });
});

describe('getBenefitOffersSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getBenefitOffersSchemaVersion(undefined);

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with version 2', () => {
    const options = {
      jsonSchemaVersion: {
        benefit_offers_form_schema: 2,
      },
    };

    const result = getBenefitOffersSchemaVersion(options);

    expect(result).toEqual(2);
  });
});

describe('getBasicInformationSchemaVersion', () => {
  it('should return version 1 for all countries', () => {
    const result = getBasicInformationSchemaVersion(undefined);

    expect(result).toEqual(1);
  });

  it('should override external jsonSchemaVersion with version 2', () => {
    const options = {
      jsonSchemaVersion: {
        employment_basic_information: 2,
      },
    };

    const result = getBasicInformationSchemaVersion(options);

    expect(result).toEqual(2);
  });
});

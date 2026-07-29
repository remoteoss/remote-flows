import {
  shouldIncludeProduct,
  getBasicInformationSchemaVersion,
} from '../utils';
import { corProductIdentifier, eorProductIdentifier } from '../constants';

describe('shouldIncludeProduct', () => {
  it('should return true when excludeProducts is empty', () => {
    expect(shouldIncludeProduct(eorProductIdentifier, undefined)).toBe(true);
  });

  it('should return false when product is excluded', () => {
    expect(shouldIncludeProduct(eorProductIdentifier, ['eor'])).toBe(false);
  });

  it('should return true when product is not excluded', () => {
    expect(shouldIncludeProduct(corProductIdentifier, ['eor'])).toBe(true);
  });
});

describe('getBasicInformationSchemaVersion', () => {
  it('should return version 1 by default', () => {
    expect(getBasicInformationSchemaVersion(undefined)).toEqual(1);
    expect(getBasicInformationSchemaVersion({})).toEqual(1);
  });

  it('should return custom version when provided', () => {
    expect(
      getBasicInformationSchemaVersion({
        jsonSchemaVersion: { employment_basic_information: 2 },
      }),
    ).toEqual(2);
  });

  it('should return "latest" when specified', () => {
    expect(
      getBasicInformationSchemaVersion({
        jsonSchemaVersion: { employment_basic_information: 'latest' },
      }),
    ).toEqual('latest');
  });
});

import {
  shouldIncludeProduct,
} from '../utils';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
  corProductIdentifier,
  eorProductIdentifier,
  ProductType,
} from '../constants';

describe('shouldIncludeProduct', () => {
  it('should return true when excludeProducts is undefined', () => {
    expect(shouldIncludeProduct(eorProductIdentifier, undefined)).toBe(true);
    expect(shouldIncludeProduct(corProductIdentifier, undefined)).toBe(true);
    expect(shouldIncludeProduct(contractorStandardProductIdentifier, undefined)).toBe(true);
  });

  it('should return true when excludeProducts is an empty array', () => {
    expect(shouldIncludeProduct(eorProductIdentifier, [])).toBe(true);
    expect(shouldIncludeProduct(corProductIdentifier, [])).toBe(true);
  });

  it('should return false when product is in excludeProducts', () => {
    const excludeProducts: ProductType[] = ['eor'];
    expect(shouldIncludeProduct(eorProductIdentifier, excludeProducts)).toBe(false);
  });

  it('should return true when product is not in excludeProducts', () => {
    const excludeProducts: ProductType[] = ['eor'];
    expect(shouldIncludeProduct(corProductIdentifier, excludeProducts)).toBe(true);
    expect(shouldIncludeProduct(contractorStandardProductIdentifier, excludeProducts)).toBe(true);
    expect(shouldIncludeProduct(contractorPlusProductIdentifier, excludeProducts)).toBe(true);
  });

  it('should handle multiple excluded products', () => {
    const excludeProducts: ProductType[] = ['eor', 'cor'];
    expect(shouldIncludeProduct(eorProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(corProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(contractorStandardProductIdentifier, excludeProducts)).toBe(true);
    expect(shouldIncludeProduct(contractorPlusProductIdentifier, excludeProducts)).toBe(true);
  });

  it('should handle all products excluded', () => {
    const excludeProducts: ProductType[] = ['cm', 'cm+', 'cor', 'eor'];
    expect(shouldIncludeProduct(eorProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(corProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(contractorStandardProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(contractorPlusProductIdentifier, excludeProducts)).toBe(false);
  });

  it('should handle CM and CM+ exclusion', () => {
    const excludeProducts: ProductType[] = ['cm', 'cm+'];
    expect(shouldIncludeProduct(contractorStandardProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(contractorPlusProductIdentifier, excludeProducts)).toBe(false);
    expect(shouldIncludeProduct(eorProductIdentifier, excludeProducts)).toBe(true);
    expect(shouldIncludeProduct(corProductIdentifier, excludeProducts)).toBe(true);
  });

  it('should return true for unknown product identifiers when not in exclude list', () => {
    const unknownIdentifier = 'urn:remotecom:resource:product:unknown:monthly';
    const excludeProducts: ProductType[] = ['eor'];
    expect(shouldIncludeProduct(unknownIdentifier, excludeProducts)).toBe(true);
  });
});

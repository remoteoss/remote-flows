import { shouldIncludeProduct } from '../utils';
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

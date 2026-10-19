import { assertServedVersion } from './served-version';

describe('assertServedVersion', () => {
  it('accepts a response that served the requested version', () => {
    const headers = new Headers({ 'x-json-schema-served-version': '1' });
    expect(() => assertServedVersion(headers, 'EGY', 1)).not.toThrow();
  });

  it('rejects a response that served another version', () => {
    const headers = new Headers({ 'x-json-schema-served-version': '5' });
    expect(() => assertServedVersion(headers, 'EGY', 1)).toThrow(
      'EGY v1: the API served v5 instead',
    );
  });

  it('rejects a response without the header', () => {
    expect(() => assertServedVersion(new Headers(), 'EGY', 1)).toThrow(
      'no x-json-schema-served-version header',
    );
    expect(() => assertServedVersion(undefined, 'EGY', 1)).toThrow(
      'no x-json-schema-served-version header',
    );
  });
});

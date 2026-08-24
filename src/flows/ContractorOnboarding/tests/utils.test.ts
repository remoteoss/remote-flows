import {
  shouldIncludeProduct,
  getBasicInformationSchemaVersion,
  buildInvoicePreviewPayload,
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

describe('buildInvoicePreviewPayload', () => {
  it('builds the base payload from currency, start_date and items', () => {
    const payload = buildInvoicePreviewPayload({
      currency: 'EUR',
      start_date: '2026-06-01',
      item_1_description: 'Consulting work',
      item_1_amount: 250000,
    });

    expect(payload).toEqual({
      currency: 'EUR',
      start_date: '2026-06-01',
      items: [{ description: 'Consulting work', amount: 250000 }],
    });
  });

  it('includes number and note only when present', () => {
    const payload = buildInvoicePreviewPayload({
      currency: 'EUR',
      start_date: '2026-06-01',
      number: '1234',
      note: 'A note',
    });

    expect(payload).toMatchObject({ number: '1234', note: 'A note' });
  });

  it('omits periodicity and nr_occurrences even when present in values', () => {
    const payload = buildInvoicePreviewPayload({
      currency: 'EUR',
      start_date: '2026-06-01',
      periodicity: 'monthly',
      nr_occurrences: 5,
    });

    expect(payload).not.toHaveProperty('periodicity');
    expect(payload).not.toHaveProperty('nr_occurrences');
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

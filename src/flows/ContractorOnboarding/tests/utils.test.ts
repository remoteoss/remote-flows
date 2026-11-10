import {
  shouldIncludeProduct,
  getBasicInformationSchemaVersion,
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePrefill,
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
      items: [{ description: 'Consulting work', amount: 250000 }],
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

describe('buildInvoiceSchedulePrefill', () => {
  const currencies = ['USD', 'EUR'];

  it('maps the contract details frequency and currency', () => {
    expect(
      buildInvoiceSchedulePrefill(
        {
          payment_terms: {
            invoicing_frequency: 'bi_weekly',
            compensation_currency_code: 'EUR',
          },
        },
        currencies,
      ),
    ).toEqual({ periodicity: 'bi_weekly', currency: 'EUR' });
  });

  it('skips a currency that is not in the contractor currencies', () => {
    expect(
      buildInvoiceSchedulePrefill(
        {
          payment_terms: {
            invoicing_frequency: 'monthly',
            compensation_currency_code: 'YER',
          },
        },
        currencies,
      ),
    ).toEqual({ periodicity: 'monthly' });
  });

  it('skips the currency while the contractor currencies are loading', () => {
    expect(
      buildInvoiceSchedulePrefill(
        { payment_terms: { compensation_currency_code: 'USD' } },
        undefined,
      ),
    ).toEqual({});
  });

  it('skips a frequency that is not a recurring periodicity', () => {
    expect(
      buildInvoiceSchedulePrefill(
        { payment_terms: { invoicing_frequency: 'yearly' } },
        currencies,
      ),
    ).toEqual({});
  });

  it('skips the frequency when payments are due on completion of services', () => {
    expect(
      buildInvoiceSchedulePrefill(
        {
          payment_terms: {
            payment_terms_type: 'completion_of_services',
            invoicing_frequency: 'weekly',
            compensation_currency_code: 'EUR',
          },
        },
        currencies,
      ),
    ).toEqual({ currency: 'EUR' });
  });

  it('returns nothing when there are no payment terms', () => {
    expect(buildInvoiceSchedulePrefill(undefined, currencies)).toEqual({});
    expect(buildInvoiceSchedulePrefill({}, currencies)).toEqual({});
  });
});

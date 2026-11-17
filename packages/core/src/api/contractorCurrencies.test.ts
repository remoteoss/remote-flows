import { selectContractorCurrencyCodes } from './contractorCurrencies';

describe('selectContractorCurrencyCodes', () => {
  it('returns only the currency codes', () => {
    const response = {
      data: {
        data: [
          { code: 'EUR', source: 'guaranteed' },
          { code: 'USD', source: 'guaranteed' },
        ],
      },
    } as Parameters<typeof selectContractorCurrencyCodes>[0];

    expect(selectContractorCurrencyCodes(response)).toEqual(['EUR', 'USD']);
  });
});

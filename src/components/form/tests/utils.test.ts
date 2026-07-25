import { getForcedFieldValue } from '../utils';

describe('getForcedFieldValue', () => {
  it('converts money consts from cents to units', () => {
    // Schema consts for money fields are in cents; the form state holds units
    // and the submit path converts back with convertToCents.
    const field = { name: 'compensation_amount', type: 'money', const: 125000 };

    expect(getForcedFieldValue(field)).toBe(1250);
  });

  it('returns the const untouched for non-money fields', () => {
    const field = { name: 'probation_length', type: 'number', const: 6 };

    expect(getForcedFieldValue(field)).toBe(6);
  });
});

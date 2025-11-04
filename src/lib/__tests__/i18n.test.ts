import { getSingularPluralUnit } from '@/src/lib/i18n';

describe('getSingularPluralUnit()', () => {
  it('should return plural for 0', async () => {
    expect(
      getSingularPluralUnit({ number: 0, singular: 'month', plural: 'months' }),
    ).toBe('0 months');
  });

  it('should return singular for -1', async () => {
    expect(
      getSingularPluralUnit({
        number: -1,
        singular: 'month',
        plural: 'months',
      }),
    ).toBe('-1 month');
  });

  it('should return singular for 1', async () => {
    expect(
      getSingularPluralUnit({ number: 1, singular: 'month', plural: 'months' }),
    ).toBe('one month');
  });

  it('should return plural for 2+', async () => {
    expect(
      getSingularPluralUnit({ number: 2, singular: 'month', plural: 'months' }),
    ).toBe('two months');
  });

  it('should not follow copy guidelines if specified', async () => {
    expect(
      getSingularPluralUnit({
        number: 2,
        singular: 'month',
        plural: 'months',
        followCopyGuidelines: false,
      }),
    ).toBe('2 months');
  });

  it('should return only the variant and not the number', async () => {
    expect(
      getSingularPluralUnit({
        number: 2,
        singular: 'has',
        plural: 'have',
        followCopyGuidelines: false,
        showNumber: false,
      }),
    ).toBe('have');
  });
});

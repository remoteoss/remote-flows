import { isInProbationPeriod } from '@/src/common/employment';

describe('isInProbationPeriod', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2024-01-15'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns true when probation end date is in the future', () => {
    expect(isInProbationPeriod('2024-02-01')).toBeTruthy();
  });

  it('returns true when probation end date is today', () => {
    expect(isInProbationPeriod('2024-01-15')).toBeTruthy();
  });

  it('returns false when probation end date is in the past', () => {
    expect(isInProbationPeriod('2024-01-14')).toBeFalsy();
  });

  it('returns false when probation end date is undefined', () => {
    expect(isInProbationPeriod(undefined)).toBeFalsy();
  });
});

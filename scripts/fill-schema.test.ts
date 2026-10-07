import { findSafeStartDate, HolidayDate } from './fill-schema';

describe('findSafeStartDate', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-01T12:00:00Z'));
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    warnSpy.mockRestore();
  });

  it('skips the earliest candidate when it is a holiday', async () => {
    const fetchHolidays = vi.fn(async (): Promise<HolidayDate[]> => [
      { day: '2026-12-07' },
    ]);

    await expect(findSafeStartDate('PRT', fetchHolidays)).resolves.toBe(
      '2026-12-08',
    );
    expect(fetchHolidays.mock.calls).toEqual([
      ['PRT', '2026'],
      ['PRT', '2027'],
    ]);
  });

  it('keeps the holidays from years that loaded when another year fails', async () => {
    const fetchHolidays = async (
      _country: string,
      year: string,
    ): Promise<HolidayDate[]> => {
      if (year === '2027') throw new Error('gateway down');
      return [{ day: '2026-12-01', observed_day: '2026-12-07' }];
    };

    await expect(findSafeStartDate('PRT', fetchHolidays)).resolves.toBe(
      '2026-12-08',
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Could not load 2027 holidays for PRT:',
      new Error('gateway down'),
    );
  });
});

import { fillSchema, findSafeStartDate, HolidayDate } from './fill-schema';

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

describe('fillSchema', () => {
  it('honours const, length and range constraints', () => {
    const { values, errors } = fillSchema({
      type: 'object',
      properties: {
        hours: {
          type: 'number',
          title: 'Hours',
          const: 40,
          'x-jsf-presentation': { inputType: 'number' },
        },
        pto: {
          type: 'number',
          title: 'PTO',
          minimum: 22,
          maximum: 25,
          'x-jsf-presentation': { inputType: 'number' },
        },
        role_description: {
          type: 'string',
          title: 'Role description',
          minLength: 100,
          maxLength: 200,
          'x-jsf-presentation': { inputType: 'textarea' },
        },
      },
      required: ['hours', 'pto', 'role_description'],
    });

    expect(errors).toEqual({});
    expect(values.hours).toBe(40);
    expect(values.pto).toBeGreaterThanOrEqual(22);
    expect(values.pto).toBeLessThanOrEqual(25);
    expect((values.role_description as string).length).toBeGreaterThanOrEqual(
      100,
    );
  });

  it('fills the fields inside a fieldset', () => {
    const { values, errors } = fillSchema({
      type: 'object',
      properties: {
        work_address: {
          type: 'object',
          title: 'Work address',
          properties: {
            city: {
              type: 'string',
              title: 'City',
              'x-jsf-presentation': { inputType: 'text' },
            },
          },
          required: ['city'],
          'x-jsf-presentation': { inputType: 'fieldset' },
        },
      },
      required: ['work_address'],
    });

    expect(errors).toEqual({});
    expect(values.work_address).toEqual({ city: expect.any(String) });
  });

  it('fills a field that an earlier answer makes required', () => {
    const { values, errors } = fillSchema({
      type: 'object',
      properties: {
        has_bonus: {
          type: 'string',
          title: 'Bonus',
          oneOf: [{ const: 'yes', title: 'Yes' }],
          'x-jsf-presentation': { inputType: 'radio' },
        },
        bonus_amount: {
          type: 'number',
          title: 'Bonus amount',
          minimum: 100,
          'x-jsf-presentation': { inputType: 'number' },
        },
      },
      required: ['has_bonus'],
      allOf: [
        {
          if: {
            properties: { has_bonus: { const: 'yes' } },
            required: ['has_bonus'],
          },
          then: { required: ['bonus_amount'] },
          else: { properties: { bonus_amount: false } },
        },
      ],
    });

    expect(errors).toEqual({});
    expect(values.has_bonus).toBe('yes');
    expect(values.bonus_amount).toBeGreaterThanOrEqual(100);
  });

  it('regenerates a default that fails validation', () => {
    const { values, errors } = fillSchema({
      type: 'object',
      properties: {
        notice_days: {
          type: 'number',
          title: 'Notice days',
          default: 1,
          minimum: 10,
          maximum: 12,
          'x-jsf-presentation': { inputType: 'number' },
        },
      },
      required: ['notice_days'],
    });

    expect(errors).toEqual({});
    expect(values.notice_days).toBeGreaterThanOrEqual(10);
  });

  it('keeps seed values and reports required file fields as skipped', () => {
    const { values, skipped, errors } = fillSchema(
      {
        type: 'object',
        properties: {
          start_date: {
            type: 'string',
            title: 'Start date',
            format: 'date',
            'x-jsf-presentation': { inputType: 'date' },
          },
          contract: {
            type: 'string',
            title: 'Contract',
            'x-jsf-presentation': { inputType: 'file' },
          },
        },
        required: ['start_date', 'contract'],
      },
      { start_date: '2026-12-08' },
    );

    expect(values).toEqual({ start_date: '2026-12-08' });
    expect(skipped).toEqual(['contract']);
    expect(errors).toEqual({});
  });
});

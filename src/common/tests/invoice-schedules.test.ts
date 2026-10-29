import {
  buildCreateInvoiceScheduleSchema,
  ONE_TIME_PERIODICITY,
  buildCustomDays,
  buildInvoiceItems,
  buildInvoiceScheduleFormValues,
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
  buildRecurrence,
  toOrdinal,
} from '@/src/common/invoice-schedules';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { $TSFixMe } from '@/src/types/remoteFlows';

const baseValues = {
  currency: 'USD',
  periodicity: 'monthly',
  start_date: '2026-10-01',
  item_1_description: 'Design work',
  item_1_amount: 250000,
};

describe('buildInvoiceItems', () => {
  it('collects the filled slots in order', () => {
    expect(
      buildInvoiceItems({
        item_1_description: 'First',
        item_1_amount: 100,
        item_2_description: 'Second',
        item_2_amount: 200,
      }),
    ).toEqual([
      { description: 'First', amount: 100 },
      { description: 'Second', amount: 200 },
    ]);
  });

  it('skips slots missing either half of the pair', () => {
    expect(
      buildInvoiceItems({
        item_1_description: 'First',
        item_1_amount: 100,
        item_2_description: 'No amount',
        item_3_amount: 300,
      }),
    ).toEqual([{ description: 'First', amount: 100 }]);
  });

  it('collects up to ten slots', () => {
    const values: Record<string, unknown> = {};
    for (let slot = 1; slot <= 12; slot++) {
      values[`item_${slot}_description`] = `Item ${slot}`;
      values[`item_${slot}_amount`] = slot;
    }

    expect(buildInvoiceItems(values)).toHaveLength(10);
  });
});

describe('buildRecurrence', () => {
  it('collapses a one-off into monthly with a single occurrence', () => {
    expect(buildRecurrence({ periodicity: ONE_TIME_PERIODICITY })).toEqual({
      periodicity: 'monthly',
      nr_occurrences: 1,
    });
  });

  it('pins a one-off to a single occurrence even when the form supplies another count', () => {
    expect(
      buildRecurrence({
        periodicity: ONE_TIME_PERIODICITY,
        nr_occurrences: 12,
      }),
    ).toEqual({ periodicity: 'monthly', nr_occurrences: 1 });
  });

  it('omits the occurrence count for an indefinite schedule', () => {
    expect(buildRecurrence({ periodicity: 'weekly' })).toEqual({
      periodicity: 'weekly',
    });
  });

  it('passes a capped recurring schedule through as a number', () => {
    expect(
      buildRecurrence({ periodicity: 'bi_weekly', nr_occurrences: '6' }),
    ).toEqual({ periodicity: 'bi_weekly', nr_occurrences: 6 });
  });
});

describe('buildInvoiceSchedulePayload', () => {
  it('builds the payload the create endpoint expects', () => {
    expect(buildInvoiceSchedulePayload(baseValues)).toEqual({
      currency: 'USD',
      periodicity: 'monthly',
      start_date: '2026-10-01',
      items: [{ description: 'Design work', amount: 250000 }],
    });
  });

  it('encodes a one-off as monthly with one occurrence', () => {
    expect(
      buildInvoiceSchedulePayload({
        ...baseValues,
        periodicity: ONE_TIME_PERIODICITY,
      }),
    ).toEqual({
      currency: 'USD',
      periodicity: 'monthly',
      start_date: '2026-10-01',
      items: [{ description: 'Design work', amount: 250000 }],
      nr_occurrences: 1,
    });
  });

  it('includes custom_days for a semi-monthly schedule', () => {
    expect(
      buildInvoiceSchedulePayload({
        ...baseValues,
        periodicity: 'semi_monthly',
        semi_monthly_settings: {
          invoicing_cycle: 'custom_cycle',
          first_invoice_day: 1,
          second_invoice_day: 15,
        },
      }),
    ).toEqual({
      currency: 'USD',
      periodicity: 'semi_monthly',
      start_date: '2026-10-01',
      items: [{ description: 'Design work', amount: 250000 }],
      custom_days: [1, 15],
    });
  });

  it('omits custom_days when the periodicity is not semi-monthly', () => {
    expect(
      buildInvoiceSchedulePayload({
        ...baseValues,
        semi_monthly_settings: { invoicing_cycle: 'default_cycle' },
      }),
    ).not.toHaveProperty('custom_days');
  });

  it('includes the optional fields only when set', () => {
    expect(
      buildInvoiceSchedulePayload({
        ...baseValues,
        number: 12345,
        note: 'A note',
        nr_occurrences: 4,
      }),
    ).toEqual({
      currency: 'USD',
      periodicity: 'monthly',
      start_date: '2026-10-01',
      items: [{ description: 'Design work', amount: 250000 }],
      number: '12345',
      note: 'A note',
      nr_occurrences: 4,
    });
  });
});

describe('buildCustomDays', () => {
  it('is the 15th and the last day for the default cycle', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        semi_monthly_settings: { invoicing_cycle: 'default_cycle' },
      }),
    ).toEqual([15, 31]);
  });

  it('is the chosen first day and the day 14 days after it for a custom cycle', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        semi_monthly_settings: {
          invoicing_cycle: 'custom_cycle',
          first_invoice_day: 3,
        },
      }),
    ).toEqual([3, 17]);
  });

  it('coerces a string day, since select values can arrive as strings', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        semi_monthly_settings: {
          invoicing_cycle: 'custom_cycle',
          first_invoice_day: '14',
        },
      }),
    ).toEqual([14, 28]);
  });

  it('is undefined for any other periodicity, which the API rejects the field for', () => {
    expect(
      buildCustomDays({
        periodicity: 'monthly',
        semi_monthly_settings: { invoicing_cycle: 'default_cycle' },
      }),
    ).toBeUndefined();
  });

  it('is undefined when a custom cycle has no first day', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        semi_monthly_settings: { invoicing_cycle: 'custom_cycle' },
      }),
    ).toBeUndefined();
  });

  it('is undefined when the settings are absent', () => {
    expect(buildCustomDays({ periodicity: 'semi_monthly' })).toBeUndefined();
  });
});

describe('toOrdinal', () => {
  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [28, '28th'],
  ])('formats %i as %s', (day, expected) => {
    expect(toOrdinal(day)).toBe(expected);
  });
});

describe('buildInvoicePreviewPayload', () => {
  it('omits the recurrence fields, which the preview endpoint rejects', () => {
    expect(
      buildInvoicePreviewPayload({
        ...baseValues,
        periodicity: 'weekly',
        nr_occurrences: 3,
      }),
    ).toEqual({
      currency: 'USD',
      start_date: '2026-10-01',
      items: [{ description: 'Design work', amount: 250000 }],
    });
  });
});

describe('buildCreateInvoiceScheduleSchema', () => {
  const periodicityOptions = (
    schema: ReturnType<typeof buildCreateInvoiceScheduleSchema>,
  ) =>
    (schema.properties.periodicity.oneOf as { const: string }[]).map(
      (option) => option.const,
    );

  it('offers the one-off option alongside the recurring cadences', () => {
    expect(periodicityOptions(buildCreateInvoiceScheduleSchema())).toEqual([
      ONE_TIME_PERIODICITY,
      'weekly',
      'bi_weekly',
      'semi_monthly',
      'monthly',
    ]);
  });

  it('restricts a Contractor of Record to one-off invoicing', () => {
    expect(
      periodicityOptions(
        buildCreateInvoiceScheduleSchema({ isContractorOfRecord: true }),
      ),
    ).toEqual([ONE_TIME_PERIODICITY]);
  });

  it('substitutes the contractor currencies', () => {
    const schema = buildCreateInvoiceScheduleSchema({
      currencies: ['USD', 'EUR'],
    });

    expect(schema.properties.currency.oneOf).toEqual([
      { const: 'USD', title: 'USD' },
      { const: 'EUR', title: 'EUR' },
    ]);
  });

  it('shows the invoice date note right before the frequency', () => {
    const order = buildCreateInvoiceScheduleSchema()['x-jsf-order'];

    expect(order.indexOf('invoice_date_note')).toBe(
      order.indexOf('periodicity') - 1,
    );
  });

  it('exposes the semi-monthly cycle fieldset, hidden unless semi-monthly is chosen', () => {
    const schema = buildCreateInvoiceScheduleSchema();

    expect(
      schema.properties.semi_monthly_settings?.['x-jsf-presentation'],
    ).toEqual({ inputType: 'fieldset' });
    expect(schema.required).not.toContain('semi_monthly_settings');

    const hides = schema.allOf.some(
      (c: Record<string, $TSFixMe>) =>
        c.if?.properties?.periodicity?.const === 'semi_monthly' &&
        c.else?.properties?.semi_monthly_settings === false,
    );
    expect(hides).toBe(true);
  });

  it('makes the placeholder currency unselectable rather than empty', () => {
    // A non-empty value is required: Radix's Select.Item rejects an empty one. `disabled`
    // is what stops it being chosen, and therefore submitted.
    expect(
      buildCreateInvoiceScheduleSchema().properties.currency.oneOf,
    ).toEqual([
      { const: 'placeholder', title: 'Loading currencies…', disabled: true },
    ]);
  });

  it('says the contractor has no currencies rather than that they are loading', () => {
    // The flows only build the schema once the request has resolved, so an empty list is a
    // real answer. Calling that "loading" left the field looking stuck forever.
    expect(
      buildCreateInvoiceScheduleSchema({ currencies: [] }).properties.currency
        .oneOf,
    ).toEqual([
      {
        const: 'placeholder',
        title: 'No currencies available',
        disabled: true,
      },
    ]);
  });

  it('carries the disabled flag through to the rendered field option', () => {
    const form = createHeadlessForm(
      buildCreateInvoiceScheduleSchema() as $TSFixMe,
      {},
    );
    const currency = (form.fields as $TSFixMe[]).find(
      (f) => f.name === 'currency',
    );

    expect(currency?.options?.[0]?.disabled).toBe(true);
  });

  describe('semi-monthly start date', () => {
    const MESSAGE = 'Choose a date that matches the selected invoicing cycle';

    const buildForm = () =>
      createHeadlessForm(
        buildCreateInvoiceScheduleSchema({
          currencies: ['USD'],
        }) as $TSFixMe,
        {},
      );

    const semiMonthlyValues = (
      start_date: string,
      semi_monthly_settings: Record<string, string> = {
        invoicing_cycle: 'default_cycle',
      },
    ) => ({
      ...baseValues,
      periodicity: 'semi_monthly',
      end_type: 'never',
      start_date,
      semi_monthly_settings,
    });

    const startDateError = async (
      values: ReturnType<typeof semiMonthlyValues>,
    ) => (await buildForm().handleValidation(values))?.formErrors?.start_date;

    it.each(['2099-01-15', '2099-01-31', '2099-04-30', '2099-02-28'])(
      'accepts %s for the default cycle',
      async (date) => {
        expect(await startDateError(semiMonthlyValues(date))).toBeUndefined();
      },
    );

    it.each(['2099-01-01', '2099-01-30', '2099-04-29', '2099-02-27'])(
      'rejects %s for the default cycle',
      async (date) => {
        expect(await startDateError(semiMonthlyValues(date))).toBe(MESSAGE);
      },
    );

    it('treats the 28th of February as month end only outside leap years', async () => {
      expect(
        await startDateError(semiMonthlyValues('2100-02-28')),
      ).toBeUndefined();
      expect(await startDateError(semiMonthlyValues('2096-02-28'))).toBe(
        MESSAGE,
      );
      expect(
        await startDateError(semiMonthlyValues('2096-02-29')),
      ).toBeUndefined();
    });

    it('accepts either day of a custom cycle', async () => {
      const custom = {
        invoicing_cycle: 'custom_cycle',
        first_invoice_day: '3',
      };

      expect(
        await startDateError(semiMonthlyValues('2099-01-03', custom)),
      ).toBeUndefined();
      expect(
        await startDateError(semiMonthlyValues('2099-01-17', custom)),
      ).toBeUndefined();
    });

    it('rejects a day outside a custom cycle, including the default cycle days', async () => {
      const custom = {
        invoicing_cycle: 'custom_cycle',
        first_invoice_day: '3',
      };

      expect(
        await startDateError(semiMonthlyValues('2099-01-15', custom)),
      ).toBe(MESSAGE);
      expect(
        await startDateError(semiMonthlyValues('2099-01-31', custom)),
      ).toBe(MESSAGE);
    });

    it('does not constrain the start date of another frequency', async () => {
      const values = {
        ...semiMonthlyValues('2099-01-01'),
        periodicity: 'monthly',
      };

      expect(await startDateError(values)).toBeUndefined();
    });
  });

  describe('end date choice', () => {
    const buildForm = (options = {}) =>
      createHeadlessForm(
        buildCreateInvoiceScheduleSchema({
          currencies: ['USD'],
          ...options,
        }) as $TSFixMe,
        {},
      );

    const endDateBaseValues = { ...baseValues, start_date: '2099-01-01' };

    const visible = (form: ReturnType<typeof buildForm>, name: string) =>
      form.fields.find((field) => field.name === name)?.isVisible;

    it('hides the end date fields until a recurring frequency is chosen', async () => {
      const form = buildForm();

      await form.handleValidation({});
      expect(visible(form, 'end_type')).toBe(false);
      expect(visible(form, 'nr_occurrences')).toBe(false);

      await form.handleValidation({ periodicity: ONE_TIME_PERIODICITY });
      expect(visible(form, 'end_type')).toBe(false);
      expect(visible(form, 'nr_occurrences')).toBe(false);
    });

    it('hides the count when the user switches to a one-off after picking "End after"', async () => {
      const form = buildForm();

      await form.handleValidation({
        periodicity: ONE_TIME_PERIODICITY,
        end_type: 'multiple',
      });

      expect(visible(form, 'end_type')).toBe(false);
      expect(visible(form, 'nr_occurrences')).toBe(false);
    });

    it.each(['weekly', 'bi_weekly', 'semi_monthly', 'monthly'])(
      'shows the end date choice for %s, with the count hidden until "End after" is picked',
      async (periodicity) => {
        const form = buildForm();

        await form.handleValidation({ periodicity });
        expect(visible(form, 'end_type')).toBe(true);
        expect(visible(form, 'nr_occurrences')).toBe(false);

        await form.handleValidation({ periodicity, end_type: 'never' });
        expect(visible(form, 'nr_occurrences')).toBe(false);

        await form.handleValidation({ periodicity, end_type: 'multiple' });
        expect(visible(form, 'nr_occurrences')).toBe(true);
      },
    );

    it('requires the end date choice for a recurring schedule', async () => {
      const form = buildForm();

      const result = await form.handleValidation({
        ...endDateBaseValues,
        periodicity: 'monthly',
      });

      expect(result?.formErrors).toEqual({ end_type: 'Required field' });
    });

    it('requires a count only when "End after" is picked', async () => {
      const form = buildForm();

      const never = await form.handleValidation({
        ...endDateBaseValues,
        end_type: 'never',
      });
      expect(never?.formErrors).toBeUndefined();

      const multiple = await form.handleValidation({
        ...endDateBaseValues,
        end_type: 'multiple',
      });
      expect(multiple?.formErrors).toEqual({
        nr_occurrences: 'Required field',
      });

      const filled = await form.handleValidation({
        ...endDateBaseValues,
        end_type: 'multiple',
        nr_occurrences: 3,
      });
      expect(filled?.formErrors).toBeUndefined();
    });

    it('rejects a count below one', async () => {
      const form = buildForm();

      const result = await form.handleValidation({
        ...endDateBaseValues,
        end_type: 'multiple',
        nr_occurrences: 0,
      });

      expect(result?.formErrors).toHaveProperty('nr_occurrences');
    });

    it('does not require the end date choice for a one-off', async () => {
      const form = buildForm();

      const result = await form.handleValidation({
        ...endDateBaseValues,
        periodicity: ONE_TIME_PERIODICITY,
      });

      expect(result?.formErrors).toBeUndefined();
    });

    it('places the end date choice right after the start date', () => {
      const order = buildCreateInvoiceScheduleSchema()['x-jsf-order'];

      expect(order.slice(order.indexOf('start_date'))).toEqual([
        'start_date',
        'end_type',
        'nr_occurrences',
        'number',
        'schedule_summary',
        'note',
      ]);
    });
  });

  it('reports a required error when no currency has been chosen', async () => {
    const form = createHeadlessForm(
      buildCreateInvoiceScheduleSchema() as $TSFixMe,
      {},
    );

    const result = await form.handleValidation({
      periodicity: 'monthly',
      start_date: '2026-10-01',
      item_1_description: 'Design work',
      item_1_amount: 250000,
    });

    expect(result?.formErrors).toHaveProperty('currency');
  });
});

describe('buildInvoiceScheduleFormValues', () => {
  it('maps a saved schedule to form values, one slot per item, amounts untouched', () => {
    expect(
      buildInvoiceScheduleFormValues({
        currency: 'EUR',
        periodicity: 'monthly',
        start_date: '2026-10-01',
        number: 'INV-1',
        note: null,
        nr_occurrences: 3,
        items: [
          { description: 'Design work', amount: 250000 },
          { description: 'Hosting', amount: 7500 },
        ],
      }),
    ).toEqual({
      currency: 'EUR',
      periodicity: 'monthly',
      start_date: '2026-10-01',
      number: 'INV-1',
      note: null,
      end_type: 'multiple',
      nr_occurrences: 3,
      item_1_description: 'Design work',
      item_1_amount: 250000,
      item_2_description: 'Hosting',
      item_2_amount: 7500,
    });
  });

  describe('semi-monthly cycle', () => {
    const saved = (custom_days: [number, number] | null) => ({
      currency: 'EUR',
      periodicity: 'semi_monthly' as const,
      start_date: '2026-10-03',
      number: null,
      note: null,
      nr_occurrences: null,
      custom_days,
    });

    it('restores a saved custom cycle as the custom cycle with its first day', () => {
      expect(
        buildInvoiceScheduleFormValues(saved([3, 17])).semi_monthly_settings,
      ).toEqual({ invoicing_cycle: 'custom_cycle', first_invoice_day: '3' });
    });

    it('restores the 15th and last day as the default cycle', () => {
      expect(
        buildInvoiceScheduleFormValues(saved([15, 31])).semi_monthly_settings,
      ).toEqual({ invoicing_cycle: 'default_cycle' });
    });

    it('leaves the cycle to the schema default when no days were saved', () => {
      expect(buildInvoiceScheduleFormValues(saved(null))).not.toHaveProperty(
        'semi_monthly_settings',
      );
    });

    it('ignores the saved days for another frequency', () => {
      expect(
        buildInvoiceScheduleFormValues({
          ...saved([3, 17]),
          periodicity: 'monthly' as const,
        }),
      ).not.toHaveProperty('semi_monthly_settings');
    });
  });

  it('selects "No end date" for a schedule that repeats indefinitely', () => {
    expect(
      buildInvoiceScheduleFormValues({
        currency: 'EUR',
        periodicity: 'weekly',
        start_date: '2026-10-01',
        number: null,
        note: null,
        nr_occurrences: null,
      }),
    ).toMatchObject({ end_type: 'never', nr_occurrences: null });
  });

  it('reloads a saved one-off schedule as "One time" with no occurrence count', () => {
    const values = buildInvoiceScheduleFormValues({
      currency: 'EUR',
      periodicity: 'monthly',
      start_date: '2026-10-01',
      number: null,
      note: null,
      nr_occurrences: 1,
      items: [{ description: 'Design work', amount: 250000 }],
    });

    expect(values.periodicity).toBe(ONE_TIME_PERIODICITY);
    expect(values.end_type).toBeUndefined();
    expect(values.nr_occurrences).toBeUndefined();
  });
});

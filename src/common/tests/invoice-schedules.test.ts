import {
  buildCreateInvoiceScheduleSchema,
  ONE_TIME_PERIODICITY,
  buildCustomDays,
  buildInvoiceItems,
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
  buildRecurrence,
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
        custom_day_1: 1,
        custom_day_2: 15,
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
        custom_day_1: 1,
        custom_day_2: 15,
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
  it('returns the pair for a semi-monthly schedule', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        custom_day_1: 1,
        custom_day_2: 15,
      }),
    ).toEqual([1, 15]);
  });

  it('coerces string inputs, since number fields submit strings', () => {
    expect(
      buildCustomDays({
        periodicity: 'semi_monthly',
        custom_day_1: '3',
        custom_day_2: '17',
      }),
    ).toEqual([3, 17]);
  });

  it('is undefined for any other periodicity, which the API rejects the field for', () => {
    expect(
      buildCustomDays({
        periodicity: 'monthly',
        custom_day_1: 1,
        custom_day_2: 15,
      }),
    ).toBeUndefined();
  });

  it('is undefined when only one day is given, falling back to the derived cycle', () => {
    expect(
      buildCustomDays({ periodicity: 'semi_monthly', custom_day_1: 1 }),
    ).toBeUndefined();
  });

  it('is undefined when neither day is given', () => {
    expect(buildCustomDays({ periodicity: 'semi_monthly' })).toBeUndefined();
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

  it('offers only the recurring cadences by default, matching the in-flow step', () => {
    expect(periodicityOptions(buildCreateInvoiceScheduleSchema())).toEqual([
      'weekly',
      'bi_weekly',
      'semi_monthly',
      'monthly',
    ]);
  });

  it('offers the one-off option when asked', () => {
    expect(
      periodicityOptions(
        buildCreateInvoiceScheduleSchema({ includeOneTime: true }),
      ),
    ).toEqual([
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
        buildCreateInvoiceScheduleSchema({
          includeOneTime: true,
          isContractorOfRecord: true,
        }),
      ),
    ).toEqual([ONE_TIME_PERIODICITY]);
  });

  it('restricts a Contractor of Record even when the one-off option was not requested', () => {
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

  it('omits the semi-monthly day fields by default, so the in-flow step is unchanged', () => {
    const schema = buildCreateInvoiceScheduleSchema();

    expect(schema.properties).not.toHaveProperty('custom_day_1');
    expect(schema['x-jsf-order']).not.toContain('custom_day_1');
  });

  it('exposes the semi-monthly day fields when asked, hidden unless semi-monthly is chosen', () => {
    const schema = buildCreateInvoiceScheduleSchema({
      includeCustomDays: true,
    });

    expect(schema.properties).toHaveProperty('custom_day_1');
    expect(schema.properties).toHaveProperty('custom_day_2');
    expect(schema.required).not.toContain('custom_day_1');

    const hides = schema.allOf.some(
      (c: Record<string, $TSFixMe>) =>
        c.if?.properties?.periodicity?.const === 'semi_monthly' &&
        c.else?.properties?.custom_day_1 === false,
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

  it('omits the contractor picker unless asked', () => {
    const schema = buildCreateInvoiceScheduleSchema();

    expect(schema.properties).not.toHaveProperty('employment_id');
    expect(schema.required).not.toContain('employment_id');
  });

  it('prepends a required contractor picker for the standalone screen', () => {
    const schema = buildCreateInvoiceScheduleSchema({
      includeContractorSelect: true,
      contractors: [{ value: 'emp_1', label: 'Grace Hopper' }],
    });

    // Deliberately no `oneOf`: the picker searches the API, so enumerating the loaded page
    // here would reject a contractor found by search. Options are presentation-only.
    expect(schema.properties.employment_id).not.toHaveProperty('oneOf');
    expect(
      schema.properties.employment_id?.['x-jsf-presentation']?.options,
    ).toEqual([{ value: 'emp_1', label: 'Grace Hopper' }]);
    expect(schema.required).toContain('employment_id');
    expect(schema['x-jsf-order'][0]).toBe('employment_id');
  });
});

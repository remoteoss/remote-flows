import {
  fakeValueFor,
  fillVisibleFields,
  FillableField,
} from '@/scripts/verify-contract-details-version/fill';

describe('fakeValueFor', () => {
  it('prefers the "no" option for radio/select fields', () => {
    const field: FillableField = {
      name: 'has_dependents',
      inputType: 'radio',
      options: [{ value: 'yes' }, { value: 'no' }],
    };
    expect(fakeValueFor(field)).toBe('no');
  });

  it('wraps a chosen option in an array for multiple/countries fields', () => {
    const field: FillableField = {
      name: 'tax_servicing_countries',
      inputType: 'countries',
      options: [{ value: 'PRT' }, { value: 'ESP' }],
    };
    expect(fakeValueFor(field)).toEqual([expect.stringMatching(/^(PRT|ESP)$/)]);
  });

  it('builds a phone number from the option carrying a countryCode', () => {
    const field: FillableField = {
      name: 'phone_number',
      inputType: 'tel',
      options: [{ value: 'ESP', meta: { countryCode: '34' } }],
    };
    expect(fakeValueFor(field)).toMatch(/^\+34\d{9}$/);
  });

  it('returns undefined for file and group-array fields', () => {
    expect(
      fakeValueFor({ name: 'contract_upload', inputType: 'file' }),
    ).toBeUndefined();
    expect(
      fakeValueFor({ name: 'equity_grants', inputType: 'group-array' }),
    ).toBeUndefined();
  });

  it('generates a checked acknowledgement for checkbox fields', () => {
    expect(
      fakeValueFor({ name: 'ack_amendment', inputType: 'checkbox' }),
    ).toEqual([true]);
  });
});

describe('fillVisibleFields', () => {
  it('only fills required fields on the required pass', () => {
    const fields: FillableField[] = [
      { name: 'job_title', inputType: 'text', required: true, isVisible: true },
      { name: 'nickname', inputType: 'text', required: false, isVisible: true },
    ];
    const values: Record<string, unknown> = {};

    const changed = fillVisibleFields(fields, values, 'required');

    expect(changed).toBe(true);
    expect(Object.keys(values)).toEqual(['job_title']);
  });

  it('fills every visible field on the full pass', () => {
    const fields: FillableField[] = [
      { name: 'job_title', inputType: 'text', required: true, isVisible: true },
      { name: 'nickname', inputType: 'text', required: false, isVisible: true },
      {
        name: 'hidden_field',
        inputType: 'text',
        required: false,
        isVisible: false,
      },
    ];
    const values: Record<string, unknown> = {};

    fillVisibleFields(fields, values, 'full');

    expect(Object.keys(values).sort()).toEqual(['job_title', 'nickname']);
  });

  it('recurses into nested fieldsets and merges into the parent key', () => {
    const fields: FillableField[] = [
      {
        name: 'daily_schedule',
        isVisible: true,
        fields: [
          {
            name: 'schedule_type',
            inputType: 'radio',
            required: true,
            isVisible: true,
            options: [{ value: 'fixed' }, { value: 'flexible' }],
          },
        ],
      },
    ];
    const values: Record<string, unknown> = {};

    const changed = fillVisibleFields(fields, values, 'required');

    expect(changed).toBe(true);
    expect(values).toEqual({ daily_schedule: { schedule_type: 'fixed' } });
  });

  it('does not overwrite a value already present (e.g. from an override)', () => {
    const fields: FillableField[] = [
      { name: 'job_title', inputType: 'text', required: true, isVisible: true },
    ];
    const values: Record<string, unknown> = { job_title: 'Preset title' };

    const changed = fillVisibleFields(fields, values, 'required');

    expect(changed).toBe(false);
    expect(values.job_title).toBe('Preset title');
  });

  it('converges over multiple rounds as conditionally-visible fields appear', () => {
    const fields: FillableField[] = [
      {
        name: 'has_seniority_date',
        inputType: 'radio',
        required: true,
        isVisible: true,
        options: [{ value: 'yes' }, { value: 'no' }],
      },
      {
        name: 'seniority_date',
        inputType: 'date',
        required: true,
        isVisible: false,
      },
    ];
    const values: Record<string, unknown> = {};

    let changed = fillVisibleFields(fields, values, 'required');
    expect(changed).toBe(true);
    expect(values.seniority_date).toBeUndefined();

    fields[1].isVisible = true;
    changed = fillVisibleFields(fields, values, 'required');
    expect(changed).toBe(true);
    expect(values.seniority_date).toBeDefined();

    changed = fillVisibleFields(fields, values, 'required');
    expect(changed).toBe(false);
  });

  it('collects unfillable fields into the skipped list', () => {
    const fields: FillableField[] = [
      {
        name: 'contract_upload',
        inputType: 'file',
        required: true,
        isVisible: true,
      },
    ];
    const values: Record<string, unknown> = {};
    const skipped: string[] = [];

    const changed = fillVisibleFields(fields, values, 'required', skipped);

    expect(changed).toBe(false);
    expect(skipped).toEqual(['contract_upload']);
    expect(values.contract_upload).toBeUndefined();
  });
});

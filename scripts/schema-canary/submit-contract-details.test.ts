import { http, HttpResponse } from 'msw';
import { client } from '@/src/client/client.gen';
import { server } from '@/src/tests/server';
import {
  differencesFromSaved,
  sdkPayloadFor,
  submitContractDetails,
} from './submit-contract-details';

const schema = {
  type: 'object',
  properties: {
    has_signing_bonus: {
      type: 'string',
      title: 'Signing bonus',
      oneOf: [
        { const: 'yes', title: 'Yes' },
        { const: 'no', title: 'No' },
      ],
      'x-jsf-presentation': { inputType: 'radio' },
    },
    contract: {
      type: 'string',
      title: 'Contract',
      'x-jsf-presentation': { inputType: 'file' },
    },
  },
  required: ['has_signing_bonus', 'contract'],
};

const salarySchema = {
  type: 'object',
  properties: {
    annual_gross_salary: {
      type: 'integer',
      title: 'Annual gross salary',
      minimum: 100000,
      maximum: 100000,
      'x-jsf-presentation': { inputType: 'money', currency: 'EUR' },
    },
  },
  required: ['annual_gross_salary'],
};

function savesWhatIsSent() {
  let saved: unknown;
  server.use(
    http.patch('*/v1/employments/:employmentId', async ({ request }) => {
      saved = ((await request.json()) as { contract_details: unknown })
        .contract_details;
      return HttpResponse.json({ data: {} });
    }),
    http.get('*/v1/employments/:employmentId', () =>
      HttpResponse.json({ data: { employment: { contract_details: saved } } }),
    ),
  );
}

describe('sdkPayloadFor', () => {
  it.each(['rebuild', 'buildOnce'] as const)(
    'sends money back in cents after the %s form converts it to units',
    async (strategy) => {
      const result = await sdkPayloadFor(salarySchema, strategy, {
        annual_gross_salary: 100000,
      });

      expect(result).toEqual({
        ok: true,
        payload: { annual_gross_salary: 100000 },
        forcedFields: [],
      });
    },
  );

  it('fails when the SDK form rejects values the schema accepts', async () => {
    const result = await sdkPayloadFor(
      {
        type: 'object',
        properties: {
          is_eligible: {
            type: 'string',
            title: 'Eligible',
            oneOf: [
              { const: 'yes', title: 'Yes' },
              { const: 'no', title: 'No' },
            ],
            'x-jsf-presentation': { inputType: 'radio' },
          },
          eligibility: {
            type: 'string',
            const: 'yes',
            default: 'yes',
            enum: ['yes'],
            title: 'Eligibility',
            'x-jsf-presentation': { inputType: 'hidden' },
          },
        },
        allOf: [
          {
            if: {
              properties: { is_eligible: { const: 'no' } },
              required: ['is_eligible'],
            },
            then: {
              properties: { eligibility: { const: 'no', default: 'no' } },
            },
          },
        ],
      },
      'buildOnce',
      { is_eligible: 'no' },
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(
      /^the SDK form rejects values the schema accepts: \{"eligibility":/,
    );
  });
});

describe('differencesFromSaved', () => {
  it('lists each sent value that was saved differently or not at all', () => {
    expect(
      differencesFromSaved(
        { job_title: 'Engineer', work_hours_per_week: 40, bonus: 'no' },
        { job_title: 'Engineer', work_hours_per_week: 36, wage_type: 'salary' },
      ),
    ).toEqual([
      'work_hours_per_week: sent 40, saved 36',
      'bonus: sent "no", saved undefined',
    ]);
  });

  it('skips the ignored fields', () => {
    expect(
      differencesFromSaved(
        { overtime_eligible: 'yes', bonus: 'no' },
        { wage_type: 'salary' },
        ['overtime_eligible'],
      ),
    ).toEqual(['bonus: sent "no", saved undefined']);
  });
});

const overtimeSchema = (overtime: Record<string, unknown>) => ({
  type: 'object',
  properties: {
    overtime_eligible: {
      type: 'string',
      title: 'Overtime',
      'x-jsf-presentation': { inputType: 'radio' },
      ...overtime,
    },
  },
  required: ['overtime_eligible'],
});

function dropsOvertimeOnSave() {
  server.use(
    http.patch('*/v1/employments/:employmentId', () =>
      HttpResponse.json({ data: {} }),
    ),
    http.get('*/v1/employments/:employmentId', () =>
      HttpResponse.json({ data: { employment: { contract_details: {} } } }),
    ),
  );
}

describe('submitContractDetails', () => {
  it('passes when a forced value is not returned after save', async () => {
    dropsOvertimeOnSave();

    const result = await submitContractDetails(
      client,
      'emp-1',
      overtimeSchema({
        const: 'yes',
        default: 'yes',
        oneOf: [{ const: 'yes', title: 'Yes' }],
      }),
      3,
      { strategy: 'buildOnce' },
    );

    expect(result).toEqual({ ok: true });
  });

  it('fails when a forced value is saved as something else', async () => {
    server.use(
      http.patch('*/v1/employments/:employmentId', () =>
        HttpResponse.json({ data: {} }),
      ),
      http.get('*/v1/employments/:employmentId', () =>
        HttpResponse.json({
          data: {
            employment: { contract_details: { overtime_eligible: 'no' } },
          },
        }),
      ),
    );

    const result = await submitContractDetails(
      client,
      'emp-1',
      overtimeSchema({
        const: 'yes',
        default: 'yes',
        oneOf: [{ const: 'yes', title: 'Yes' }],
      }),
      3,
      { strategy: 'buildOnce' },
    );

    expect(result).toEqual({
      ok: false,
      error:
        'saved contract_details differ from what was sent: overtime_eligible: sent "yes", saved "no"',
    });
  });

  it('fails when a value the user chose is not returned after save', async () => {
    dropsOvertimeOnSave();

    const result = await submitContractDetails(
      client,
      'emp-1',
      overtimeSchema({
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
      }),
      3,
      { strategy: 'rebuild', seedValues: { overtime_eligible: 'no' } },
    );

    expect(result).toEqual({
      ok: false,
      error:
        'saved contract_details differ from what was sent: overtime_eligible: sent "no", saved undefined',
    });
  });

  it('passes when a known unsaved field is not returned after save', async () => {
    dropsOvertimeOnSave();

    const result = await submitContractDetails(
      client,
      'emp-1',
      overtimeSchema({
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
      }),
      3,
      {
        strategy: 'rebuild',
        seedValues: { overtime_eligible: 'no' },
        knownUnsavedFields: { overtime_eligible: 'not returned' },
      },
    );

    expect(result).toEqual({ ok: true });
  });

  it('fails when a known unsaved field is saved now', async () => {
    savesWhatIsSent();

    const result = await submitContractDetails(
      client,
      'emp-1',
      overtimeSchema({
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
      }),
      3,
      {
        strategy: 'rebuild',
        seedValues: { overtime_eligible: 'no' },
        knownUnsavedFields: { overtime_eligible: 'not returned' },
      },
    );

    expect(result).toEqual({
      ok: false,
      error:
        'known unsaved field(s) are saved now, remove them from KNOWN_UNSAVED_FIELDS: overtime_eligible',
    });
  });

  it('sends the filled values in the same request the Onboarding flow sends', async () => {
    let request: { url: string; body: unknown } | undefined;
    server.use(
      http.patch('*/v1/employments/:employmentId', async ({ request: req }) => {
        request = { url: req.url, body: await req.json() };
        return HttpResponse.json({ data: {} });
      }),
      http.get('*/v1/employments/:employmentId', () =>
        HttpResponse.json({
          data: {
            employment: { contract_details: { has_signing_bonus: 'no' } },
          },
        }),
      ),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3, {
      strategy: 'rebuild',
    });

    expect(result).toEqual({ ok: true });
    const url = new URL(request!.url);
    expect(url.pathname).toBe('/v1/employments/emp-1');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      skip_benefits: 'true',
      contract_details_json_schema_version: '3',
    });
    expect(request!.body).toEqual({
      contract_details: { has_signing_bonus: 'no' },
      pricing_plan_details: { frequency: 'monthly' },
    });
  });

  it('sends the seed values instead of filling those fields', async () => {
    let body: unknown;
    server.use(
      http.patch('*/v1/employments/:employmentId', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: {} });
      }),
      http.get('*/v1/employments/:employmentId', () =>
        HttpResponse.json({
          data: {
            employment: { contract_details: { has_signing_bonus: 'yes' } },
          },
        }),
      ),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3, {
      strategy: 'rebuild',
      seedValues: { has_signing_bonus: 'yes' },
    });

    expect(result).toEqual({ ok: true });
    expect(body).toEqual({
      contract_details: { has_signing_bonus: 'yes' },
      pricing_plan_details: { frequency: 'monthly' },
    });
  });

  it('passes when the employment saved what was sent', async () => {
    savesWhatIsSent();

    const result = await submitContractDetails(
      client,
      'emp-1',
      salarySchema,
      3,
      { strategy: 'buildOnce' },
    );

    expect(result).toEqual({ ok: true });
  });

  it('fails when the employment saved something else', async () => {
    server.use(
      http.patch('*/v1/employments/:employmentId', () =>
        HttpResponse.json({ data: {} }),
      ),
      http.get('*/v1/employments/:employmentId', () =>
        HttpResponse.json({
          data: {
            employment: { contract_details: { has_signing_bonus: 'yes' } },
          },
        }),
      ),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3, {
      strategy: 'rebuild',
    });

    expect(result).toEqual({
      ok: false,
      error:
        'saved contract_details differ from what was sent: has_signing_bonus: sent "no", saved "yes"',
    });
  });

  it('fails with the gateway error and the file fields it left empty', async () => {
    server.use(
      http.patch('*/v1/employments/:employmentId', () =>
        HttpResponse.json({ message: 'contract is required' }, { status: 422 }),
      ),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3, {
      strategy: 'rebuild',
    });

    expect(result).toEqual({
      ok: false,
      error:
        'PATCH /v1/employments/{id} -> {"message":"contract is required"} (file fields left empty: contract)',
    });
  });

  it('fails without a request when no values pass validation', async () => {
    const result = await submitContractDetails(
      client,
      'emp-1',
      {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            title: 'Days',
            minimum: 10,
            maximum: 5,
            'x-jsf-presentation': { inputType: 'number' },
          },
        },
        required: ['days'],
      },
      3,
      { strategy: 'rebuild' },
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(
      /^could not fill values that pass validation: \{"days":/,
    );
  });

  it('fails without a request when there is no schema', async () => {
    const result = await submitContractDetails(client, 'emp-1', null, 3, {
      strategy: 'rebuild',
    });

    expect(result).toEqual({
      ok: false,
      error: 'no contract_details schema to fill',
    });
  });
});

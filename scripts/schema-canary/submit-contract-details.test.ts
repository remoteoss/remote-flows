import { http, HttpResponse } from 'msw';
import { client } from '@/src/client/client.gen';
import { server } from '@/src/tests/server';
import { submitContractDetails } from './submit-contract-details';

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

describe('submitContractDetails', () => {
  it('sends the filled values in the same request the Onboarding flow sends', async () => {
    let request: { url: string; body: unknown } | undefined;
    server.use(
      http.patch('*/v1/employments/:employmentId', async ({ request: req }) => {
        request = { url: req.url, body: await req.json() };
        return HttpResponse.json({ data: {} });
      }),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3);

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
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3, {
      seedValues: { has_signing_bonus: 'yes' },
    });

    expect(result).toEqual({ ok: true });
    expect(body).toEqual({
      contract_details: { has_signing_bonus: 'yes' },
      pricing_plan_details: { frequency: 'monthly' },
    });
  });

  it('fails with the gateway error and the file fields it left empty', async () => {
    server.use(
      http.patch('*/v1/employments/:employmentId', () =>
        HttpResponse.json({ message: 'contract is required' }, { status: 422 }),
      ),
    );

    const result = await submitContractDetails(client, 'emp-1', schema, 3);

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
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(
      /^could not fill values that pass validation: \{"days":/,
    );
  });

  it('fails without a request when there is no schema', async () => {
    const result = await submitContractDetails(client, 'emp-1', null, 3);

    expect(result).toEqual({
      ok: false,
      error: 'no contract_details schema to fill',
    });
  });
});

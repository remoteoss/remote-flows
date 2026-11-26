import { createClient } from '../client/client';
import {
  createGPEmploymentMutation,
  gpFormSchemaOptions,
  selectGPFormSchema,
  selectGPLegalEntities,
} from './gpAdminOnboarding';

type Recorded = { url: URL; method: string; body: unknown };

function fakeClient(status: number, body: unknown) {
  const requests: Recorded[] = [];
  const client = createClient({
    baseUrl: 'https://gateway.test',
    fetch: async (input: RequestInfo | URL) => {
      const request = input as Request;
      const text = await request.text();
      requests.push({
        url: new URL(request.url),
        method: request.method,
        body: text ? JSON.parse(text) : undefined,
      });
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });
  return { client, requests };
}

describe('selectGPLegalEntities', () => {
  it('keeps only the legal entities with global payroll enabled', () => {
    const response = {
      data: {
        data: {
          legal_entities: [
            { id: 'usa', country_code: 'USA', global_payroll_enabled: false },
            { id: 'pri', country_code: 'PRI', global_payroll_enabled: true },
          ],
        },
      },
    } as unknown as Parameters<typeof selectGPLegalEntities>[0];

    expect(selectGPLegalEntities(response)).toEqual([
      { id: 'pri', country_code: 'PRI', global_payroll_enabled: true },
    ]);
  });
});

describe('selectGPFormSchema', () => {
  it('returns the schema inside the response envelope', () => {
    const schema = { type: 'object', properties: {} };
    const response = { data: { data: schema } } as unknown as Parameters<
      typeof selectGPFormSchema
    >[0];

    expect(selectGPFormSchema(response)).toEqual(schema);
  });
});

describe('gpFormSchemaOptions', () => {
  it('asks for the schema without an employment before one exists', async () => {
    const { client, requests } = fakeClient(200, { data: {} });

    await gpFormSchemaOptions(
      client,
      'PRI',
      'global_payroll_basic_information',
    ).queryFn();

    expect(requests[0].url.pathname).toBe(
      '/v1/countries/PRI/global_payroll_basic_information',
    );
    expect(requests[0].url.searchParams.has('employment_id')).toBe(false);
  });

  it('passes the employment once there is one', async () => {
    const { client, requests } = fakeClient(200, { data: {} });

    await gpFormSchemaOptions(
      client,
      'PRI',
      'global_payroll_contract_details',
      'emp-1',
    ).queryFn();

    expect(requests[0].url.searchParams.get('employment_id')).toBe('emp-1');
  });
});

describe('createGPEmploymentMutation', () => {
  const args = {
    countryCode: 'PRI',
    legalEntityId: 'pri',
    basicInformation: { name: 'Ana' },
  };

  it('creates a global payroll employee and returns its id', async () => {
    const { client, requests } = fakeClient(201, {
      data: { employment: { id: 'emp-1' } },
    });

    await expect(
      createGPEmploymentMutation(client).mutationFn(args),
    ).resolves.toBe('emp-1');
    expect(requests[0].method).toBe('POST');
    expect(requests[0].body).toEqual({
      type: 'global_payroll_employee',
      country_code: 'PRI',
      engaged_by_entity_slug: 'pri',
      basic_information: { name: 'Ana' },
    });
  });

  it('rejects with the status and the API message when the API refuses it', async () => {
    const { client } = fakeClient(422, {
      message: 'Unprocessable Entity',
      errors: { personal_email: ['is invalid'] },
    });

    await expect(
      createGPEmploymentMutation(client).mutationFn(args),
    ).rejects.toThrow(
      'Request failed with status 422: Unprocessable Entity: {"personal_email":["is invalid"]}',
    );
  });
});

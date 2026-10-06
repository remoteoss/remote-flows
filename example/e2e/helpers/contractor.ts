import { Page, expect } from '@playwright/test';

const COUNTRY_CODE = 'PRT';

export async function createContractorEmployment(page: Page, fullName: string) {
  const schemaResponse = await page.request.get(
    `/v1/countries/${COUNTRY_CODE}/contractor_basic_information`,
  );
  expect(
    schemaResponse.ok(),
    `GET contractor_basic_information returned ${schemaResponse.status()}`,
  ).toBe(true);
  const { data: schema } = (await schemaResponse.json()) as {
    data: { properties: Record<string, unknown>; required: string[] };
  };

  const values: Record<string, string> = {
    name: fullName,
    job_title: 'Software Engineer',
    login_email: 'personal',
    personal_email: `contractor.${Date.now()}@example.com`,
    provisional_start_date: new Date().toISOString().slice(0, 10),
  };
  expect(
    schema.required.filter((field) => !(field in values)),
    'contractor_basic_information requires fields this helper does not fill',
  ).toEqual([]);

  const employmentResponse = await page.request.post('/v1/employments', {
    data: {
      type: 'contractor',
      country_code: COUNTRY_CODE,
      basic_information: Object.fromEntries(
        Object.entries(values).filter(([field]) => field in schema.properties),
      ),
    },
  });
  expect(
    employmentResponse.ok(),
    `POST /v1/employments returned ${employmentResponse.status()}`,
  ).toBe(true);
  const { data } = (await employmentResponse.json()) as {
    data: { employment: { id: string } };
  };
  return data.employment.id;
}

export async function archiveEmployment(page: Page, employmentId: string) {
  const response = await page.request.delete(
    `/v1/sandbox/employments/${employmentId}`,
  );
  expect(
    response.ok(),
    `DELETE /v1/sandbox/employments returned ${response.status()}`,
  ).toBe(true);
}

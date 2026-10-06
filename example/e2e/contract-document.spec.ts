import { test, expect, Page } from '@playwright/test';
import {
  clickAndWaitForSave,
  fillForm,
  setupVercelBypass,
} from './helpers/general';

const COUNTRY_CODE = 'PRT';
const CONTRACT_DOCUMENTS_PATH =
  /^\/v1\/contractors\/employments\/[^/]+\/contract-documents$/;
const SIGN_PATH =
  /^\/v1\/contractors\/employments\/[^/]+\/contract-documents\/[^/]+\/sign$/;

async function createContractorEmployment(page: Page, fullName: string) {
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
    'contractor_basic_information requires fields this spec does not fill',
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

test.describe('Contract document', () => {
  let employmentId: string;
  let fullName: string;

  test.beforeEach(async ({ page }) => {
    employmentId = '';
    await setupVercelBypass(page);
    fullName = `Contractor ${Date.now()}`;
    employmentId = await createContractorEmployment(page, fullName);
  });

  test.afterEach(async ({ page }) => {
    if (!employmentId) return;

    const response = await page.request.delete(
      `/v1/sandbox/employments/${employmentId}`,
    );
    expect(
      response.ok(),
      `DELETE /v1/sandbox/employments returned ${response.status()}`,
    ).toBe(true);
  });

  test('creates, reviews and signs a contractor’s contract document', async ({
    page,
  }) => {
    await page.goto('/?demo=contract-document');

    await page.getByLabel('Employment ID:').fill(employmentId);
    await page
      .getByRole('button', { name: 'Create contract document' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Contract Details' }),
    ).toBeVisible();

    await fillForm(page, [
      {
        type: 'textField',
        name: 'services_and_deliverables',
        value:
          'Design and deliver a marketing website, including page mockups, the front-end implementation and handover documentation.',
      },
      {
        type: 'textField',
        name: 'termination.contractor_notice_period_amount',
        value: '15',
      },
      {
        type: 'textField',
        name: 'termination.company_notice_period_amount',
        value: '15',
      },
      {
        type: 'select',
        name: 'payment_terms.compensation_currency_code',
        value: 'USD',
      },
      {
        type: 'textField',
        name: 'payment_terms.compensation_gross_amount',
        value: '1000',
      },
      {
        type: 'select',
        name: 'payment_terms.period_unit',
        value: 'Hour',
      },
      {
        type: 'select',
        name: 'payment_terms.invoicing_frequency',
        value: 'Bi-weekly',
      },
    ]);

    const contractDocumentCreated = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        CONTRACT_DOCUMENTS_PATH.test(new URL(response.url()).pathname),
    );
    await page.getByRole('button', { name: 'Next Step' }).click();
    if (!(await contractDocumentCreated).ok()) {
      await clickAndWaitForSave(
        page,
        page.getByRole('button', { name: 'Continue anyway' }),
        'POST',
        CONTRACT_DOCUMENTS_PATH,
      );
    }

    await expect(
      page.getByRole('heading', { name: 'Contract Preview' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Review contract' }).click();
    const drawer = page.getByRole('dialog');
    await expect(
      drawer.getByRole('heading', { name: 'Contract Document' }),
    ).toBeVisible();
    await expect(drawer.locator('iframe')).toHaveAttribute(
      'src',
      /^data:application\/pdf;base64,/,
    );
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();

    await page.getByLabel('Enter full name').fill(fullName);
    await clickAndWaitForSave(
      page,
      page.getByRole('button', { name: 'Sign contract' }),
      'POST',
      SIGN_PATH,
    );

    await expect(
      page.getByRole('heading', { name: 'Contract signed' }),
    ).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import {
  archiveEmployment,
  createContractorEmployment,
} from './helpers/contractor';
import {
  clickAndWaitForSave,
  fillForm,
  setupVercelBypass,
} from './helpers/general';

const CONTRACT_DOCUMENTS_PATH =
  /^\/v1\/contractors\/employments\/[^/]+\/contract-documents$/;
const SIGN_PATH =
  /^\/v1\/contractors\/employments\/[^/]+\/contract-documents\/[^/]+\/sign$/;

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

    await archiveEmployment(page, employmentId);
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

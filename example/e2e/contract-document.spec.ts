/* oxlint-disable no-restricted-properties -- TODO: tech debt, this spec fakes the API instead of running against the sandbox. Move it to a vitest + MSW test in src/flows/ContractDocument/tests/ and delete it. */
import { test, expect, Page } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';

const EMPLOYMENT_ID = 'e2e-employment-grace';
const CONTRACT_DOCUMENT_ID = 'e2e-contract-document';

const employmentResponse = {
  data: {
    employment: {
      id: EMPLOYMENT_ID,
      full_name: 'Grace Hopper',
      type: 'contractor',
      contractor_type: 'standard',
      status: 'created',
      country: { code: 'PRT', name: 'Portugal' },
    },
  },
};

const contractDocumentsResponse = {
  data: {
    contract_documents: [
      {
        id: CONTRACT_DOCUMENT_ID,
        name: 'Contractor_Services_Agreement.pdf',
        type: 'contractor_services_agreement',
        status: 'awaiting_signatures',
        signatories: [],
      },
    ],
    current_page: 1,
    total_count: 1,
    total_pages: 1,
  },
};

const contractDocumentResponse = {
  data: {
    contract_document: {
      name: 'Contractor_Services_Agreement.pdf',
      status: 'awaiting_signatures',
      content: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKCg==',
      signatories: [],
    },
  },
};

/**
 * Registered after `setupVercelBypass`, which routes everything: Playwright matches routes in
 * reverse registration order, so the more specific stubs come last.
 */
async function stubContractDocumentApi(page: Page, signedWith: string[]) {
  await page.route(/\/v1\/employments\/[^/?]+/, (route) =>
    route.fulfill({ json: employmentResponse }),
  );
  await page.route(
    /\/v1\/countries\/[^/]+\/contractor-contract-details/,
    (route) =>
      route.fulfill({
        json: { data: { schema: { type: 'object', properties: {} } } },
      }),
  );
  await page.route(
    /\/v1\/contractors\/employments\/[^/]+\/contractor-currencies/,
    (route) => route.fulfill({ json: { data: [] } }),
  );
  await page.route(/\/v1\/employments\/[^/]+\/contract-documents/, (route) =>
    route.fulfill({ json: contractDocumentsResponse }),
  );
  await page.route(
    /\/v1\/contractors\/employments\/[^/]+\/contract-documents\/[^/]+$/,
    (route) => route.fulfill({ json: contractDocumentResponse }),
  );
  await page.route(
    /\/v1\/contractors\/employments\/[^/]+\/contract-documents\/[^/]+\/sign$/,
    async (route) => {
      signedWith.push(route.request().postDataJSON().signature);
      await route.fulfill({ json: { data: { status: 'ok' } } });
    },
  );
}

test.describe('Contract document', () => {
  test('reviews and signs the contractor’s existing contract document', async ({
    page,
  }) => {
    const signedWith: string[] = [];
    await setupVercelBypass(page);
    await stubContractDocumentApi(page, signedWith);

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/?demo=contract-document');

    await page.getByLabel('Employment ID:').fill(EMPLOYMENT_ID);
    await page
      .getByRole('button', { name: 'Create contract document' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Contract Preview' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Review contract' }).click();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('heading', { name: 'Contract Document' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByLabel('Enter full name').fill('Grace Hopper');
    await page.getByRole('button', { name: 'Sign contract' }).click();

    await expect(
      page.getByRole('heading', { name: 'Contract signed' }),
    ).toBeVisible();
    expect(signedWith).toEqual(['Grace Hopper']);
    expect(pageErrors).toEqual([]);
  });
});

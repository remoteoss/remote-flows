import { readFileSync } from 'node:fs';
import { expect, Page, test } from '@playwright/test';

type KeptEmployment = {
  country: string;
  employmentId: string;
  companyId: string;
  version: number | 'latest';
  sent: Record<string, unknown>;
  knownUnsavedFields: string[];
};

const employmentsFile = process.env.SCHEMA_CANARY_EMPLOYMENTS;
if (!employmentsFile) {
  throw new Error(
    'Set SCHEMA_CANARY_EMPLOYMENTS to the file written by npm run schema-canary -- --keep-submitted=<file>',
  );
}
const employments = JSON.parse(
  readFileSync(employmentsFile, 'utf8'),
) as KeptEmployment[];

const MAX_STEPS_BEFORE_CONTRACT_DETAILS = 4;

function fieldErrors(page: Page) {
  return page
    .locator('[data-slot="form-message"]')
    .evaluateAll((messages) =>
      messages.map(
        (message) =>
          `${message.closest('[data-field]')?.getAttribute('data-field')}: ${message.textContent}`,
      ),
    );
}

const NOT_PERSISTED_ACKNOWLEDGEMENTS = ['ack_non_eligible_job_titles'];

async function acknowledgeAgain(page: Page) {
  for (const field of NOT_PERSISTED_ACKNOWLEDGEMENTS) {
    const box = page.locator(
      `[data-field="${field}"] [role="checkbox"][data-state="unchecked"]`,
    );
    if ((await box.count()) === 0) continue;
    await box.click();
    test.info().annotations.push({
      type: 'acknowledged-again',
      description: `${field} is not persisted, so it was ticked again`,
    });
  }
}

async function continueUntilContractDetails(page: Page) {
  const stepTitle = page.getByTestId('onboarding-step-title');
  for (let step = 0; step < MAX_STEPS_BEFORE_CONTRACT_DETAILS; step++) {
    await expect(stepTitle).not.toBeEmpty();
    const current = await stepTitle.innerText();
    if (current === 'Contract Details') return;
    await test.step(`continue past ${current}`, async () => {
      await acknowledgeAgain(page);
      await page.locator('.submit-button').click();
      await expect(stepTitle, {
        message: `${current} did not move on. Field errors: ${JSON.stringify(await fieldErrors(page))}`,
      }).not.toHaveText(current);
    });
  }
  await expect(stepTitle).toHaveText('Contract Details');
}

async function answerKnownUnsavedFields(
  page: Page,
  fields: string[],
  sent: Record<string, unknown>,
) {
  for (const field of fields) {
    if (!(field in sent)) continue;
    const container = page.locator(`[data-field="${field}"]`);
    await expect(
      container.locator('[data-slot="form-message"]'),
      `${field} is listed in KNOWN_UNSAVED_FIELDS but came back filled in, so remove it from the list`,
    ).toBeVisible();
    const radio = container.locator(
      `[role="radio"][value="${String(sent[field])}"]`,
    );
    await expect(
      radio,
      `${field} can only be answered again when it is a radio`,
    ).toHaveCount(1);
    await radio.click();
    test.info().annotations.push({
      type: 'known-unsaved-field',
      description: `${field} came back empty and was answered again`,
    });
  }
}

function onboardingUrl(
  employmentId: string,
  country: string,
  version: number | 'latest',
) {
  const params = new URLSearchParams({
    demo: 'onboarding-basic',
    employmentId,
    countryCode: country,
  });
  if (version === 'latest') {
    params.set('contractDetailsVersion', version);
  }
  return `/?${params}`;
}

for (const {
  country,
  employmentId,
  companyId,
  version,
  sent,
  knownUnsavedFields,
} of employments) {
  test(
    `${country}@${version} re-submits the saved contract details unchanged`,
    {
      annotation: {
        type: 'schema-canary-employment',
        description: employmentId,
      },
    },
    async ({ page }) => {
      await page.goto(onboardingUrl(employmentId, country, version));
      await page.locator('#companyId').fill(companyId);
      await page.locator('.onboarding-form-button').click();

      await continueUntilContractDetails(page);
      await expect(
        page.locator('[data-field]').first(),
        'the contract details form rendered no fields',
      ).toBeVisible();

      if (knownUnsavedFields.length > 0) {
        await page.locator('.submit-button').click();
        await answerKnownUnsavedFields(page, knownUnsavedFields, sent);
      }

      const patch = page.waitForRequest(
        (request) =>
          request.method() === 'PATCH' &&
          new URL(request.url()).pathname === `/v1/employments/${employmentId}`,
        { timeout: 30_000 },
      );
      await page.locator('.submit-button').click();
      const request = await patch.catch(async () => {
        throw new Error(
          `Continue on contract details sent no PATCH. Field errors: ${JSON.stringify(await fieldErrors(page))}`,
        );
      });
      const response = await request.response();

      expect(
        response?.ok(),
        `PATCH /v1/employments/${employmentId} returned ${response?.status()}: ${await response?.text()}`,
      ).toBe(true);
      expect(
        (request.postDataJSON() as { contract_details?: unknown })
          .contract_details,
        'the browser sent different contract_details than the canary saved',
      ).toEqual(sent);
      await expect(page.getByTestId('onboarding-step-title')).not.toHaveText(
        'Contract Details',
      );
    },
  );
}

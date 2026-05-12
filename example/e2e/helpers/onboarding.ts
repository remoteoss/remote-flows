import { Page } from '@playwright/test';

interface fillOnboardingIntroductionFormOptions {
  company_id: string;
  type: string;
}

export async function fillOnboardingIntroductionForm(
  page: Page,
  options: Partial<fillOnboardingIntroductionFormOptions>,
) {
  if (options.type) {
    await page.selectOption('#type', options.type);
  }
  if (options.company_id) {
    await page.fill('#companyId', options.company_id);
  }

  await page.click('.onboarding-form-button');
}

interface fillOnboardingStep1FormOptions {
  country_id: string;
}

export async function fillOnboardingStep1Forms(
  page: Page,
  options: Partial<fillOnboardingStep1FormOptions>,
) {
  if (options.country_id) {
    const dropdown = page.getByRole('combobox', { name: 'Country' });
    await dropdown.click();
    await page.getByRole('option', { name: 'France' }).click();
  }

  await page.click('.submit-button');
}
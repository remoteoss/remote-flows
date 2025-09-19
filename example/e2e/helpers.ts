import { Page } from '@playwright/test';

interface FillEstimationFormOptions {
  country: string;
  currency: string;
  salary: string;
}

export async function fillEstimationForm(
  page: Page,
  options: Partial<FillEstimationFormOptions>,
) {
  if (options.country) {
    await page.selectOption('#country', options.country);
  }
  if (options.currency) {
    await page.selectOption('#currency', options.currency);
  }
  if (options.salary) {
    await page.fill('#salary_conversion', options.salary);
  }
  await page.click('.submit-button');
}

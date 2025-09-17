import { Page } from '@playwright/test';

interface FillEstimationFormOptions {
  country: string;
  currency: string;
  salary: string;
}

export async function fillEstimationForm(
  page: Page,
  options: FillEstimationFormOptions,
) {
  await page.selectOption('#country', options.country);
  await page.selectOption('#currency', options.currency);
  await page.fill('#salary_conversion', options.salary);
  await page.click('.submit-button');
}

import { test, expect } from '@playwright/test';
import {
  fillTextField,
  getPublicHolidays,
  setupVercelBypass,
} from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
} from './helpers/onboarding';

test.describe('Onboard China employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('converts the annual gross salary on contract details', async ({
    page,
  }) => {
    await fillOnboardingIntroductionForm(page, {});

    const stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, { country_id: 'China' });
    await expect(stepTitle).toHaveText('Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: `John Doe${Date.now()}`,
      login_email: 'personal',
      personal_email: `john.doe${Date.now()}@example.com`,
      work_email: `john.doe${Date.now()}@pro.com`,
      job_title: 'Software Engineer',
      country_id: 'Portugal',
      tax_job_category: 'Finance',
      provisional_start_date: 'auto',
      excluded_start_dates: await getPublicHolidays(page, 'CHN'),
      has_seniority_date: 'no',
    });
    await expect(stepTitle).toHaveText('Contract Details');

    await fillTextField(page, 'annual_gross_salary', '100000');

    const conversionResponse = page.waitForResponse((response) =>
      /\/v1\/currency-converter/.test(new URL(response.url()).pathname),
    );
    await page
      .locator('[data-field="annual_gross_salary"]')
      .getByRole('button', { name: /Show .+ conversion/ })
      .click();

    const response = await conversionResponse;
    expect(response.status()).toBe(200);

    const { data } = await response.json();
    expect(Number(data.conversion_data.exchange_rate)).toBeGreaterThan(0);

    const conversion = page.locator(
      'input[name="annual_gross_salary_conversion"]',
    );
    await expect(conversion).not.toHaveValue('');
    await expect(conversion).not.toHaveValue('100000');
  });
});

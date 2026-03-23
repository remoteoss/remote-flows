import { test, expect, Page } from '@playwright/test';
import { setupVercelBypass } from '../cost-calculator/helpers';

async function initializeOnboardingForm(page: Page) {
  await page.click('button[type="submit"]:has-text("Start Onboarding")');
}

test.describe('Onboarding EOR', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto(
      `/?demo=onboarding-basic&employment_id=E2E_EMPLOYMENT_ID&company_id=E2E_COMPANY_ID&employment_basic_information_version=1`,
    );
  });

  test('fills the onboarding form', async ({ page }) => {
    // submit the Start Onboarding button
    await initializeOnboardingForm(page);

    // assert that the Select Country step is visible
    await expect(
      page.locator('h1.heading', { hasText: 'Select Country' }),
    ).toBeVisible();
  });
});

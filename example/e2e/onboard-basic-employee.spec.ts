import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import { fillOnboardingIntroductionForm, fillOnboardingStep1Forms } from './helpers/onboarding';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill onboarding flow form', async ({ page }) => {
        const headerAmount = page.getByText(
      /Standard onboarding flow/,
    );

    await expect(headerAmount).toBeVisible();

    await fillOnboardingIntroductionForm(page, { 
      company_id: '1551480a-b8d5-44a7-8ad1-0dee45dcc934',
      type: 'employee',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    console.log(stepTitle)
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Forms(page, { 
      country_id: 'France'
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    console.log(stepTitle)
    await expect(stepTitle).toHaveText('Basic Information');
  });
});

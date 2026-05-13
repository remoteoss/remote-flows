import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingStep3Form,
  fillOnboardingStep4Form,
} from './helpers/onboarding';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill onboarding flow form', async ({ page }) => {
    const headerAmount = page.getByText(/Standard onboarding flow/);

    await expect(headerAmount).toBeVisible();

    await fillOnboardingIntroductionForm(page, {
      company_id: '1551480a-b8d5-44a7-8ad1-0dee45dcc934',
      type: 'employee',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'France',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: 'John Doe',
      personal_email: 'john.doe@example.com',
      work_email: 'john.doe@pro.com',
      job_title: 'Software Engineer',
      country_id: 'France',
      tax_job_category: 'Finance',
      provisional_start_date: 'auto',
      has_seniority_date: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Contract Details');

    await fillOnboardingStep3Form(page, {
      contract_duration_type: true,
      work_schedule: 'full_time',
      work_hours_per_week: '35',
      executive_experience_level: 'Position 1-1',
      annual_gross_salary: '50000',
      has_signing_bonus: 'no',
      has_bonus: 'no',
      has_commissions: 'no',
      equity_compensation: 'no',
      role_description: 'A'.repeat(100),
      probation_length: '3',
      renewal_probation_length: true,
      home_office_allowance: '25',
      hardship_allowance: '25',
      work_address_is_home_address: 'yes',
      non_compete_clause_apply: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Benefits');

    await fillOnboardingStep4Form(page, {
      mental_health: 'Basic Mental Health Program',
      business_travel_insurance: 'Basic Business Travel',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Review');
  });
});

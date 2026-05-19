import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingStep3SpainForm,
  fillOnboardingStep4SpainForm,
} from './helpers/onboarding';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill basic employee flow form', async ({ page }) => {
    const headerAmount = page.getByText(/Standard onboarding flow/);

    await expect(headerAmount).toBeVisible();

    await fillOnboardingIntroductionForm(page, {
      company_id: '460201ed-a8c0-4e75-89dc-6d5eae35f65e',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'Spain',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: `John Doe${Date.now()}`,
      personal_email: `john.doe${Date.now()}@example.com`,
      work_email: `john.doe${Date.now()}@pro.com`,
      job_title: 'Software Engineer',
      country_id: 'Portugal',
      tax_job_category: 'Finance',
      provisional_start_date: 'auto',
      has_seniority_date: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Contract Details');

    await fillOnboardingStep3SpainForm(page, {
      contract_duration_type: 'indefinite',
      work_schedule: 'full_time',
      probation_length: '3',
      probation_length_ack: true,
      available_pto_type: 'fixed',
      available_pto: '25',
      overtime_compensation_method: 'payout',
      role_description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
      experience_level: 'Group Level A',
      work_address_is_home_address: 'yes',
      annual_gross_salary: '50000',
      annual_bonus_ack: true,
      salary_installments: '12 months',
      allowances: '',
      has_signing_bonus: 'no',
      has_bonus: 'no',
      has_commissions: 'no',
      equity_compensation: 'no',
      non_compete_clause_apply: 'no',
      has_social_security_number: 'yes',
      work_equipment: '200',
      compensation_expenses_ack: true,
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Benefits');

    await fillOnboardingStep4SpainForm(page, {
      life_insurance_type: 'Basic',
      life_insurance: 'Life Insurance - $50K',
      health_insurance_coverage: 'Single',
      health_insurance: 'Sanitas Standard Medical (Employee Only)',
      retirement: 'Basic Retirement',
      mental_health: 'Basic Mental Health Program',
      wellness: '$25 Wellness Plan',
      business_travel: 'Basic Business Travel',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Review');
    await page.click('.submit-button');
  });
});

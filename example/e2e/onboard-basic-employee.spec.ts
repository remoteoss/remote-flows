import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingStep3SpainForm,
  fillOnboardingStep4SpainForm,
  fillOnboardingStep3FranceForm,
  fillOnboardingStep4FranceForm,
} from './helpers/onboarding';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill onboarding French employee flow form', async ({ page }) => {
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

    await fillOnboardingStep3FranceForm(page, {
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

    await fillOnboardingStep4FranceForm(page, {
      mental_health: 'Basic Mental Health Program',
      business_travel_insurance: 'Basic Business Travel',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Review');
  });

  test('Fill onboarding Spanish employee flow form', async ({ page }) => {
    const headerAmount = page.getByText(/Standard onboarding flow/);

    await expect(headerAmount).toBeVisible();

    await fillOnboardingIntroductionForm(page, {
      company_id: '1551480a-b8d5-44a7-8ad1-0dee45dcc934',
      type: 'employee',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'Spain',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: 'John Doe',
      personal_email: 'john.doe@example.com',
      work_email: 'john.doe@pro.com',
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
      role_description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
      experience_level: 'Group Level A',
      work_address_is_home_address: 'yes',
      annual_gross_salary: '50000',
      overtime_compensation_method: 'payout',
      annual_bonus_ack: true,
      salary_installments: true,
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
  });
});

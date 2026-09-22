import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingEngagementAgreementDetailsGermanyForm,
  fillOnboardingStep3GermanyForm,
} from './helpers/onboarding';

test.describe('Onboard Germany employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill Germany employee flow form', async ({ page }) => {
    const headerAmount = page.getByText(/Standard onboarding flow/);
    await expect(headerAmount).toBeVisible();

    await fillOnboardingIntroductionForm(page, {
      company_id: '460201ed-a8c0-4e75-89dc-6d5eae35f65e',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'Germany',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: `John Doe${Date.now()}`,
      login_email: 'personal',
      personal_email: `john.doe${Date.now()}@example.com`,
      work_email: `john.doe${Date.now()}@pro.com`,
      mobile_number_country: 'Germany +49',
      mobile_number: '15123456789',
      job_title: 'Software Engineer',
      country_id: 'Portugal',
      tax_job_category: 'Finance',
      provisional_start_date: 'auto',
      has_seniority_date: 'no',
    });

    // Germany-only: shown whenever the API returns engagement_agreement_details fields.
    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Labor leasing in Germany');

    await fillOnboardingEngagementAgreementDetailsGermanyForm(page, {
      has_business_presence: 'no',
      has_similar_roles: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Contract Details');

    await fillOnboardingStep3GermanyForm(page, {
      contract_end_date: 'auto',
      work_schedule: 'full_time',
      probation_length_choice: 'recommended',
      notice_period: '1',
      available_pto_type: 'unlimited',
      required_qualifications: "Bachelor's degree",
      role_description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
      experience_level:
        'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
      role_requires_license: 'no',
      work_address_is_home_address: 'yes',
      annual_gross_salary: '50000',
      has_signing_bonus: 'no',
      has_bonus: 'no',
      has_commissions: 'no',
      equity_compensation: 'no',
      non_compete_clause_apply: 'no',
      ancillary_positions_clause_apply: 'no',
      work_equipment_provided: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Benefits');
  });
});

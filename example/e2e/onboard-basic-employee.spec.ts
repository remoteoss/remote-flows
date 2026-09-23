import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';
import {
  expectOnboardingStep,
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingStep3SpainForm,
} from './helpers/onboarding';
import {
  fillOnboardingBenefitsStepDynamically,
  watchForBenefitsSchema,
} from './helpers/benefits';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill basic employee flow form', async ({ page }) => {
    test.slow();

    const headerAmount = page.getByText(/Standard onboarding flow/);

    await expect(headerAmount).toBeVisible();

    // Registered before Introduction submits: the benefit-offers schema request fires as soon
    // as the employment is created there, not when the user reaches the Benefits step.
    const benefitsSchemaPromise = watchForBenefitsSchema(page);

    await fillOnboardingIntroductionForm(page, {
      company_id: '460201ed-a8c0-4e75-89dc-6d5eae35f65e',
    });

    await expectOnboardingStep(page, 'Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'Spain',
    });

    await expectOnboardingStep(page, 'Basic Information');

    await fillOnboardingStep2Form(page, {
      fullname: `John Doe${Date.now()}`,
      login_email: 'personal',
      personal_email: `john.doe${Date.now()}@example.com`,
      work_email: `john.doe${Date.now()}@pro.com`,
      job_title: 'Software Engineer',
      country_id: 'Portugal',
      tax_job_category: 'Finance',
      provisional_start_date: 'auto',
      has_seniority_date: 'no',
    });

    await expectOnboardingStep(page, 'Contract Details');

    await fillOnboardingStep3SpainForm(page, {
      work_schedule: 'full_time',
      probation_length: '3',
      probation_length_ack: true,
      available_pto_type: 'fixed',
      available_pto: '25',
      overtime_compensation_method: 'payout',
      role_description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
      experience_level:
        'Group Level A - Workers who thanks to their professional knowledge and experience, coordinate, plan and manage the resources available to them, ensuring the achievement of the objectives pursued. They carry out these activities with autonomy and supervision. (probation period - 6 months)',
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
      cba_area: '1',
      cba_group: 'A',
      cba_level: '1',
      has_social_security_number: 'yes',
      work_equipment: '200',
      compensation_expenses_ack: true,
      // Only rendered when the job-title eligibility check applies; the helper skips them
      // when it does not.
      role_is_onsite: 'yes',
      role_requires_license: 'no',
    });

    await expectOnboardingStep(page, 'Benefits');

    await fillOnboardingBenefitsStepDynamically(page, benefitsSchemaPromise);

    await expectOnboardingStep(page, 'Review');
    await page.click('.submit-button');
  });
});

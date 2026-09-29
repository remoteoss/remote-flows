import { test, expect } from '@playwright/test';
import { getPublicHolidays, setupVercelBypass } from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
  fillOnboardingStep3PortugalForm,
} from './helpers/onboarding';
import {
  fillOnboardingBenefitsStepDynamically,
  watchForBenefitsSchema,
} from './helpers/benefits';

test.describe('Onboard Portugal employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('Fill Portugal employee flow form', async ({ page }) => {
    const headerAmount = page.getByText(/Standard onboarding flow/);
    await expect(headerAmount).toBeVisible();

    const benefitsSchemaPromise = watchForBenefitsSchema(page);
    const contractDetailsSchemaPromise = page.waitForResponse((response) =>
      /\/v1\/countries\/PRT\/contract_details(\?|$)/.test(response.url()),
    );

    await fillOnboardingIntroductionForm(page, {
      company_id: '460201ed-a8c0-4e75-89dc-6d5eae35f65e',
    });

    let stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Select Country');

    await fillOnboardingStep1Form(page, {
      country_id: 'Portugal',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
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
      excluded_start_dates: await getPublicHolidays(page, 'PRT'),
      has_seniority_date: 'no',
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Contract Details');

    const contractDetailsSchema = await (
      await contractDetailsSchemaPromise
    ).json();
    expect(
      contractDetailsSchema.data['x-rmt-meta']?.jsfVersion,
      'Portugal must stay on a jsf v0 contract_details schema for this spec to cover the v0 path',
    ).toBeUndefined();

    await fillOnboardingStep3PortugalForm(page, {
      contract_duration_type: true,
      work_schedule: 'full_time',
      working_hours_exemption: 'no',
      has_probation_period: 'no',
      available_pto_type: 'fixed',
      available_pto: '22',
      role_description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
      experience_level:
        'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
      role_is_onsite: 'no',
      role_requires_license: 'no',
      work_address_is_home_address: 'yes',
      annual_gross_salary: '50000',
      has_signing_bonus: 'no',
      has_bonus: 'no',
      has_commissions: 'no',
      equity_compensation: 'no',
      work_from_home_allowance_ack: true,
      annual_training_hours_ack: true,
      salary_installments_confirmation: true,
      offboarding_allowances_ack: true,
    });

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Benefits');

    await fillOnboardingBenefitsStepDynamically(page, benefitsSchemaPromise);

    stepTitle = page.getByTestId('onboarding-step-title');
    await expect(stepTitle).toHaveText('Review');
  });
});

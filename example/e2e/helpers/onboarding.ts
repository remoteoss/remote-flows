import { Page } from '@playwright/test';
import { fillForm } from './general';

interface fillOnboardingIntroductionFormOptions {
  company_id: string;
  employment_id?: string;
  external_id?: string;
}

export async function fillOnboardingIntroductionForm(
  page: Page,
  options: Partial<fillOnboardingIntroductionFormOptions>,
) {
  await fillForm(page, [
    { type: 'textField', value: options.company_id, name: 'companyId' },
    {
      type: 'select',
      value: 'employee',
      name: 'type',
      options: { nativeSelect: true },
    },
    { type: 'textField', value: options.employment_id, name: 'employmentId' },
    { type: 'textField', value: options.external_id, name: 'externalId' },
  ]);

  await page.click('.onboarding-form-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep1FormOptions {
  country_id?: string;
}

export async function fillOnboardingStep1Form(
  page: Page,
  options: Partial<fillOnboardingStep1FormOptions>,
) {
  await fillForm(page, [
    { type: 'select', value: options.country_id, name: 'country' },
  ]);

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep2FormOptions {
  fullname?: string;
  personal_email?: string;
  work_email?: string;
  job_title?: string;
  country_id?: string;
  tax_job_category?: string;
  provisional_start_date?: string;
  has_seniority_date?: string;
}

export async function fillOnboardingStep2Form(
  page: Page,
  options: Partial<fillOnboardingStep2FormOptions>,
) {
  await fillForm(page, [
    { type: 'textField', value: options.fullname, name: 'name' },
    { type: 'textField', value: options.personal_email, name: 'email' },
    { type: 'textField', value: options.work_email, name: 'work_email' },
    { type: 'textField', value: options.job_title, name: 'job_title' },
    {
      type: 'comboBox',
      value: options.country_id,
      name: 'tax_servicing_countries',
    },
    {
      type: 'comboBox',
      value: options.tax_job_category,
      name: 'tax_job_category',
    },
    {
      type: 'datepicker',
      value: options.provisional_start_date,
      testId: 'date-picker-button-provisional_start_date',
    },
    {
      type: 'radio',
      value: options.has_seniority_date,
      name: 'has_seniority_date',
    },
  ]);

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep3SpainFormOptions {
  contract_duration_type?: string;
  work_schedule?: string;
  probation_length?: string;
  probation_length_ack?: boolean;
  available_pto_type?: string;
  available_pto?: string;
  role_description?: string;
  experience_level?: string;
  role_is_onsite?: string;
  role_requires_license?: string;
  work_address_is_home_address?: string;
  annual_gross_salary?: string;
  annual_bonus_ack?: boolean;
  salary_installments?: string;
  overtime_compensation_method?: string;
  allowances?: string;
  has_signing_bonus?: string;
  has_bonus?: string;
  has_commissions?: string;
  equity_compensation?: string;
  non_compete_clause_apply?: string;
  has_social_security_number?: string;
  work_equipment?: string;
  compensation_expenses_ack?: boolean;
}

export async function fillOnboardingStep3SpainForm(
  page: Page,
  options: Partial<fillOnboardingStep3SpainFormOptions>,
) {
  await fillForm(page, [
    {
      type: 'radio',
      value: options.contract_duration_type,
      name: 'contract_duration_type',
    },
    {
      type: 'radio',
      value: options.work_schedule,
      name: 'work_schedule',
    },
    {
      type: 'textField',
      value: options.probation_length,
      name: 'probation_length',
    },
    {
      type: 'checkbox',
      value: options.probation_length_ack ? 'yes' : '',
      name: 'probation_length_ack',
    },
    {
      type: 'radio',
      value: options.available_pto_type,
      name: 'available_pto_type',
    },
    {
      type: 'radio',
      value: options.overtime_compensation_method,
      name: 'overtime_compensation_method',
    },
    {
      type: 'textField',
      value: options.available_pto,
      name: 'available_pto',
    },
    {
      type: 'textField',
      value: options.role_description,
      name: 'role_description',
    },
    {
      type: 'radio',
      value: options.experience_level,
      name: 'experience_level',
    },
    {
      type: 'radio',
      value: options.role_is_onsite,
      name: 'role_is_onsite',
    },
    {
      type: 'radio',
      value: options.role_requires_license,
      name: 'role_requires_license',
    },
    {
      type: 'radio',
      value: options.work_address_is_home_address,
      name: 'work_address_is_home_address',
    },
    {
      type: 'textField',
      value: options.annual_gross_salary,
      name: 'annual_gross_salary',
    },
    {
      type: 'checkbox',
      value: options.annual_bonus_ack ? 'yes' : '',
      name: 'annual_bonus_ack',
    },
    {
      type: 'comboBox',
      value: options.salary_installments,
      name: 'is_salary_prorated',
    },
    {
      type: 'textField',
      value: options.allowances,
      name: 'allowances',
    },
    {
      type: 'radio',
      value: options.has_signing_bonus,
      name: 'has_signing_bonus',
    },
    {
      type: 'radio',
      value: options.has_bonus,
      name: 'has_bonus',
    },
    {
      type: 'radio',
      value: options.has_commissions,
      name: 'has_commissions',
    },
    {
      type: 'radio',
      value: options.equity_compensation,
      name: 'equity_compensation.offer_equity_compensation',
    },
    {
      type: 'radio',
      value: options.non_compete_clause_apply,
      name: 'non_compete_clause_apply',
    },
    {
      type: 'radio',
      value: options.has_social_security_number,
      name: 'has_social_security_number',
    },
    {
      type: 'textField',
      value: options.work_equipment,
      name: 'work_equipment',
    },
    {
      type: 'checkbox',
      value: options.compensation_expenses_ack ? 'yes' : '',
      name: 'compensation_expenses_ack',
    },
  ]);

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep4SpainFormOptions {
  life_insurance_type?: string;
  life_insurance?: string;
  health_insurance_coverage?: string;
  health_insurance?: string;
  retirement?: string;
  mental_health?: string;
  wellness?: string;
  business_travel?: string;
}

export async function fillOnboardingStep4SpainForm(
  page: Page,
  options: Partial<fillOnboardingStep4SpainFormOptions>,
) {
  const isLocked = await page.getByText('Locked Benefit').first().isVisible();

  if (!isLocked) {
    await fillForm(page, [
      {
        type: 'radio',
        value: options.life_insurance_type,
        name: 'f90cb339-172d-4d24-9ee6-da2e2ccc954e.filter',
      },
      {
        type: 'radio',
        value: options.life_insurance,
        name: 'f90cb339-172d-4d24-9ee6-da2e2ccc954e.value',
      },
      {
        type: 'radio',
        value: options.health_insurance_coverage,
        name: '88081a16-882a-42b8-8cd5-6abb30585e4e.filter',
      },
      {
        type: 'radio',
        value: options.health_insurance,
        name: '88081a16-882a-42b8-8cd5-6abb30585e4e.value',
      },
      {
        type: 'radio',
        value: options.retirement,
        name: '57b4108b-74d4-4830-ad11-68a46679f88c.value',
      },
      {
        type: 'radio',
        value: options.mental_health,
        name: '4a2d0edb-ebd9-49af-ad79-7390deb7ee71.value',
      },
      {
        type: 'radio',
        value: options.wellness,
        name: '5ffc8e84-1304-4abb-91c2-4d43b1fece5d.value',
      },
      {
        type: 'radio',
        value: options.business_travel,
        name: '91dd5796-5ed7-449e-9a75-15c07c288970.value',
      },
    ]);
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

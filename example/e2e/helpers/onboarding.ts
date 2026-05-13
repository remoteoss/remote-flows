import { Page } from '@playwright/test';

interface fillOnboardingIntroductionFormOptions {
  company_id?: string;
  type?: string;
  employment_id?: string;
  external_id?: string;
}

export async function fillOnboardingIntroductionForm(
  page: Page,
  options: Partial<fillOnboardingIntroductionFormOptions>,
) {
  if (options.company_id) {
    await page.fill('#companyId', options.company_id);
  } else {
    await page.fill('#companyId', '');
  }

  if (options.type) {
    await page.selectOption('#type', options.type);
  }

  if (options.employment_id) {
    await page.fill('#employmentId', options.employment_id);
  } else {
    await page.fill('#employmentId', '');
  }

  if (options.external_id) {
    await page.fill('#externalId', options.external_id);
  } else {
    await page.fill('#externalId', '');
  }

  await page.click('.onboarding-form-button');
}

interface fillOnboardingStep1FormOptions {
  country_id?: string;
}

export async function fillOnboardingStep1Form(
  page: Page,
  options: Partial<fillOnboardingStep1FormOptions>,
) {
  if (options.country_id) {
    await page.locator('[data-field="country"]').click();
    await page.getByRole('option', { name: 'France' }).click();
  }

  await page.click('.submit-button');
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
  if (options.fullname) {
    await page.locator('[data-field="name"]').locator('input').fill(options.fullname);
  } 

  if (options.personal_email) {
    await page.locator('[data-field="email"]').locator('input').fill(options.personal_email);
  } 

  if (options.work_email) {
    await page.locator('[data-field="work_email"]').locator('input').fill(options.work_email);
  }

  if(options.job_title) {
    await page.locator('[data-field="job_title"]').locator('input').fill(options.job_title);
  }

  if (options.country_id) {
    await page.locator('[data-field="tax_servicing_countries"]').getByRole('combobox').click();
    await page.getByRole('option', { name: options.country_id }).click();
  }

  if (options.tax_job_category) {
    await page.locator('[data-field="tax_job_category"]').getByRole('combobox').click();
    await page.getByRole('option', { name: options.tax_job_category }).click();
  }

  if (options.provisional_start_date) {
    await page.getByTestId('date-picker-button-provisional_start_date').click();    
    if (options.provisional_start_date === "auto") {
      await page.locator('button[role="gridcell"]:not([disabled])').first().click();
    } else {
      await page.getByRole('button', { name: options.provisional_start_date, exact: true }).and(page.locator(':not([disabled])')).first().click();
    }
  }

  if(options.has_seniority_date) {
    await page.locator(`[data-field="has_seniority_date"] button[value="${options.has_seniority_date}"]`).click();
  }
  
  await page.click('.submit-button');
}

interface fillOnboardingStep3FormOptions {
  contract_duration_type?: boolean;
  work_schedule?: string;
  work_hours_per_week?: string;
  executive_experience_level?: string;
  annual_gross_salary?: string;
  has_signing_bonus?: string;
  has_bonus?: string;
  has_commissions?: string;
  equity_compensation?: string;
  role_description?: string;
  probation_length?: string;
  renewal_probation_length?: boolean;
  home_office_allowance?: string;
  hardship_allowance?: string;
  work_address_is_home_address?: string;
  non_compete_clause_apply?: string;
}

export async function fillOnboardingStep3Form(
  page: Page,
  options: Partial<fillOnboardingStep3FormOptions>,
) {
  if (options.contract_duration_type) {
    await page.locator(`[data-field="contract_duration_type"] button[value="on"]`).click();
  }

  if (options.work_schedule) {
    await page.locator(`[data-field="work_schedule"] button[role="radio"][value="${options.work_schedule}"]`).click();
  }

  if (options.work_hours_per_week) {
    await page.locator(`[data-field="work_hours_per_week"] button[role="radio"][value="${options.work_hours_per_week}"]`).click();
  }

  if (options.executive_experience_level) {
    await page
      .locator(`[data-field="executive_experience_level"] button[role="radio"][value^="${options.executive_experience_level}"]`)
      .click();
  }

  if (options.annual_gross_salary) {
    await page.locator('[data-field="annual_gross_salary"] input').fill(options.annual_gross_salary);
  }

  if (options.has_signing_bonus) {
    await page.locator(`[data-field="has_signing_bonus"] button[role="radio"][value="${options.has_signing_bonus}"]`).click();
  }

  if (options.has_bonus) {
    await page.locator(`[data-field="has_bonus"] button[role="radio"][value="${options.has_bonus}"]`).click();
  }

  if (options.has_commissions) {
    await page.locator(`[data-field="has_commissions"] button[role="radio"][value="${options.has_commissions}"]`).click();
  }

  if (options.equity_compensation) {
    await page.locator(`[data-field="equity_compensation.offer_equity_compensation"] button[role="radio"][value="${options.equity_compensation}"]`).click();
  }

  if (options.role_description) {
    await page.locator('[data-field="role_description"] textarea').fill(options.role_description);
  }

  if (options.probation_length) {
    await page.locator('[data-field="probation_length"] input').fill(options.probation_length);
  }

  if (options.renewal_probation_length) {
    await page.locator(`[data-field="renewal_probation_length"] button[role="checkbox"]`).click();
  }

  if (options.home_office_allowance) {
    await page.locator('[data-field="home_office_allowance"] input').fill(options.home_office_allowance);
  }

  if (options.hardship_allowance) {
    await page.locator('[data-field="hardship_allowance"] input').fill(options.hardship_allowance);
  }

  if (options.work_address_is_home_address) {
    await page.locator(`[data-field="work_address_is_home_address"] button[role="radio"][value="${options.work_address_is_home_address}"]`).click();
  }

  if (options.non_compete_clause_apply) {
    await page.locator(`[data-field="non_compete_clause_apply"] button[role="radio"][value="${options.non_compete_clause_apply}"]`).click();
  }

  await page.click('.submit-button');
}

interface fillOnboardingStep4FormOptions {
  mental_health?: string;
  business_travel_insurance?: string;
}

export async function fillOnboardingStep4Form(
  page: Page,
  options: Partial<fillOnboardingStep4FormOptions>,
) {
  if (options.mental_health) {
    await page.getByRole('radio', { name: options.mental_health }).click();
  }

  if (options.business_travel_insurance) {
    await page.getByRole('radio', { name: options.business_travel_insurance }).click();
  }

  await page.click('.submit-button');
}
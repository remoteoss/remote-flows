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
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep1FormOptions {
  country_id?: string;
}

export async function fillOnboardingStep1Form(
  page: Page,
  options: Partial<fillOnboardingStep1FormOptions>,
) {
  if (options.country_id) {
    const dropdown = page.locator('[data-field="country"]');
    await dropdown.click();
    const option = page.getByRole('option', { name: options.country_id });
    await option.waitFor({ state: 'visible' });
    await option.dispatchEvent('click');
  }

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
  if (options.fullname) {
    await page
      .locator('[data-field="name"]')
      .locator('input')
      .fill(options.fullname);
  }

  if (options.personal_email) {
    await page
      .locator('[data-field="email"]')
      .locator('input')
      .fill(options.personal_email);
  }

  if (options.work_email) {
    await page
      .locator('[data-field="work_email"]')
      .locator('input')
      .fill(options.work_email);
  }

  if (options.job_title) {
    await page
      .locator('[data-field="job_title"]')
      .locator('input')
      .fill(options.job_title);
  }

  if (options.country_id) {
    await page
      .locator('[data-field="tax_servicing_countries"]')
      .getByRole('combobox')
      .click();
    await page.getByRole('option', { name: options.country_id }).click();
  }

  if (options.tax_job_category) {
    await page
      .locator('[data-field="tax_job_category"]')
      .getByRole('combobox')
      .click();
    await page.getByRole('option', { name: options.tax_job_category }).click();
  }

  if (options.provisional_start_date) {
    await page.getByTestId('date-picker-button-provisional_start_date').click();
    if (options.provisional_start_date === 'auto') {
      await page
        .locator('button[role="gridcell"]:not([disabled])')
        .first()
        .click();
    } else {
      await page
        .getByRole('button', {
          name: options.provisional_start_date,
          exact: true,
        })
        .and(page.locator(':not([disabled])'))
        .first()
        .click();
    }
  }

  if (options.has_seniority_date) {
    await page
      .locator(
        `[data-field="has_seniority_date"] button[value="${options.has_seniority_date}"]`,
      )
      .click();
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep3FranceFormOptions {
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

export async function fillOnboardingStep3FranceForm(
  page: Page,
  options: Partial<fillOnboardingStep3FranceFormOptions>,
) {
  if (options.contract_duration_type) {
    await page
      .locator(`[data-field="contract_duration_type"] button[value="on"]`)
      .click();
  }

  if (options.work_schedule) {
    await page
      .locator(
        `[data-field="work_schedule"] button[role="radio"][value="${options.work_schedule}"]`,
      )
      .click();
  }

  if (options.work_hours_per_week) {
    await page
      .locator(
        `[data-field="work_hours_per_week"] button[role="radio"][value="${options.work_hours_per_week}"]`,
      )
      .click();
  }

  if (options.executive_experience_level) {
    await page
      .locator(
        `[data-field="executive_experience_level"] button[role="radio"][value^="${options.executive_experience_level}"]`,
      )
      .click();
  }

  if (options.annual_gross_salary) {
    await page
      .locator('[data-field="annual_gross_salary"] input')
      .fill(options.annual_gross_salary);
  }

  if (options.has_signing_bonus) {
    await page
      .locator(
        `[data-field="has_signing_bonus"] button[role="radio"][value="${options.has_signing_bonus}"]`,
      )
      .click();
  }

  if (options.has_bonus) {
    await page
      .locator(
        `[data-field="has_bonus"] button[role="radio"][value="${options.has_bonus}"]`,
      )
      .click();
  }

  if (options.has_commissions) {
    await page
      .locator(
        `[data-field="has_commissions"] button[role="radio"][value="${options.has_commissions}"]`,
      )
      .click();
  }

  if (options.equity_compensation) {
    await page
      .locator(
        `[data-field="equity_compensation.offer_equity_compensation"] button[role="radio"][value="${options.equity_compensation}"]`,
      )
      .click();
  }

  if (options.role_description) {
    await page
      .locator('[data-field="role_description"] textarea')
      .fill(options.role_description);
  }

  if (options.probation_length) {
    await page
      .locator('[data-field="probation_length"] input')
      .fill(options.probation_length);
  }

  if (options.renewal_probation_length) {
    await page
      .locator(
        `[data-field="renewal_probation_length"] button[role="checkbox"]`,
      )
      .click();
  }

  if (options.home_office_allowance) {
    await page
      .locator('[data-field="home_office_allowance"] input')
      .fill(options.home_office_allowance);
  }

  if (options.hardship_allowance) {
    await page
      .locator('[data-field="hardship_allowance"] input')
      .fill(options.hardship_allowance);
  }

  if (options.work_address_is_home_address) {
    await page
      .locator(
        `[data-field="work_address_is_home_address"] button[role="radio"][value="${options.work_address_is_home_address}"]`,
      )
      .click();
  }

  if (options.non_compete_clause_apply) {
    await page
      .locator(
        `[data-field="non_compete_clause_apply"] button[role="radio"][value="${options.non_compete_clause_apply}"]`,
      )
      .click();
  }

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
  work_address_is_home_address?: string;
  annual_gross_salary?: string;
  annual_bonus_ack?: boolean;
  salary_installments?: boolean;
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
  if (options.contract_duration_type) {
    await page
      .locator(
        `[data-field="contract_duration_type"] button[role="radio"][value="${options.contract_duration_type}"]`,
      )
      .click();
  }

  if (options.work_schedule) {
    await page
      .locator(
        `[data-field="work_schedule"] button[role="radio"][value="${options.work_schedule}"]`,
      )
      .click();
  }

  if (options.probation_length) {
    await page
      .locator('[data-field="probation_length"] input')
      .fill(options.probation_length);
  }

  if (options.probation_length_ack) {
    await page
      .locator(`[data-field="probation_length_ack"] button[role="checkbox"]`)
      .click();
  }

  if (options.available_pto_type) {
    await page
      .locator(
        `[data-field="available_pto_type"] button[role="radio"][value="${options.available_pto_type}"]`,
      )
      .click();
  }

  if (options.available_pto) {
    await page
      .locator('[data-field="available_pto"] input')
      .fill(options.available_pto);
  }

  if (options.role_description) {
    await page
      .locator('[data-field="role_description"] textarea')
      .fill(options.role_description);
  }

  if (options.experience_level) {
    await page
      .locator(
        `[data-field="experience_level"] button[role="radio"][value^="${options.experience_level}"]`,
      )
      .click();
  }

  if (options.work_address_is_home_address) {
    await page
      .locator(
        `[data-field="work_address_is_home_address"] button[role="radio"][value="${options.work_address_is_home_address}"]`,
      )
      .click();
  }

  if (options.annual_gross_salary) {
    await page
      .locator('[data-field="annual_gross_salary"] input')
      .fill(options.annual_gross_salary);
  }

  if (options.annual_bonus_ack) {
    await page
      .locator(`[data-field="annual_bonus_ack"] button[role="checkbox"]`)
      .click();
  }

  if (options.salary_installments) {
    await page
      .locator(`[data-field="is_salary_prorated"] button[role="combobox"]`)
      .click();
    await page.getByRole('option').first().click();
  }

  if (options.allowances !== undefined) {
    await page
      .locator('[data-field="allowances"] textarea')
      .fill(options.allowances);
  }

  if (options.has_signing_bonus) {
    await page
      .locator(
        `[data-field="has_signing_bonus"] button[role="radio"][value="${options.has_signing_bonus}"]`,
      )
      .click();
  }

  if (options.has_bonus) {
    await page
      .locator(
        `[data-field="has_bonus"] button[role="radio"][value="${options.has_bonus}"]`,
      )
      .click();
  }

  if (options.has_commissions) {
    await page
      .locator(
        `[data-field="has_commissions"] button[role="radio"][value="${options.has_commissions}"]`,
      )
      .click();
  }

  if (options.equity_compensation) {
    await page
      .locator(
        `[data-field="equity_compensation.offer_equity_compensation"] button[role="radio"][value="${options.equity_compensation}"]`,
      )
      .click();
  }

  if (options.non_compete_clause_apply) {
    await page
      .locator(
        `[data-field="non_compete_clause_apply"] button[role="radio"][value="${options.non_compete_clause_apply}"]`,
      )
      .click();
  }

  if (options.has_social_security_number) {
    await page
      .locator(
        `[data-field="has_social_security_number"] button[role="radio"][value="${options.has_social_security_number}"]`,
      )
      .click();
  }

  if (options.work_equipment) {
    await page
      .locator('[data-field="work_equipment"] input')
      .fill(options.work_equipment);
  }

  if (options.compensation_expenses_ack) {
    await page
      .locator(
        `[data-field="compensation_expenses_ack"] button[role="checkbox"]`,
      )
      .click();
  }

  if (options.overtime_compensation_method) {
    await page
      .locator(
        `[data-field="overtime_compensation_method"] button[role="radio"][value="${options.overtime_compensation_method}"]`,
      )
      .click();
  }

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
    if (options.life_insurance_type) {
      await page
        .locator('[data-field="f90cb339-172d-4d24-9ee6-da2e2ccc954e.filter"]')
        .getByRole('radio', { name: options.life_insurance_type })
        .click();
    }

    if (options.life_insurance) {
      await page
        .locator('[data-field="f90cb339-172d-4d24-9ee6-da2e2ccc954e.value"]')
        .getByRole('radio', { name: options.life_insurance })
        .click();
    }

    if (options.health_insurance_coverage) {
      await page
        .locator('[data-field="88081a16-882a-42b8-8cd5-6abb30585e4e.filter"]')
        .getByRole('radio', { name: options.health_insurance_coverage })
        .click();
    }

    if (options.health_insurance) {
      await page
        .locator('[data-field="88081a16-882a-42b8-8cd5-6abb30585e4e.value"]')
        .getByRole('radio', { name: options.health_insurance })
        .click();
    }

    if (options.retirement) {
      await page
        .locator('[data-field="57b4108b-74d4-4830-ad11-68a46679f88c.value"]')
        .getByRole('radio', { name: options.retirement })
        .click();
    }

    if (options.mental_health) {
      await page
        .locator('[data-field="4a2d0edb-ebd9-49af-ad79-7390deb7ee71.value"]')
        .getByRole('radio', { name: options.mental_health })
        .click();
    }

    if (options.wellness) {
      await page
        .locator('[data-field="5ffc8e84-1304-4abb-91c2-4d43b1fece5d.value"]')
        .getByRole('radio', { name: options.wellness })
        .click();
    }

    if (options.business_travel) {
      await page
        .locator('[data-field="91dd5796-5ed7-449e-9a75-15c07c288970.value"]')
        .getByRole('radio', { name: options.business_travel })
        .click();
    }
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

interface fillOnboardingStep4FranceFormOptions {
  mental_health?: string;
  business_travel_insurance?: string;
}

export async function fillOnboardingStep4FranceForm(
  page: Page,
  options: Partial<fillOnboardingStep4FranceFormOptions>,
) {
  if (options.mental_health) {
    await page.getByRole('radio', { name: options.mental_health }).click();
  }

  if (options.business_travel_insurance) {
    await page
      .getByRole('radio', { name: options.business_travel_insurance })
      .click();
  }

  await page.click('.submit-button');
  await page.getByText('Loading...').waitFor({ state: 'hidden' });
}

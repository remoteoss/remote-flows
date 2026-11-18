import { test, Page } from '@playwright/test';
import { writeFileSync } from 'fs';
import {
  fillForm,
  getPublicHolidays,
  submitAndWaitForSave,
} from './helpers/general';
import {
  fillOnboardingIntroductionForm,
  fillOnboardingStep1Form,
  fillOnboardingStep2Form,
} from './helpers/onboarding';

const DIR =
  '/private/tmp/claude-501/-Users-gabriel-remote-remote-flows/794ad1c9-d66e-4a39-b826-4448358229ac/scratchpad';
const COUNTRIES = [
  { label: 'Spain', code: 'ESP' },
  { label: 'Germany', code: 'DEU', phone: ['Germany +49', '15123456789'] },
  { label: 'Portugal', code: 'PRT' },
  {
    label: 'Czech Republic',
    code: 'CZE',
    phone: ['Czechia +420', '777123456'],
  },
  { label: 'Germany', code: 'DEU', phone: ['Germany +49', '15123456789'] },
];

async function title(page: Page) {
  return (
    (await page.getByTestId('onboarding-step-title').textContent()) ?? ''
  ).trim();
}

async function goBackToSelectCountry(page: Page) {
  for (let i = 0; i < 4; i++) {
    if ((await title(page)) === 'Select Country') {
      return;
    }
    await page.locator('.back-button').first().click();
    await page.waitForTimeout(500);
  }
}

test('country switching and the engagement agreement details step', async ({
  page,
}) => {
  test.setTimeout(300_000);
  const schemaCalls: { url: string; status: number; keys: string[] }[] = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (/\/countries\/\w+\/engagement_agreement_details/.test(url)) {
      let keys: string[] = [];
      try {
        keys = Object.keys(
          (await response.json())?.data?.properties ?? {},
        ).sort();
      } catch {
        keys = [];
      }
      schemaCalls.push({ url, status: response.status(), keys });
    }
  });

  await page.goto('?demo=onboarding-basic');
  await fillOnboardingIntroductionForm(page, {});
  const observations: { country: string; title: string }[] = [];

  for (const [index, country] of COUNTRIES.entries()) {
    await goBackToSelectCountry(page);
    await fillOnboardingStep1Form(page, { country_id: country.label });
    await page
      .getByText('Basic Information', { exact: true })
      .first()
      .waitFor();
    const holidays = await getPublicHolidays(page, country.code);
    if (index === 0) {
      await fillOnboardingStep2Form(page, {
        fullname: `John Doe${Date.now()}`,
        login_email: 'personal',
        personal_email: `john.doe${Date.now()}@example.com`,
        work_email: `john.doe${Date.now()}@pro.com`,
        job_title: 'Software Engineer',
        country_id: 'Portugal',
        tax_job_category: 'Finance',
        provisional_start_date: 'auto',
        excluded_start_dates: holidays,
        has_seniority_date: 'no',
      });
    } else {
      await fillForm(page, [
        ...(country.phone
          ? [
              {
                type: 'tel' as const,
                value: country.phone[1],
                countryLabel: country.phone[0],
                name: 'mobile_number',
                optional: true,
              },
            ]
          : []),
        {
          type: 'datepicker',
          value: 'auto',
          testId: 'date-picker-button-provisional_start_date',
          excludedDates: holidays,
        },
        {
          type: 'radio',
          value: 'no',
          name: 'has_seniority_date',
          optional: true,
        },
      ]);
      await submitAndWaitForSave(page, 'POST', /^\/v1\/employments$/);
    }
    await page.waitForTimeout(1500);
    observations.push({ country: country.code, title: await title(page) });
    await page.screenshot({
      path: `${DIR}/verify-1964b-${index + 1}-${country.code}.png`,
    });
    writeFileSync(
      `${DIR}/verify-1964b.json`,
      JSON.stringify({ observations, schemaCalls }, null, 2),
    );
  }
});

import { Locator, Page, Route, expect, test } from '@playwright/test';

export async function setupVercelBypass(page: Page) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Only add Vercel bypass headers to requests to the Vercel deployment or localhost
    if (url.includes('vercel.app') || url.includes('localhost')) {
      const headers = {
        ...route.request().headers(),
        'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN || '',
        'x-vercel-set-bypass-cookie': 'true',
      };

      await route.continue({ headers });
    } else {
      // For external requests (like to gateway.remote.com), continue without the headers
      await route.continue();
    }
  });
}

export type inputType =
  | 'textField'
  | 'select'
  | 'comboBox'
  | 'radio'
  | 'checkbox'
  | 'datepicker'
  | 'tel';

export type FillFormOptions = {
  type: inputType;
  value?: string;
  name?: string;
  testId?: string;
  options?: { nativeSelect?: boolean };
  /** Only used for type: 'tel' — the country-code combobox's visible option text, e.g. "Germany +49". */
  countryLabel?: string;
  /**
   * The field may legitimately not be rendered, so skip it instead of failing when it is
   * absent. For fields the backend adds or drops behind a feature flag — the form is built
   * from a server-supplied JSON schema, so a flag flip changes which fields exist without
   * anything changing here.
   *
   * Use it only where absence is a supported state. On an ordinary field this would turn a
   * real regression into a silent pass.
   */
  optional?: boolean;
};

/**
 * How long to wait for a field that may not exist at all. Long enough to outlast a re-render
 * once the rest of the form is on screen, short enough that skipping several absent fields
 * does not eat the test's timeout budget.
 */
const OPTIONAL_FIELD_TIMEOUT_MS = 5000;

async function isFieldRendered(page: Page, name: string) {
  try {
    await page
      .locator(`[data-field="${name}"]`)
      .first()
      .waitFor({ state: 'visible', timeout: OPTIONAL_FIELD_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

export async function fillForm(page: Page, values: FillFormOptions[]) {
  for (const option of values) {
    if (
      option.optional &&
      option.name &&
      !(await isFieldRendered(page, option.name))
    ) {
      // Recorded rather than skipped silently: which layout the run exercised is the first
      // thing you want to know when reading a report for this form.
      test.info().annotations.push({
        type: 'optional-field-absent',
        description: `${option.name} was not rendered; skipped.`,
      });
      continue;
    }

    switch (option.type) {
      case 'textField':
        if (option.name) {
          await fillTextField(page, option.name, option.value);
        } else {
          throw new Error('textField need name to be located');
        }
        break;
      case 'select':
        if (option.name) {
          await fillSelect(page, option.value, option.name, option.options);
        } else {
          throw new Error('select need name to be located');
        }
        break;
      case 'comboBox':
        if (option.name) {
          await fillComboBox(page, option.value, option.name);
        } else {
          throw new Error('comboBox need name to be located');
        }
        break;
      case 'radio':
        if (option.name) {
          await fillRadio(page, option.value, option.name);
        } else {
          throw new Error('radio need name to be located');
        }
        break;
      case 'checkbox':
        if (option.name) {
          await fillCheckbox(page, option.value, option.name);
        } else {
          throw new Error('checkbox need name to be located');
        }
        break;
      case 'datepicker':
        if (option.testId) {
          await fillDatepicker(page, option.value, option.testId);
        } else {
          throw new Error('DatePicker need testId to be located');
        }
        break;
      case 'tel':
        if (option.name && option.countryLabel) {
          await fillTel(page, option.name, option.countryLabel, option.value);
        } else {
          throw new Error('tel needs both name and countryLabel to be located');
        }
        break;
      default:
        throw new Error(`Unsupported input type: ${option.type}`);
    }
  }
}

export async function fillTextField(
  page: Page,
  name: string,
  value: string = '',
) {
  await page.locator(`[data-field="${name}"] :is(input, textarea)`).fill(value);
}

export async function fillSelect(
  page: Page,
  value: string = '',
  name: string,
  options: { nativeSelect?: boolean } = { nativeSelect: false },
) {
  if (options.nativeSelect) {
    const dropdown = page.locator(`[data-field="${name}"] select`);
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.selectOption(value);
  } else {
    const dropdown = page.locator(`[data-field="${name}"]`);
    await dropdown.click();
    const option = page.getByRole('option', { name: value });
    await option.waitFor({ state: 'visible' });
    await option.dispatchEvent('click');
  }
}

export async function fillComboBox(
  page: Page,
  value: string = '',
  dataField: string,
) {
  await page
    .locator(`[data-field="${dataField}"]`)
    .getByRole('combobox')
    .click();
  const categoryOption = page.getByRole('option', {
    name: value,
  });
  await categoryOption.waitFor({ state: 'visible' });
  await categoryOption.click();
}

export async function fillRadio(
  page: Page,
  value: string = '',
  dataField: string,
) {
  const locator = page.locator(
    `[data-field="${dataField}"] button[role="radio"][value="${value}"]`,
  );
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

/** TelFieldDefault renders a country-code combobox (e.g. "Germany +49") plus a plain phone
 * number input, both under one [data-field]. Picking the country code sets the dial code; the
 * number itself is entered separately and combined with it by the form. */
export async function fillTel(
  page: Page,
  dataField: string,
  countryLabel: string,
  value: string = '',
) {
  await page
    .locator(`[data-field="${dataField}"]`)
    .getByRole('combobox')
    .click();
  const option = page.getByRole('option', { name: countryLabel });
  await option.waitFor({ state: 'visible' });
  await option.click();
  await page.locator(`[data-field="${dataField}"] input`).fill(value);
}

export async function fillCheckbox(
  page: Page,
  value: string = '',
  dataField: string,
) {
  const locator = page.locator(
    `[data-field="${dataField}"] button[role="checkbox"]`,
  );
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

export async function fillDatepicker(
  page: Page,
  value: string = '',
  testId: string,
) {
  await page.getByTestId(testId).click();

  // Wait for the calendar popup to be visible
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

  if (value === 'auto') {
    const firstAvailableDate = page
      .locator('button[role="gridcell"]:not([disabled])')
      .first();
    await firstAvailableDate.waitFor({ state: 'visible' });
    await firstAvailableDate.click();
  } else {
    const dateButton = page
      .getByRole('button', {
        name: value,
        exact: true,
      })
      .and(page.locator(':not([disabled])'))
      .first();
    await dateButton.waitFor({ state: 'visible' });
    await dateButton.click();
  }
}

export async function clickAndWaitForSave(
  page: Page,
  trigger: Locator,
  method: string,
  pathname: RegExp,
) {
  const response = page.waitForResponse(
    (res) =>
      res.request().method() === method &&
      pathname.test(new URL(res.url()).pathname),
  );
  await trigger.click();
  const saved = await response;
  expect(
    saved.ok(),
    `${method} ${new URL(saved.url()).pathname} returned ${saved.status()}`,
  ).toBe(true);
}

export async function submitAndWaitForSave(
  page: Page,
  method: string,
  pathname: RegExp,
) {
  await clickAndWaitForSave(
    page,
    page.locator('.submit-button'),
    method,
    pathname,
  );
}

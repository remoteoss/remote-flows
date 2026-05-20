import { Page, Route } from '@playwright/test';

export async function setupVercelBypass(page: Page) {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Only add Vercel bypass headers to requests to the Vercel deployment
    if (url.includes('vercel.app') || url.includes('localhost:3001')) {
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
  | 'datepicker';

export type FillFormOptions = {
  type: inputType;
  value?: string;
  cssId?: string;
  name?: string;
  testId?: string;
  options?: { nativeSelect?: boolean };
};

export async function fillForm(page: Page, values: FillFormOptions[]) {
  for (const option of values) {
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
          throw new Error('comboBox need dataFieldId to be located');
        }
        break;
      case 'radio':
        if (option.name) {
          await fillRadio(page, option.value, option.name);
        } else {
          throw new Error('radio need dataFieldId to be located');
        }
        break;
      case 'checkbox':
        if (option.name) {
          await fillCheckbox(page, option.value, option.name);
        } else {
          throw new Error('checkbox need dataFieldId to be located');
        }
        break;
      case 'datepicker':
        if (option.testId) {
          await fillDatepicker(page, option.value, option.testId);
        } else {
          throw new Error('DatePicker need testId to be located');
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
  if (value === 'auto') {
    await page
      .locator('button[role="gridcell"]:not([disabled])')
      .first()
      .click();
  } else {
    await page
      .getByRole('button', {
        name: value,
        exact: true,
      })
      .and(page.locator(':not([disabled])'))
      .first()
      .click();
  }
}

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
  dataField?: string;
  testId?: string;
};

export async function fillForm(page: Page, values: FillFormOptions[]) {
  for (const option of values) {
    switch (option.type) {
      case 'textField':
        await fillTextField(page, option.value, option.cssId, option.dataField);
        break;
      case 'select':
        await fillSelect(page, option.value, option.cssId, option.dataField);
        break;
      case 'comboBox':
        if (option.dataField) {
          await fillComboBox(page, option.value, option.dataField);
        } else {
          throw new Error('comboBox need dataFieldId to be located');
        }
        break;
      case 'radio':
        if (option.dataField) {
          await fillRadio(page, option.value, option.dataField);
        } else {
          throw new Error('radio need dataFieldId to be located');
        }
        break;
      case 'checkbox':
        if (option.dataField) {
          await fillCheckbox(page, option.value, option.dataField);
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
  value: string = '',
  cssId?: string,
  dataField?: string,
) {
  if (cssId) {
    if (value) {
      await page.fill(cssId, value);
    }
  }

  if (dataField) {
    await page
      .locator(`[data-field="${dataField}"] :is(input, textarea)`)
      .fill(value);
  }
}

export async function fillSelect(
  page: Page,
  value: string = '',
  cssId?: string,
  dataField?: string,
) {
  if (cssId) {
    await page.selectOption(cssId, value);
  }

  if (dataField) {
    const dropdown = page.locator(`[data-field="${dataField}"]`);
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
  await page
    .locator(
      `[data-field="${dataField}"] button[role="radio"][value^="${value}"]`,
    )
    .click();
}

export async function fillCheckbox(
  page: Page,
  value: string = '',
  dataField: string,
) {
  await page
    .locator(`[data-field="${dataField}"] button[role="checkbox"]`)
    .click();
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

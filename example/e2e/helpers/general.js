"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupVercelBypass = setupVercelBypass;
exports.fillForm = fillForm;
exports.fillTextField = fillTextField;
exports.fillSelect = fillSelect;
exports.fillComboBox = fillComboBox;
exports.fillRadio = fillRadio;
exports.fillCheckbox = fillCheckbox;
exports.fillDatepicker = fillDatepicker;
async function setupVercelBypass(page) {
    await page.route('**/*', async (route) => {
        const url = route.request().url();
        // Only add Vercel bypass headers to requests to the Vercel deployment
        if (url.includes('vercel.app') || url.includes('localhost:3001')) {
            const headers = {
                ...route.request().headers(),
                'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN || '',
                'x-vercel-set-bypass-cookie': 'true',
            };
            await route.continue({ headers });
        }
        else {
            // For external requests (like to gateway.remote.com), continue without the headers
            await route.continue();
        }
    });
}
async function fillForm(page, values) {
    for (const option of values) {
        switch (option.type) {
            case 'textField':
                if (option.name) {
                    await fillTextField(page, option.name, option.value);
                }
                else {
                    throw new Error('textField need name to be located');
                }
                break;
            case 'select':
                if (option.name) {
                    await fillSelect(page, option.value, option.name, option.options);
                }
                else {
                    throw new Error('select need name to be located');
                }
                break;
            case 'comboBox':
                if (option.name) {
                    await fillComboBox(page, option.value, option.name);
                }
                else {
                    throw new Error('comboBox need name to be located');
                }
                break;
            case 'radio':
                if (option.name) {
                    await fillRadio(page, option.value, option.name);
                }
                else {
                    throw new Error('radio need name to be located');
                }
                break;
            case 'checkbox':
                if (option.name) {
                    await fillCheckbox(page, option.value, option.name);
                }
                else {
                    throw new Error('checkbox need name to be located');
                }
                break;
            case 'datepicker':
                if (option.testId) {
                    await fillDatepicker(page, option.value, option.testId);
                }
                else {
                    throw new Error('DatePicker need testId to be located');
                }
                break;
            default:
                throw new Error(`Unsupported input type: ${option.type}`);
        }
    }
}
async function fillTextField(page, name, value = '') {
    await page.locator(`[data-field="${name}"] :is(input, textarea)`).fill(value);
}
async function fillSelect(page, value = '', name, options = { nativeSelect: false }) {
    if (options.nativeSelect) {
        const dropdown = page.locator(`[data-field="${name}"] select`);
        await dropdown.waitFor({ state: 'visible' });
        await dropdown.selectOption(value);
    }
    else {
        const dropdown = page.locator(`[data-field="${name}"]`);
        await dropdown.click();
        const option = page.getByRole('option', { name: value });
        await option.waitFor({ state: 'visible' });
        await option.dispatchEvent('click');
    }
}
async function fillComboBox(page, value = '', dataField) {
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
async function fillRadio(page, value = '', dataField) {
    const locator = page.locator(`[data-field="${dataField}"] button[role="radio"][value="${value}"]`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
}
async function fillCheckbox(page, value = '', dataField) {
    const locator = page.locator(`[data-field="${dataField}"] button[role="checkbox"]`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
}
async function fillDatepicker(page, value = '', testId) {
    await page.getByTestId(testId).click();
    if (value === 'auto') {
        await page
            .locator('button[role="gridcell"]:not([disabled])')
            .first()
            .click();
    }
    else {
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

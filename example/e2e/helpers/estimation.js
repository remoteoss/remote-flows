"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillEstimationForm = fillEstimationForm;
async function fillEstimationForm(page, options) {
    if (options.country) {
        await page.selectOption('#country', options.country);
    }
    if (options.currency) {
        await page.selectOption('#currency', options.currency);
    }
    if (options.salary) {
        await page.fill('#salary_conversion', options.salary);
    }
    if (options.management_fee) {
        await page.getByRole('button', { name: 'Show Management fee' }).click();
        await page.fill('#management\\.management_fee', options.management_fee);
    }
    await page.click('.submit-button');
}

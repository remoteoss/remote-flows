"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const general_1 = require("./helpers/general");
const estimation_1 = require("./helpers/estimation");
test_1.test.describe('hiring budget', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await (0, general_1.setupVercelBypass)(page);
        await page.goto('/?demo=with-premium-benefits-cost-calculator');
    });
    (0, test_1.test)('shows the hiring budget option', async ({ page }) => {
        await page.locator('#my_hiring_budget').click();
        await (0, test_1.expect)(page.locator('[for=salary]')).toHaveText('Hiring budget');
        await (0, estimation_1.fillEstimationForm)(page, {
            country: 'Sweden',
            currency: 'USD',
            salary: '100000',
        });
        const headerAmount = page.getByText(/Employee annual gross salary: SEK\s\d{1,3}(,\d{3})*\.\d{2}/);
        await (0, test_1.expect)(headerAmount).toBeVisible();
    });
});

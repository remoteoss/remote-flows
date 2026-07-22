"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const general_1 = require("./helpers/general");
const estimation_1 = require("./helpers/estimation");
test_1.test.describe('annual gross salary', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await (0, general_1.setupVercelBypass)(page);
        await page.goto('/?demo=with-premium-benefits-cost-calculator');
    });
    (0, test_1.test)('shows the annual gross salary both in the header and in the table', async ({ page, }) => {
        await (0, estimation_1.fillEstimationForm)(page, {
            country: 'Sweden',
            currency: 'USD',
            salary: '100',
        });
        const employerAmount = page.getByTestId('annual-gross-salary-employer-amount');
        await (0, test_1.expect)(employerAmount).toHaveText('$100.00');
        // Using getByText for static text + regex for dynamic part
        const headerAmount = page.getByText(/Employee annual gross salary: SEK\s\d+\.\d\d/);
        await (0, test_1.expect)(headerAmount).toBeVisible();
    });
});

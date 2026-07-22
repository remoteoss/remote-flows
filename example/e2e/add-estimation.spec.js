"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const general_1 = require("./helpers/general");
const estimation_1 = require("./helpers/estimation");
test_1.test.describe('add estimation from drawer', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await (0, general_1.setupVercelBypass)(page);
        await page.goto('/?demo=with-premium-benefits-cost-calculator');
    });
    (0, test_1.test)('should not have an employer billing currency', async ({ page }) => {
        await (0, estimation_1.fillEstimationForm)(page, {
            country: 'Sweden',
            currency: 'USD',
            salary: '100',
            management_fee: '399',
        });
        const title = page.getByTestId('estimation-results-header-title');
        await (0, test_1.expect)(title).toHaveText('Estimate #01');
        const button = page.getByRole('button', { name: /add estimate/i });
        await button.click();
        const drawerTitle = page.getByTestId('drawer-add-estimation-form-header-title');
        await (0, test_1.expect)(drawerTitle).toHaveText('Add estimate');
        const drawerDescription = page.getByTestId('drawer-add-estimation-form-header-description');
        await (0, test_1.expect)(drawerDescription).toHaveText('Estimate the cost of another hire through Remote');
        await (0, test_1.expect)(page.getByText('$399.00')).toBeVisible();
        await (0, test_1.expect)(page.getByText('The billing currency will appear as the one you picked earlier')).toBeVisible();
        await (0, test_1.expect)(page.getByText('Your billing currency will be shown as USD, based on your earlier selection')).toBeVisible();
        await (0, test_1.expect)(page.locator('#currency')).toHaveCount(0);
        await (0, estimation_1.fillEstimationForm)(page, {
            country: 'Sweden',
            salary: '200',
        });
        await (0, test_1.expect)(page.getByText('$200.00')).toBeVisible();
    });
});

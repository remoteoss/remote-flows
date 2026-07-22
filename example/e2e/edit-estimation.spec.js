"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const general_1 = require("./helpers/general");
const estimation_1 = require("./helpers/estimation");
test_1.test.describe('edit estimation', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await (0, general_1.setupVercelBypass)(page);
        await page.goto('/?demo=with-premium-benefits-cost-calculator');
    });
    (0, test_1.test)('edits an estimation', async ({ page }) => {
        await (0, estimation_1.fillEstimationForm)(page, {
            country: 'Sweden',
            currency: 'USD',
            salary: '100',
        });
        const title = page.getByTestId('estimation-results-header-title');
        await (0, test_1.expect)(title).toHaveText('Estimate #01');
        // Open actions dropdown and click edit
        const actionsDropdown = page.getByRole('button', { name: /actions/i });
        await actionsDropdown.click();
        const editAction = page.getByRole('button', { name: /edit/i });
        await editAction.click();
        // Check drawer content
        const drawerTitle = page.getByTestId('drawer-edit-estimation-form-header-title');
        await (0, test_1.expect)(drawerTitle).toHaveText('Edit estimate');
        await (0, test_1.expect)(page.getByText('The billing currency will appear as the one you picked earlier')).toBeVisible();
        await (0, test_1.expect)(page.getByText('Your billing currency will be shown as USD, based on your earlier selection')).toBeVisible();
        const drawerDescription = page.getByTestId('drawer-edit-estimation-form-header-description');
        await (0, test_1.expect)(drawerDescription).toHaveText('Estimate #1');
        // Update salary and submit
        await page.fill('#salary_conversion', '200');
        await page.fill('#estimation_title', 'Test estimation');
        await page.click('.submit-button');
        // Verify updated amount
        const employerAmount = page.getByTestId('annual-gross-salary-employer-amount');
        await (0, test_1.expect)(employerAmount).toHaveText('$200.00');
        await page.getByText('Test estimation');
    });
});

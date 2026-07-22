"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const general_1 = require("./helpers/general");
const onboarding_1 = require("./helpers/onboarding");
test_1.test.describe('Onboard basic employee', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await (0, general_1.setupVercelBypass)(page);
        await page.goto('?demo=onboarding-basic');
    });
    (0, test_1.test)('Fill basic employee flow form', async ({ page }) => {
        const headerAmount = page.getByText(/Standard onboarding flow/);
        await (0, test_1.expect)(headerAmount).toBeVisible();
        await (0, onboarding_1.fillOnboardingIntroductionForm)(page, {
            company_id: '460201ed-a8c0-4e75-89dc-6d5eae35f65e',
        });
        let stepTitle = page.getByTestId('onboarding-step-title');
        await (0, test_1.expect)(stepTitle).toHaveText('Select Country');
        await (0, onboarding_1.fillOnboardingStep1Form)(page, {
            country_id: 'Spain',
        });
        stepTitle = page.getByTestId('onboarding-step-title');
        await (0, test_1.expect)(stepTitle).toHaveText('Basic Information');
        await (0, onboarding_1.fillOnboardingStep2Form)(page, {
            fullname: `John Doe${Date.now()}`,
            personal_email: `john.doe${Date.now()}@example.com`,
            work_email: `john.doe${Date.now()}@pro.com`,
            job_title: 'Software Engineer',
            country_id: 'Portugal',
            tax_job_category: 'Finance',
            provisional_start_date: 'auto',
            has_seniority_date: 'no',
        });
        stepTitle = page.getByTestId('onboarding-step-title');
        await (0, test_1.expect)(stepTitle).toHaveText('Contract Details');
        await (0, onboarding_1.fillOnboardingStep3SpainForm)(page, {
            contract_duration_type: 'indefinite',
            work_schedule: 'full_time',
            probation_length: '3',
            probation_length_ack: true,
            available_pto_type: 'fixed',
            available_pto: '25',
            overtime_compensation_method: 'payout',
            role_description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.',
            experience_level: 'Group Level A - Workers who thanks to their professional knowledge and experience, coordinate, plan and manage the resources available to them, ensuring the achievement of the objectives pursued. They carry out these activities with autonomy and supervision. (probation period - 6 months)',
            work_address_is_home_address: 'yes',
            annual_gross_salary: '50000',
            annual_bonus_ack: true,
            salary_installments: '12 months',
            allowances: '',
            has_signing_bonus: 'no',
            has_bonus: 'no',
            has_commissions: 'no',
            equity_compensation: 'no',
            non_compete_clause_apply: 'no',
            has_social_security_number: 'yes',
            work_equipment: '200',
            compensation_expenses_ack: true,
            role_is_onsite: 'yes',
            role_requires_license: 'no',
        });
        stepTitle = page.getByTestId('onboarding-step-title');
        await (0, test_1.expect)(stepTitle).toHaveText('Benefits');
        await (0, onboarding_1.fillOnboardingStep4SpainForm)(page, {
            life_insurance_type: 'Basic',
            life_insurance: 'Life Insurance - $50K',
            health_insurance_coverage: 'Single',
            health_insurance: 'Sanitas Standard Medical (Employee Only)',
            retirement: 'Basic Retirement',
            mental_health: 'Basic Mental Health Program',
            wellness: '$25 Wellness Plan',
            business_travel: 'Basic Business Travel',
        });
        stepTitle = page.getByTestId('onboarding-step-title');
        await (0, test_1.expect)(stepTitle).toHaveText('Review');
        await page.click('.submit-button');
    });
});

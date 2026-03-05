import { Step } from '../useStepState.js';
import { ProductType } from './constants.js';
import { E as Employment } from '../../types-DdtBq-tA.js';
import 'react';
import 'react-hook-form';
import '../../types.gen-BxpagbHP.js';
import 'react/jsx-runtime';
import '../Onboarding/components/OnboardingBack.js';
import '../Onboarding/components/OnboardingInvite.js';
import '../../mutations-BKtilfHK.js';
import '../../remoteFlows-DI0ouAyb.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import '../Onboarding/components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '@remoteoss/remote-json-schema-form-kit';
import '../types.js';
import '../Onboarding/components/SaveDraftButton.js';

type StepKeys = 'select_country' | 'basic_information' | 'contract_details' | 'eligibility_questionnaire' | 'contract_preview' | 'pricing_plan' | 'review';
type StepConfig = {
    includeSelectCountry?: boolean;
    includeEligibilityQuestionnaire?: boolean;
    includeContractPreview?: boolean;
};
declare function buildSteps(config?: StepConfig): {
    steps: Record<string, Step<StepKeys>>;
    stepsArray: {
        name: StepKeys;
        index: number;
        label: string;
        visible: boolean;
    }[];
};
/**
 * Calculates the description for the provisional start date field
 * based on whether the dates match between basic information and contract details steps
 */
declare const calculateProvisionalStartDateDescription: (employmentProvisionalStartDate: string | undefined, fieldProvisionalStartDate: string | undefined) => string | undefined;
/**
 * Checks if the selected pricing plan is CM (standard) or CM+ (plus)
 */
declare const isCMOrCMPlus: (subscription: string | undefined) => boolean;
/**
 * Checks if the country code is a country code that requires nationality status field
 */
declare const isNationalityCountryCode: (countryCode: string) => boolean;
/**
 * Checks if a product should be included based on the excludeProducts list
 * @param productIdentifier - The product identifier to check
 * @param excludeProducts - Array of products to exclude
 * @returns true if the product should be included, false otherwise
 */
declare const shouldIncludeProduct: (productIdentifier: string, excludeProducts?: ProductType[]) => boolean;
/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
declare const reviewStepAllowedEmploymentStatus: Employment['status'][];
declare const disabledInviteButtonEmploymentStatus: Employment['status'][];

export { type StepKeys, buildSteps, calculateProvisionalStartDateDescription, disabledInviteButtonEmploymentStatus, isCMOrCMPlus, isNationalityCountryCode, reviewStepAllowedEmploymentStatus, shouldIncludeProduct };

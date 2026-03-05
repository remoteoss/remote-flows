import { C as ContractorOnboardingFlowProps } from '../../types-BMweN_Cr.js';
import { JSFModify } from '../types.js';
import { FieldValues } from 'react-hook-form';
import '../../types.gen-C6jD_TP6.js';
import './components/OnboardingBack.js';
import 'react/jsx-runtime';
import 'react';
import './components/OnboardingSubmit.js';
import '../../remoteFlows-DL-yjkRb.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import '../../mutations-qZ0G6FAl.js';
import '@tanstack/query-core';
import '../useStepState.js';
import '@remoteoss/remote-json-schema-form-kit';
import './utils.js';
import './constants.js';
import '../../types-CTCype4R.js';
import '../Onboarding/components/OnboardingBack.js';
import '../Onboarding/components/OnboardingInvite.js';
import '../Onboarding/components/OnboardingSubmit.js';
import '../Onboarding/components/SaveDraftButton.js';
import './components/BasicInformationStep.js';
import './components/ContractReviewButton.js';

/**
 * Merges internal jsfModify modifications with user-provided options for contract_details step
 * This abstracts the logic of applying internal field modifications (like dynamic descriptions)
 * while preserving user customizations
 */
declare const buildContractDetailsJsfModify: (userJsfModify: JSFModify | undefined, provisionalStartDateDescription: string | undefined, selectedPricingPlan: string | undefined, fieldValues: FieldValues) => JSFModify;
/**
 * Builds the basic information jsf modify for the contractor onboarding flow
 * @param countryCode - The country code to use for the onboarding.
 * @param countryName - The name of the country to use for the onboarding.
 * @param options - The options to use for the onboarding.
 * @returns The basic information jsf modify for the contractor onboarding flow
 */
declare const buildBasicInformationJsfModify: (countryCode: string, countryName: string | undefined, options: ContractorOnboardingFlowProps["options"] | undefined) => JSFModify | undefined;
declare const buildContractPreviewJsfModify: (options: ContractorOnboardingFlowProps["options"] | undefined, fieldValues: FieldValues) => {
    fields: {
        contract_preview_header: any;
        contract_preview_statement: any;
        signature: any;
    };
};

export { buildBasicInformationJsfModify, buildContractDetailsJsfModify, buildContractPreviewJsfModify };

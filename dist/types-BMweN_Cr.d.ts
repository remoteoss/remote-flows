import { d as EmploymentCreationResponse, S as SuccessResponse, e as EmploymentResponse, f as CreateContractDocumentResponse, E as Employment, g as Signatory, h as CompanyLegalEntity, K as SignContractDocument } from './types.gen-C6jD_TP6.js';
import { OnboardingBack } from './flows/ContractorOnboarding/components/OnboardingBack.js';
import { OnboardingSubmit } from './flows/ContractorOnboarding/components/OnboardingSubmit.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { C as Components, J as JSFFields, M as Meta, a as JSFFieldset } from './remoteFlows-DL-yjkRb.js';
import { N as NormalizedFieldError } from './mutations-qZ0G6FAl.js';
import * as _tanstack_query_core from '@tanstack/query-core';
import * as React$1 from 'react';
import { Step } from './flows/useStepState.js';
import { FieldValues } from 'react-hook-form';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { StepKeys } from './flows/ContractorOnboarding/utils.js';
import { BasicInformationStep } from './flows/ContractorOnboarding/components/BasicInformationStep.js';
import { g as SelectCountryStep } from './types-CTCype4R.js';
import { FlowOptions, JSFModify } from './flows/types.js';
import { OnboardingInvite } from './flows/Onboarding/components/OnboardingInvite.js';
import { ContractReviewButton } from './flows/ContractorOnboarding/components/ContractReviewButton.js';
import { ProductType } from './flows/ContractorOnboarding/constants.js';

type PricingPlanStepProps = {
    /**
     * Components to override the default field components used in the form.
     */
    components?: Components;
    onSubmit?: (payload: PricingPlanFormPayload) => void | Promise<void>;
    onSuccess?: (data: PricingPlanResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function PricingPlanStep({ components, onSubmit, onSuccess, onError, }: PricingPlanStepProps): react_jsx_runtime.JSX.Element;

type useContractorOnboardingProps = Omit<ContractorOnboardingFlowProps, 'render'>;
declare const useContractorOnboarding: ({ countryCode, externalId, employmentId, skipSteps, options, initialValues: onboardingInitialValues, }: useContractorOnboardingProps) => {
    /**
     * Loading state indicating if the flow is loading data
     */
    isLoading: boolean;
    /**
     * Current state of the form fields for the current step.
     */
    fieldValues: FieldValues;
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        currentStep: Step<StepKeys>;
        totalSteps: number;
        values: {
            review: FieldValues;
            contract_details: FieldValues;
            select_country: FieldValues;
            basic_information: FieldValues;
            eligibility_questionnaire: FieldValues;
            contract_preview: FieldValues;
            pricing_plan: FieldValues;
        } | null;
    };
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: React$1.Dispatch<React$1.SetStateAction<FieldValues>>;
    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back: () => void;
    /**
     * Function to handle going to the next step
     * @returns {void}
     */
    next: () => void;
    /**
     * Function to handle going to a specific step
     * @param step The step to go to.
     * @returns {void}
     */
    goTo: (step: StepKeys) => void;
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit: (values: FieldValues) => Promise<EmploymentCreationResponse | SuccessResponse | EmploymentResponse | CreateContractDocumentResponse | {
        data: {
            countryCode: any;
        };
    } | {
        data: {
            subscription: any;
        };
    } | undefined>;
    /**
     * Array of form fields from the onboarding schema
     */
    fields: JSFFields;
    /**
     * Fields metadata for each step
     */
    meta: {
        fields: {
            select_country: Meta;
            basic_information: Meta;
            contract_details: Meta;
            contract_preview: Meta;
            pricing_plan: Meta;
            eligibility_questionnaire: Meta;
        };
        fieldsets: JSFFieldset | null | undefined;
    };
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: FieldValues) => Promise<FieldValues>;
    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
    /**
     * Initial form values
     */
    initialValues: {
        select_country: Record<string, unknown>;
        basic_information: Record<string, unknown>;
        contract_details: Record<string, unknown>;
        contract_preview: Record<string, unknown>;
        pricing_plan: Record<string, unknown>;
        eligibility_questionnaire: Record<string, unknown>;
    };
    /**
     * Employment id
     */
    employmentId: string | undefined;
    /**
     * Function to refetch the employment data
     * @returns {void}
     */
    refetchEmployment: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<(Employment & {
        termination_date?: string | null;
    }) | undefined, unknown>>;
    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting: boolean;
    /**
     * Document preview PDF data
     */
    documentPreviewPdf: {
        contract_document: {
            content: string;
            name?: string | undefined;
            signatories?: Signatory[] | undefined;
            status?: "archived" | "draft" | "awaiting_signatures" | "finished" | "revised" | "awaiting_customer_approval" | "approved_by_customer" | "rejected_by_customer" | undefined;
        };
    } | undefined;
    /**
     * let's the user know if the company can invite employees
     * @returns {boolean}
     */
    canInvite: boolean | undefined;
    /**
     * let's the user know that the employment cannot be edited, happens when employment.status is invited
     * @returns {boolean}
     */
    isEmploymentReadOnly: boolean | undefined;
    /**
     * let's the user know if the employment is invited or not
     * @returns {'invited' | 'not_invited'}
     */
    invitedStatus: "invited" | "not_invited";
    /**
     * Employment data
     * @returns {Employment}
     */
    employment: (Employment & {
        termination_date?: string | null;
    }) | undefined;
    /**
     * Default legal entity
     * @returns {CompanyLegalEntity}
     */
    defaultLegalEntity: CompanyLegalEntity | undefined;
    /**
     * Steps array
     * @returns {Array<{name: string, index: number, label: string}>}
     */
    steps: {
        name: StepKeys;
        index: number;
        label: string;
        visible: boolean;
    }[];
};

type ContractDetailsStepProps = {
    onSubmit?: (payload: ContractorOnboardingContractDetailsFormPayload) => void | Promise<void>;
    onSuccess?: (data: ContractorOnboardingContractDetailsResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function ContractDetailsStep({ onSubmit, onSuccess, onError, }: ContractDetailsStepProps): react_jsx_runtime.JSX.Element;

type ContractPreviewStepProps = {
    onSubmit?: (payload: ContractPreviewFormPayload) => void | Promise<void>;
    onSuccess?: (data: ContractPreviewResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function ContractPreviewStep({ onSubmit, onSuccess, onError, }: ContractPreviewStepProps): react_jsx_runtime.JSX.Element;

type EligibilityQuestionnaireStepProps = {
    onSubmit?: (payload: EligibilityQuestionnaireFormPayload) => void | Promise<void>;
    onSuccess?: (data: EligibilityQuestionnaireResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function EligibilityQuestionnaireStep({ onSubmit, onSuccess, onError, }: EligibilityQuestionnaireStepProps): react_jsx_runtime.JSX.Element;

type ContractorOnboardingRenderProps = {
    /**
     * The contractor onboarding bag returned by the useContractorOnboarding hook.
     * This bag contains all the methods and properties needed to handle the contractor onboarding flow.
     * @see {@link useContractorOnboarding}
     */
    contractorOnboardingBag: ReturnType<typeof useContractorOnboarding>;
    /**
     * The components used in the contractor onboarding flow.
     * @see {@link BasicInformationStep}
     * @see {@link SelectCountryStep}
     * @see {@link OnboardingBack}
     * @see {@link PricingPlanStep}
     * @see {@link ContractDetailsStep}
     * @see {@link ContractPreviewStep}
     * @see {@link OnboardingSubmit}
     * @see {@link OnboardingBack}
     * @see {@link OnboardingInvite}
     * @see {@link EligibilityQuestionnaireStep}
     */
    components: {
        BasicInformationStep: typeof BasicInformationStep;
        SelectCountryStep: typeof SelectCountryStep;
        BackButton: typeof OnboardingBack;
        SubmitButton: typeof OnboardingSubmit;
        PricingPlanStep: typeof PricingPlanStep;
        ContractDetailsStep: typeof ContractDetailsStep;
        ContractPreviewStep: typeof ContractPreviewStep;
        OnboardingInvite: typeof OnboardingInvite;
        ContractReviewButton: typeof ContractReviewButton;
        EligibilityQuestionnaireStep: typeof EligibilityQuestionnaireStep;
    };
};
type ContractorOnboardingFlowProps = {
    /**
     * The country code to use for the onboarding.
     */
    countryCode?: string;
    /**
     * The employment id to use for the onboarding.
     */
    employmentId?: string;
    /**
     * Unique reference code for the employment record in a non-Remote system. This optional field links to external data sources.
     * If not provided, it defaults to null. While uniqueness is recommended, it is not strictly enforced within Remote's system.
     */
    externalId?: string;
    /**
     * The steps to skip for the onboarding. We only support skipping the select_country step for now.
     */
    skipSteps?: ['select_country'];
    /**
     * The render prop function with the params passed by the useContractorOnboarding hook and the components available to use for this flow
     */
    render: ({ contractorOnboardingBag, components, }: ContractorOnboardingRenderProps) => React.ReactNode;
    /**
     * The options for the contractor onboarding flow.
     */
    options?: Omit<FlowOptions, 'jsfModify'> & {
        /**
         * Products to exclude from the available options in pricing_plan step.
         * By default, all products are shown. Use this to hide specific products.
         * @example excludeProducts: ['eor'] // Hide EOR option
         * @example excludeProducts: ['eor', 'cor'] // Hide both EOR and COR
         */
        excludeProducts?: ProductType[];
        jsfModify?: {
            select_country?: JSFModify;
            basic_information?: JSFModify;
            contract_details?: JSFModify;
            contract_preview?: JSFModify;
            eligibility_questionnaire?: JSFModify;
            pricing_plan?: JSFModify;
        };
    };
    /**
     * Initial values to pre-populate the form fields.
     * These are flat field values that will be automatically mapped to the correct step.
     * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
     */
    initialValues?: Record<string, unknown>;
};
type PricingPlanFormPayload = {
    subscription: string;
};
type PricingPlanResponse = {
    subscription: string;
};
type ContractorOnboardingContractDetailsFormPayload = {
    services_and_deliverables: string;
    service_duration: {
        expiration_date?: string;
        provisional_start_date: string;
    };
    termination: {
        contractor_notice_period_amount: number;
        company_notice_period_amount: number;
    };
    payment_terms: {
        payment_terms_type: string;
        invoicing_frequency: string;
        compensation_gross_amount: string;
        compensation_currency_code?: string;
        period_unit: string;
    };
};
type ContractorOnboardingContractDetailsResponse = CreateContractDocumentResponse;
type ContractPreviewFormPayload = SignContractDocument;
type ContractPreviewResponse = SuccessResponse;
type EligibilityQuestionnaireFormPayload = {
    control_the_way_contractors_work: 'no' | 'yes';
    previously_hired_contractors_as_employees: 'no' | 'yes';
    treating_contractors_as_employees: 'no' | 'yes';
};
type EligibilityQuestionnaireResponse = SuccessResponse;

export { type ContractorOnboardingFlowProps as C, type EligibilityQuestionnaireFormPayload as E, type PricingPlanFormPayload as P, type ContractorOnboardingContractDetailsFormPayload as a, type ContractorOnboardingRenderProps as b, type PricingPlanResponse as c, type ContractorOnboardingContractDetailsResponse as d, type ContractPreviewFormPayload as e, type ContractPreviewResponse as f, type EligibilityQuestionnaireResponse as g, PricingPlanStep as h, ContractDetailsStep as i, ContractPreviewStep as j, EligibilityQuestionnaireStep as k, useContractorOnboarding as u };

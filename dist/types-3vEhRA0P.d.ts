import { d as EmploymentCreationResponse, e as EmploymentResponse, S as SuccessResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, x as ConflictResponse, B as BadRequestResponse, F as ForbiddenResponse, N as NotFoundResponse, a as UnauthorizedResponse, E as Employment$1, y as EmploymentCreateParams } from './types.gen-CtACO7H3.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { OnboardingBack } from './flows/Onboarding/components/OnboardingBack.js';
import { OnboardingInvite } from './flows/Onboarding/components/OnboardingInvite.js';
import { N as NormalizedFieldError, S as SuccessResponse$1, E as ErrorResponse } from './mutations-B5hd-NxF.js';
import { OnboardingSubmit } from './flows/Onboarding/components/OnboardingSubmit.js';
import { C as Components, J as JSFFields, M as Meta, a as JSFFieldset } from './remoteFlows-D7HHZxko.js';
import * as _tanstack_query_core from '@tanstack/query-core';
import * as React$1 from 'react';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { Step } from './flows/useStepState.js';
import { FieldValues } from 'react-hook-form';
import { FlowOptions, JSFModify } from './flows/types.js';
import { SaveDraftButton } from './flows/Onboarding/components/SaveDraftButton.js';

type BasicInformationStepProps = {
    onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
    onSuccess?: (data: EmploymentCreationResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function BasicInformationStep({ onSubmit, onSuccess, onError, }: BasicInformationStepProps): react_jsx_runtime.JSX.Element;

type ContractDetailsStepProps = {
    onSubmit?: (payload: ContractDetailsFormPayload) => void | Promise<void>;
    onSuccess?: (response: EmploymentResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function ContractDetailsStep({ onSubmit, onError, onSuccess, }: ContractDetailsStepProps): react_jsx_runtime.JSX.Element;

type BenefitsStepProps = {
    /**
     * Components to override the default field components used in the form.
     */
    components?: Components;
    /**
     * Callback function to be called when the benefits form is submitted.
     * It can be used to perform any additional validation or processing before
     * the onboarding moves to the last step.
     * @param values
     * @returns
     */
    onSubmit?: (values: BenefitsFormPayload) => void | Promise<void>;
    /**
     * Callback function to be called when the submitting benefits form fails.
     * @param error
     * @returns
     */
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
    /**
     * Callback function to be called when benefits form is successfully submitted.
     * This function is called after the submitting benefits form is submitted.
     * @param data
     * @returns
     */
    onSuccess?: (data: SuccessResponse) => void | Promise<void>;
};
declare function BenefitsStep({ components, onSubmit, onError, onSuccess, }: BenefitsStepProps): react_jsx_runtime.JSX.Element;

type StepKeys = 'select_country' | 'basic_information' | 'contract_details' | 'benefits' | 'review';
declare const STEPS: Record<StepKeys, Step<StepKeys>>;
declare const STEPS_WITHOUT_SELECT_COUNTRY: Record<Exclude<StepKeys, 'select_country'>, Step<Exclude<StepKeys, 'select_country'>>>;
/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
declare const reviewStepAllowedEmploymentStatus: Employment['status'][];
declare const disabledInviteButtonEmploymentStatus: Employment['status'][];
declare const DEFAULT_VERSION = 1;
/**
 * Resolves the effective contract details schema version for a country
 *
 * @param options - The flow options containing version configurations
 * @param countryCode - The country code to resolve version for
 * @returns The effective jsonSchemaVersion configuration
 */
declare const getContractDetailsSchemaVersion: (options: OnboardingFlowProps["options"], countryCode: string | null) => number | "latest";

type OnboardingHookProps = Omit<OnboardingFlowProps, 'render'>;
declare const useOnboarding: ({ employmentId, companyId, countryCode, type, options, skipSteps, externalId, initialValues: onboardingInitialValues, }: OnboardingHookProps) => {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId: string | undefined;
    /**
     * Credit risk status of the company, useful to know what to to show in the review step
     * The possible values are:
     * - not_started
     * - ready
     * - in_progress
     * - referred
     * - fail
     * - deposit_required
     * - no_deposit_required
     */
    creditRiskStatus: "not_started" | "ready" | "in_progress" | "referred" | "fail" | "deposit_required" | "no_deposit_required" | undefined;
    /**
     * Onboarding reserves status for the employment
     * Returns 'deposit_required' if a deposit is required based on onboarding reserves policies
     */
    onboardingReservesStatus: "not_started" | "ready" | "in_progress" | "referred" | "fail" | "deposit_required" | "no_deposit_required" | undefined;
    /**
     * Current state of the form fields for the current step.
     */
    fieldValues: FieldValues;
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        currentStep: Step<"benefits" | "review" | "contract_details" | "select_country" | "basic_information">;
        totalSteps: number;
        values: {
            benefits: FieldValues;
            review: FieldValues;
            contract_details: FieldValues;
            select_country: FieldValues;
            basic_information: FieldValues;
        } | null;
    };
    /**
     * Array of form fields from the onboarding schema
     */
    fields: JSFFields;
    /**
     * Loading state indicating if the onboarding schema is being fetched
     */
    isLoading: boolean;
    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting: boolean;
    /**
     * Initial form values
     */
    initialValues: {
        select_country: Record<string, unknown>;
        basic_information: Record<string, unknown>;
        contract_details: Record<string, unknown>;
        benefits: Record<string, unknown>;
    };
    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: React$1.Dispatch<React$1.SetStateAction<FieldValues>>;
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: FieldValues) => Promise<FieldValues>;
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit: (values: FieldValues) => Promise<{
        data: {
            countryCode: any;
        };
    } | SuccessResponse$1<({
        data: EmploymentCreationResponse;
        error: undefined;
    } | {
        data: undefined;
        error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
    }) & {
        request: Request;
        response: Response;
    }> | ErrorResponse<Error> | SuccessResponse$1<({
        data: EmploymentResponse;
        error: undefined;
    } | {
        data: undefined;
        error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
    }) & {
        request: Request;
        response: Response;
    }> | SuccessResponse$1<({
        data: SuccessResponse;
        error: undefined;
    } | {
        data: undefined;
        error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse | ForbiddenResponse;
    }) & {
        request: Request;
        response: Response;
    }> | undefined>;
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
    goTo: (step: keyof typeof STEPS) => void;
    /**
     * Fields metadata for each step
     */
    meta: {
        fields: {
            select_country: Meta;
            basic_information: Meta;
            contract_details: Meta;
            benefits: Meta;
        };
        fieldsets: JSFFieldset | null | undefined;
    };
    /**
     * Function to refetch the employment data
     * @returns {void}
     */
    refetchEmployment: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<(Employment$1 & {
        termination_date?: string | null;
    }) | undefined, unknown>>;
    /**
     * Employment data
     */
    employment: (Employment$1 & {
        termination_date?: string | null;
    }) | undefined;
    /**
     * let's the user know that the employment cannot be edited, happens when employment.status is invited, created_awaiting_reserve or created_reserve_paid
     * @returns {boolean}
     */
    isEmploymentReadOnly: boolean | undefined;
    /**
     * let's the user know if the company can invite employees
     * @returns {boolean}
     */
    canInvite: boolean | undefined;
};

type SelectCountryStepProps = {
    onSubmit?: (payload: SelectCountryFormPayload) => void | Promise<void>;
    onSuccess?: (data: SelectCountrySuccess) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function SelectCountryStep({ onSubmit, onSuccess, onError, }: SelectCountryStepProps): react_jsx_runtime.JSX.Element;

type ReviewStepProps = {
    /**
     * Render prop function for customizing the review step credit risk flow UI
     *
     * @param props - Object containing credit risk information
     * @param props.creditRiskState - Current state of the credit risk flow
     *   - 'referred': Company has been referred for manual review
     *   - 'deposit_required': Deposit payment is required but not yet paid
     *   - 'deposit_required_successful': Deposit payment has been successfully processed
     *   - 'invite': Regular invite flow is available (no deposit required)
     *   - 'invite_successful': Invitation has been successfully sent
     *   - null: No specific credit risk state applies
     *
     * @param props.creditRiskStatus - Credit risk status from the backend
     *   - 'not_started': Credit risk assessment has not been initiated
     *   - 'ready': Ready for credit risk assessment
     *   - 'in_progress': Credit risk assessment is in progress
     *   - 'referred': Company has been referred for manual review
     *   - 'fail': Credit risk assessment failed
     *   - 'deposit_required': Company requires a deposit payment
     *   - 'no_deposit_required': No deposit is required for this company
     *   - undefined: Credit risk status not yet determined
     * @returns React.ReactNode to render for the review step
     */
    render: (props: {
        creditRiskState: CreditRiskState;
        creditRiskStatus: CreditRiskStatus | undefined;
    }) => React.ReactNode;
};
declare function ReviewStep({ render }: ReviewStepProps): React$1.ReactNode;

type OnboardingRenderProps = {
    /**
     * The onboarding bag returned by the useOnboarding hook.
     * This bag contains all the methods and properties needed to handle the onboarding flow.
     * @see {@link useOnboarding}
     */
    onboardingBag: ReturnType<typeof useOnboarding>;
    /**
     * The components used in the onboarding flow.
     * This includes different steps, submit button, back button.
     * @see {@link BasicInformationStep}
     * @see {@link ContractDetailsStep}
     * @see {@link OnboardingSubmit}
     * @see {@link OnboardingBack}
     * @see {@link OnboardingInvite}
     * @see {@link BenefitsStep}
     * @see {@link OnboardingCreateReserve}
     * @see {@link InvitationSection}
     * @see {@link SelectCountryStep}
     * @see {@link ReviewStep}
     * @see {@link SaveDraftButton}
     */
    components: {
        SubmitButton: typeof OnboardingSubmit;
        BackButton: typeof OnboardingBack;
        BasicInformationStep: typeof BasicInformationStep;
        OnboardingInvite: typeof OnboardingInvite;
        ContractDetailsStep: typeof ContractDetailsStep;
        BenefitsStep: typeof BenefitsStep;
        SelectCountryStep: typeof SelectCountryStep;
        ReviewStep: typeof ReviewStep;
        SaveDraftButton: typeof SaveDraftButton;
    };
};
type OnboardingFlowProps = {
    /**
     * The country code to use for the onboarding.
     */
    countryCode?: string;
    /**
     * The employment id to use for the onboarding.
     */
    employmentId?: string;
    /**
     * The company id to use for the onboarding.
     */
    companyId: string;
    /**
     * Unique reference code for the employment record in a non-Remote system. This optional field links to external data sources.
     * If not provided, it defaults to null. While uniqueness is recommended, it is not strictly enforced within Remote's system.
     */
    externalId?: string;
    /**
     * Initial values to pre-populate the form fields.
     * These are flat field values that will be automatically mapped to the correct step.
     * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
     */
    initialValues?: Record<string, unknown>;
    /**
     * The steps to skip for the onboarding. We only support skipping the select_country step for now.
     */
    skipSteps?: ['select_country'];
    /**
     * The type of employment to use for the onboarding. Employee or contractor.
     */
    type?: EmploymentCreateParams['type'];
    /**
     * The options to use for the onboarding.
     */
    options?: Omit<FlowOptions, 'jsfModify'> & {
        jsfModify?: {
            select_country?: JSFModify;
            basic_information?: JSFModify;
            contract_details?: JSFModify;
            benefits?: JSFModify;
        };
        /**
         * The json schema version to use for the onboarding by country.
         * This is used to override the json schema version for the onboarding by country.
         * the old jsonSchemaVersion is not working well at the moment, don't use it for now.
         */
        jsonSchemaVersionByCountry?: {
            [countryCode: string]: {
                employment_basic_information?: number;
                contract_details?: number | 'latest';
            };
        };
    };
    /**
     * The render prop function with the params passed by the useOnboarding hook and the components available to use for this flow
     */
    render: ({ onboardingBag, components, }: OnboardingRenderProps) => React.ReactNode;
};
type SelectCountryFormPayload = {
    countryCode: string;
};
type SelectCountrySuccess = {
    countryCode: string;
};
type BasicInformationFormPayload = {
    name: string;
    email: string;
    work_email: string;
    job_title: string;
    tax_servicing_countries: string[];
    tax_job_category: string;
    department: {
        id: string;
        name?: string;
    };
    provisional_start_date: string;
    has_seniority_date: 'yes' | 'no';
    manager: {
        id: string;
    };
    seniority_date: string;
};
type BenefitsFormPayload = Record<string, {
    value: string;
    filter?: string;
}>;
type ContractDetailsFormPayload = Record<string, unknown>;
type CreditRiskStatus = 'not_started' | 'ready' | 'in_progress' | 'referred' | 'fail' | 'deposit_required' | 'no_deposit_required';
type Employment = Employment$1 & {
    /**
     * Most updated termination date for the offboarding. This date is subject to change through the offboarding process even after it is finalized.
     */
    termination_date?: string | null;
};
type CreditRiskState = 'deposit_required' | 'deposit_required_successful' | 'invite' | 'invite_successful' | 'referred' | null;

export { type BasicInformationFormPayload as B, type ContractDetailsFormPayload as C, DEFAULT_VERSION as D, type Employment as E, type OnboardingFlowProps as O, ReviewStep as R, STEPS as S, type SelectCountryFormPayload as a, type SelectCountrySuccess as b, type BenefitsFormPayload as c, type CreditRiskStatus as d, type CreditRiskState as e, type OnboardingRenderProps as f, SelectCountryStep as g, BasicInformationStep as h, ContractDetailsStep as i, BenefitsStep as j, STEPS_WITHOUT_SELECT_COUNTRY as k, disabledInviteButtonEmploymentStatus as l, getContractDetailsSchemaVersion as m, reviewStepAllowedEmploymentStatus as r, useOnboarding as u };

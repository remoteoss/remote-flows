import { l as CompanyResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, a as UnauthorizedResponse } from './types.gen-CtACO7H3.js';
import { F as FieldError, N as NormalizedFieldError } from './mutations-B5hd-NxF.js';
import * as React$1 from 'react';
import { FieldValues } from 'react-hook-form';
import { J as JSFFields, M as Meta, a as JSFFieldset } from './remoteFlows-D7HHZxko.js';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { FlowOptions, JSFModify } from './flows/types.js';
import { CreateCompanySubmit } from './flows/CreateCompany/components/CreateCompanySubmit.js';
import { STEPS } from './flows/CreateCompany/utils.js';
import { Step } from './flows/useStepState.js';

type useCreateCompanyProps = Omit<CreateCompanyFlowProps, 'render'>;
/**
 * Main hook for the CreateCompany flow
 * Manages the two-step flow: company creation and address details
 * @param countryCode - Optional initial country code
 * @param options - Flow options including jsfModify and jsonSchemaVersion
 * @returns CreateCompany bag with all flow state and methods
 */
declare const useCreateCompany: ({ countryCode, options, initialValues: createCompanyInitialValues, }: useCreateCompanyProps) => {
    /**
     * Loading state indicating if the flow is loading data
     */
    isLoading: boolean;
    /**
     * Loading state indicating if the company creation or update mutation is in progress
     */
    isSubmitting: boolean;
    /**
     * Current state of the form fields for the current step.
     */
    fieldValues: FieldValues;
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        currentStep: Step<"address_details" | "company_basic_information">;
        totalSteps: number;
        values: {
            address_details: FieldValues;
            company_basic_information: FieldValues;
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
    goTo: (step: keyof typeof STEPS) => void;
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit: (values: FieldValues) => Promise<{
        data: {
            countryCode: any;
            companyOwnerEmail: any;
            companyOwnerName: any;
            desiredCurrency: any;
            name: any;
            phoneNumber: any;
            taxNumber: any;
        };
    } | {
        data: null;
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: FieldError[];
    } | {
        data: ({
            data: CompanyResponse;
            error: undefined;
        } | {
            data: undefined;
            error: NotFoundResponse | UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | UnauthorizedResponse;
        }) & {
            request: Request;
            response: Response;
        };
    }>;
    /**
     * Array of form fields from the onboarding schema
     */
    fields: JSFFields;
    /**
     * Fields metadata for each step
     */
    meta: {
        fields: {
            company_basic_information: Meta;
            address_details: Meta;
        };
        fieldsets: JSFFieldset | null | undefined;
    };
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: FieldValues) => Promise<Record<string, any>>;
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
        company_basic_information: Record<string, unknown>;
        address_details: Record<string, unknown>;
    };
};

type CompanyBasicInformationStepProps = {
    /**
     * The function is called when the form is submitted. It receives the form values as an argument.
     */
    onSubmit?: (payload: CompanyBasicInfoFormPayload) => void | Promise<void>;
    /**
     * The function is called when the form submission is successful.
     */
    onSuccess?: (data: CompanyBasicInfoSuccess) => void | Promise<void>;
    /**
     * The function is called when an error occurs during form submission.
     */
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
/**
 * CompanyBasicInformationStep component for the first step of company creation
 * Handles company basic information form submission
 */
declare function CompanyBasicInformationStep({ onSubmit, onSuccess, onError, }: CompanyBasicInformationStepProps): react_jsx_runtime.JSX.Element;

type AddressDetailsStepProps = {
    /**
     * The function is called when the form is submitted. It receives the form values as an argument.
     */
    onSubmit?: (payload: CompanyAddressDetailsFormPayload) => void | Promise<void>;
    /**
     * The function is called when the form submission is successful.
     */
    onSuccess?: (data: CompanyAddressDetailsSuccess) => void | Promise<void>;
    /**
     * The function is called when an error occurs during form submission.
     */
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
/**
 * AddressDetailsStep component for the second step of company creation
 * Handles address details form submission and company update
 */
declare function AddressDetailsStep({ onSubmit, onSuccess, onError, }: AddressDetailsStepProps): react_jsx_runtime.JSX.Element;

type CountryFormFields = {
    countryCode: string;
    companyOwnerEmail: string;
    companyOwnerName: string;
    desiredCurrency: string;
    name: string;
    phoneNumber: string;
    taxNumber: string;
};
type CompanyBasicInfoFormPayload = CountryFormFields;
type CompanyBasicInfoSuccess = CountryFormFields;
type CompanyAddressDetailsFormPayload = Record<string, unknown>;
type CompanyAddressDetailsSuccess = Record<string, unknown>;
type CreateCompanyRenderProps = {
    /**
     * The create company bag returned by the useCreateCompany hook.
     * This bag contains all the methods and properties needed to handle the create company flow.
     * @see {@link useCreateCompany}
     */
    createCompanyBag: ReturnType<typeof useCreateCompany>;
    /**
     * The components used in the create company flow.
     * @see {@link CompanyBasicInformationStep}
     * @see {@link AddressDetailsStep}
     */
    components: {
        CompanyBasicInformationStep: typeof CompanyBasicInformationStep;
        AddressDetailsStep: typeof AddressDetailsStep;
        SubmitButton: typeof CreateCompanySubmit;
    };
};
type CreateCompanyFlowProps = {
    /**
     * The country code to use for the onboarding.
     */
    countryCode?: string;
    /**
     * The render prop function with the params passed by the useCreateCompany hook and the components available to use for this flow
     */
    render: ({ createCompanyBag, components, }: CreateCompanyRenderProps) => React.ReactNode;
    /**
     * The options for the create company flow.
     */
    options?: Omit<FlowOptions, 'jsfModify'> & {
        jsfModify?: {
            company_basic_information?: JSFModify;
            address_details?: JSFModify;
        };
    };
    /**
     * Initial values to pre-populate the form fields.
     * These are flat field values that will be automatically mapped to the correct step.
     * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
     */
    initialValues?: Record<string, unknown>;
};
type BasicInformationFormPayload = {
    company_owner_email: string;
    company_owner_name: string;
    country_code: string;
    desired_currency: string;
    name: string;
    phone_number: string;
    tax_number: string;
    tax_servicing_countries: string[];
};

export { AddressDetailsStep as A, type BasicInformationFormPayload as B, type CreateCompanyFlowProps as C, type CreateCompanyRenderProps as a, type CompanyBasicInfoSuccess as b, type CompanyAddressDetailsSuccess as c, CompanyBasicInformationStep as d, type CompanyBasicInfoFormPayload as e, type CompanyAddressDetailsFormPayload as f, useCreateCompany as u };

import { O as OffboardingResponse, ac as PayrollCalendarEor, E as Employment, H as TerminationDetailsParams, N as NotFoundResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, a as UnauthorizedResponse, R as RequestError } from './types.gen-C6jD_TP6.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { E as ErrorResponse, S as SuccessResponse } from './mutations-qZ0G6FAl.js';
import * as React$1 from 'react';
import * as _remoteoss_json_schema_form from '@remoteoss/json-schema-form';
import * as _remoteoss_json_schema_form_v0_deprecated from '@remoteoss/json-schema-form-v0-deprecated';
import { Step } from './flows/useStepState.js';
import { TerminationBack } from './flows/Termination/TerminationBack.js';
import { TerminationSubmit } from './flows/Termination/TerminationSubmit.js';
import { JSFModify } from './flows/types.js';

type AdditionalDetailsFormProps = {
    onSubmit?: (payload: TerminationFormValues) => void | Promise<void>;
    onError?: (error: Record<string, unknown>) => void;
    onSuccess?: (data: OffboardingResponse) => void | Promise<void>;
};
declare function AdditionalDetailsForm({ onSubmit, onSuccess, onError, }: AdditionalDetailsFormProps): react_jsx_runtime.JSX.Element;

type EmployeeComunicationProps = {
    onSubmit?: (payload: EmployeeCommunicationFormValues) => void | Promise<void>;
};
declare function EmployeeCommunicationForm({ onSubmit, }: EmployeeComunicationProps): react_jsx_runtime.JSX.Element;

type StepTerminationKeys = 'employee_communication' | 'termination_details' | 'paid_time_off' | 'additional_information';
declare const STEPS: Record<StepTerminationKeys, Step<StepTerminationKeys>>;
declare const calculateMinTerminationDate: (payrollCalendars: PayrollCalendarEor | undefined) => Date;
declare const calculateProposedTerminationDateStatement: ({ minTerminationDate, isEmployeeInProbationPeriod, selectedDate, }: {
    minTerminationDate: Date;
    isEmployeeInProbationPeriod: boolean;
    selectedDate?: Date;
}) => {
    statement: {
        title: React$1.ReactNode;
        description: React$1.ReactNode;
        severity: "error" | "warning" | "info" | "success" | undefined;
    };
} | null;
declare function buildInitialValues(stepsInitialValues: Partial<TerminationFormValues>, hasFutureStartDate: boolean): TerminationFormValues;

type TerminationHookProps = Omit<TerminationFlowProps, 'render'>;
declare const useTermination: ({ employmentId, options, initialValues: terminationInitialValues, }: TerminationHookProps) => {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId: string;
    /**
     * Employment data
     */
    employment: (Employment & {
        termination_date?: string | null;
    }) | undefined;
    /**
     * Current form field values, we use formValues to let the user know about all the current form values
     */
    fieldValues: {
        confidential: string;
        customer_informed_employee: string;
        customer_informed_employee_date: string | null;
        customer_informed_employee_description: string | null;
        personal_email: string;
        proposed_termination_date: string;
        reason_description: string;
        risk_assessment_reasons: TerminationDetailsParams["risk_assessment_reasons"];
        termination_reason: TerminationDetailsParams["termination_reason"] | undefined;
        termination_reason_files: TerminationDetailsParams["termination_reason_files"];
        additional_comments: string | null;
        will_challenge_termination: string;
        will_challenge_termination_description: string | null;
        agrees_to_pto_amount: string;
        agrees_to_pto_amount_notes: string | null;
        timesheet_file: TerminationDetailsParams["timesheet_file"];
        acknowledge_termination_procedure: boolean;
    };
    /**
     * Indicates if the form is dirty
     */
    isDirty: boolean;
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        currentStep: Step<StepTerminationKeys>;
        totalSteps: number;
        values: {
            paid_time_off: TerminationFormValues;
            employee_communication: TerminationFormValues;
            termination_details: TerminationFormValues;
            additional_information: TerminationFormValues;
        } | null;
    };
    /**
     * Array of form fields from the contract amendment schema
     */
    fields: _remoteoss_json_schema_form_v0_deprecated.Fields;
    /**
     * Loading state indicating if the termination schema is being fetched
     */
    isLoading: boolean;
    /**
     * Loading state indicating if a contract amendment mutation is in progress
     */
    isSubmitting: boolean;
    /**
     * Initial form values
     */
    initialValues: TerminationFormValues;
    /**
     * Function to validate form values against the contract amendment schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: TerminationFormValues) => Promise<_remoteoss_json_schema_form.ValidationResult | {
        yupError: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
        formErrors: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
    } | null>;
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: React$1.Dispatch<React$1.SetStateAction<TerminationFormValues>>;
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: TerminationFormValues, includeAllFields?: boolean) => Promise<EmployeeCommunicationFormValues | TerminationDetailsFormValues | PaidTimeOffFormValues | TerminationFormValues>;
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit: (values: TerminationFormValues) => Promise<(ErrorResponse<Error> | SuccessResponse<({
        data: OffboardingResponse;
        error: undefined;
    } | {
        data: undefined;
        error: NotFoundResponse | UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | UnauthorizedResponse | RequestError;
    }) & {
        request: Request;
        response: Response;
    }>) | undefined>;
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
};

type PaidTimeOffFormProps = {
    onSubmit?: (payload: PaidTimeOffFormValues) => void | Promise<void>;
};
declare function PaidTimeOffForm({ onSubmit }: PaidTimeOffFormProps): react_jsx_runtime.JSX.Element;

type TerminationDetailsFormProps = {
    onSubmit?: (payload: TerminationDetailsFormValues) => void | Promise<void>;
};
declare function TerminationDetailsForm({ onSubmit, }: TerminationDetailsFormProps): react_jsx_runtime.JSX.Element;

type EmployeeCommunicationFormValues = {
    confidential: string;
    customer_informed_employee: string;
    customer_informed_employee_date: string | null;
    customer_informed_employee_description: string | null;
    personal_email: string;
};
type TerminationDetailsFormValues = {
    proposed_termination_date: string;
    reason_description: string;
    risk_assessment_reasons: TerminationDetailsParams['risk_assessment_reasons'];
    termination_reason: TerminationDetailsParams['termination_reason'] | undefined;
    termination_reason_files: TerminationDetailsParams['termination_reason_files'];
    additional_comments: string | null;
    will_challenge_termination: string;
    will_challenge_termination_description: string | null;
};
type PaidTimeOffFormValues = {
    agrees_to_pto_amount: string;
    agrees_to_pto_amount_notes: string | null;
    timesheet_file: TerminationDetailsParams['timesheet_file'];
};
type AdditionalDetailsFormValues = {
    acknowledge_termination_procedure: boolean;
};
type TerminationFormValues = EmployeeCommunicationFormValues & TerminationDetailsFormValues & PaidTimeOffFormValues & AdditionalDetailsFormValues;
type TerminationRenderProps = {
    /**
     * The termination bag returned by the useTermination hook.
     * This bag contains all the methods and properties needed to handle the termination flow.
     * @see {@link useTermination}
     */
    terminationBag: ReturnType<typeof useTermination>;
    /**
     * The components used in the termination flow.
     * This includes different steps, submit button, back button and timeoff.
     * @see {@link TerminationSubmit}
     * @see {@link TerminationBack}
     * @see {@link EmployeeCommunicationForm}
     * @see {@link TerminationDetailsForm}
     * @see {@link PaidTimeOffForm}
     * @see {@link AdditionalDetailsForm}
     */
    components: {
        SubmitButton: typeof TerminationSubmit;
        Back: typeof TerminationBack;
        EmployeeComunicationStep: typeof EmployeeCommunicationForm;
        TerminationDetailsStep: typeof TerminationDetailsForm;
        PaidTimeOffStep: typeof PaidTimeOffForm;
        AdditionalDetailsStep: typeof AdditionalDetailsForm;
    };
};
type TerminationFlowProps = {
    employmentId: string;
    render: ({ terminationBag, components, }: TerminationRenderProps) => React.ReactNode;
    options?: {
        jsfModify?: JSFModify;
    };
    initialValues?: Record<string, unknown>;
};

export { type AdditionalDetailsFormValues as A, type EmployeeCommunicationFormValues as E, type PaidTimeOffFormValues as P, type StepTerminationKeys as S, type TerminationFormValues as T, type TerminationFlowProps as a, type TerminationRenderProps as b, type TerminationDetailsFormValues as c, AdditionalDetailsForm as d, EmployeeCommunicationForm as e, STEPS as f, calculateMinTerminationDate as g, calculateProposedTerminationDateStatement as h, buildInitialValues as i, PaidTimeOffForm as j, TerminationDetailsForm as k, useTermination as u };

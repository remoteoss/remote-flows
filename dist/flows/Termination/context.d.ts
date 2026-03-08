import * as react from 'react';
import { E as Employment, H as TerminationDetailsParams, O as OffboardingResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, a as UnauthorizedResponse, R as RequestError } from '../../types.gen-CIMOKNAn.js';
import { E as ErrorResponse, S as SuccessResponse } from '../../mutations-KX37KHHt.js';
import '../../remoteFlows-BlCKwGdn.js';
import * as _remoteoss_json_schema_form from '@remoteoss/json-schema-form';
import * as _remoteoss_json_schema_form_v0_deprecated from '@remoteoss/json-schema-form-v0-deprecated';
import { Step } from '../useStepState.js';
import { u as useTermination, S as StepTerminationKeys, T as TerminationFormValues, E as EmployeeCommunicationFormValues, c as TerminationDetailsFormValues, P as PaidTimeOffFormValues } from '../../types-Xsjy4JnN.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import 'react/jsx-runtime';
import './TerminationBack.js';
import './TerminationSubmit.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

declare const TerminationContext: react.Context<{
    formId: string | undefined;
    terminationBag: ReturnType<typeof useTermination> | null;
}>;
declare const useTerminationContext: () => {
    readonly formId: string;
    readonly terminationBag: {
        employmentId: string;
        employment: (Employment & {
            termination_date?: string | null;
        }) | undefined;
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
        isDirty: boolean;
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
        fields: _remoteoss_json_schema_form_v0_deprecated.Fields;
        isLoading: boolean;
        isSubmitting: boolean;
        initialValues: TerminationFormValues;
        handleValidation: (values: TerminationFormValues) => Promise<_remoteoss_json_schema_form.ValidationResult | {
            yupError: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
            formErrors: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
        } | null>;
        checkFieldUpdates: react.Dispatch<react.SetStateAction<TerminationFormValues>>;
        parseFormValues: (values: TerminationFormValues, includeAllFields?: boolean) => Promise<EmployeeCommunicationFormValues | TerminationDetailsFormValues | PaidTimeOffFormValues | TerminationFormValues>;
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
        back: () => void;
        next: () => void;
    };
};

export { TerminationContext, useTerminationContext };

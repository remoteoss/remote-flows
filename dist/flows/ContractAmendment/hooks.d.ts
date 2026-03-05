import { C as ContractAmendmentAutomatableResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, a as UnauthorizedResponse, b as ContractAmendmentResponse } from '../../types.gen-BxpagbHP.js';
import { E as ErrorResponse, S as SuccessResponse } from '../../mutations-BKtilfHK.js';
import * as react from 'react';
import * as _remoteoss_json_schema_form from '@remoteoss/json-schema-form';
import * as _remoteoss_json_schema_form_v0_deprecated from '@remoteoss/json-schema-form-v0-deprecated';
import { Step } from '../useStepState.js';
import { FieldValues } from 'react-hook-form';
import { ContractAmendmentParams } from './types.js';
import '../../remoteFlows-DI0ouAyb.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

declare const useContractAmendment: ({ employmentId, countryCode, options, }: ContractAmendmentParams) => {
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        currentStep: Step<"form" | "confirmation_form">;
        totalSteps: number;
        values: {
            form: FieldValues;
            confirmation_form: FieldValues;
        } | null;
    };
    /**
     * Array of form fields from the contract amendment schema
     */
    fields: _remoteoss_json_schema_form_v0_deprecated.Fields;
    /**
     * Loading state indicating if either employment or contract amendment data is being fetched
     */
    isLoading: boolean;
    /**
     * Error state indicating if there was an error fetching either employment or contract amendment data
     */
    isError: boolean;
    /**
     * Error object containing details about any errors that occurred during data fetching
     */
    error: {} | null;
    /**
     * Loading state indicating if a contract amendment mutation is in progress
     */
    isSubmitting: boolean;
    /**
     * Initial form values built from employment data and contract amendment fields
     */
    initialValues: {};
    /**
     * Current form field values
     */
    values: FieldValues;
    /**
     * Function to validate form values against the contract amendment schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => Promise<_remoteoss_json_schema_form.ValidationResult | {
        yupError: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
        formErrors: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
    } | null>;
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: react.Dispatch<react.SetStateAction<FieldValues>>;
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit: (values: FieldValues) => Promise<ErrorResponse<Error> | SuccessResponse<({
        data: ContractAmendmentAutomatableResponse;
        error: undefined;
    } | {
        data: undefined;
        error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
    }) & {
        request: Request;
        response: Response;
    }> | SuccessResponse<({
        data: ContractAmendmentResponse;
        error: undefined;
    } | {
        data: undefined;
        error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
    }) & {
        request: Request;
        response: Response;
    }>>;
    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back: () => void;
};

export { useContractAmendment };

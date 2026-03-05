import { C as ContractAmendmentAutomatableResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, a as UnauthorizedResponse, b as ContractAmendmentResponse } from '../../types.gen-DZuOPZbG.js';
import * as React from 'react';
import { E as ErrorResponse, S as SuccessResponse } from '../../mutations-Bz0Iad09.js';
import '../../remoteFlows-DagBfxnm.js';
import * as react_hook_form from 'react-hook-form';
import { useContractAmendment } from './hooks.js';
import * as _remoteoss_json_schema_form from '@remoteoss/json-schema-form';
import * as _remoteoss_json_schema_form_v0_deprecated from '@remoteoss/json-schema-form-v0-deprecated';
import { Step } from '../useStepState.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import './types.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

declare const ContractAmendmentContext: React.Context<{
    formId: string | undefined;
    contractAmendmentBag: ReturnType<typeof useContractAmendment> | null;
}>;
declare const useContractAmendmentContext: () => {
    readonly formId: string | undefined;
    readonly contractAmendment: {
        stepState: {
            currentStep: Step<"form" | "confirmation_form">;
            totalSteps: number;
            values: {
                form: react_hook_form.FieldValues;
                confirmation_form: react_hook_form.FieldValues;
            } | null;
        };
        fields: _remoteoss_json_schema_form_v0_deprecated.Fields;
        isLoading: boolean;
        isError: boolean;
        error: {} | null;
        isSubmitting: boolean;
        initialValues: {};
        values: react_hook_form.FieldValues;
        handleValidation: (values: react_hook_form.FieldValues) => Promise<_remoteoss_json_schema_form.ValidationResult | {
            yupError: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
            formErrors: _remoteoss_json_schema_form_v0_deprecated.$TSFixMe;
        } | null>;
        checkFieldUpdates: React.Dispatch<React.SetStateAction<react_hook_form.FieldValues>>;
        onSubmit: (values: react_hook_form.FieldValues) => Promise<ErrorResponse<Error> | SuccessResponse<({
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
        back: () => void;
    };
};

export { ContractAmendmentContext, useContractAmendmentContext };

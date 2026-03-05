import * as _tanstack_query_core from '@tanstack/query-core';
import { u as useOnboarding, S as STEPS } from '../../types-Dz9jtnMs.js';
import { S as SuccessResponse, E as ErrorResponse } from '../../mutations-Bz0Iad09.js';
import { l as EmploymentCreationResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, r as ConflictResponse, B as BadRequestResponse, F as ForbiddenResponse, m as EmploymentResponse, S as SuccessResponse$1, N as NotFoundResponse, a as UnauthorizedResponse, E as Employment } from '../../types.gen-DZuOPZbG.js';
import * as React$1 from 'react';
import { J as JSFFields, M as Meta, a as JSFFieldset } from '../../remoteFlows-DagBfxnm.js';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import * as react_hook_form from 'react-hook-form';
import { Step } from '../useStepState.js';
import 'react/jsx-runtime';
import './components/OnboardingBack.js';
import './components/OnboardingInvite.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import './components/OnboardingSubmit.js';
import '../types.js';
import './components/SaveDraftButton.js';

declare const OnboardingContext: React$1.Context<{
    formId: string | undefined;
    onboardingBag: ReturnType<typeof useOnboarding> | null;
    creditScore: {
        showReserveInvoice: boolean;
        showInviteSuccessful: boolean;
    };
    setCreditScore: React.Dispatch<React.SetStateAction<{
        showReserveInvoice: boolean;
        showInviteSuccessful: boolean;
    }>>;
}>;
declare const useOnboardingContext: () => {
    readonly formId: string;
    readonly onboardingBag: {
        employmentId: string | undefined;
        creditRiskStatus: "not_started" | "ready" | "in_progress" | "referred" | "fail" | "deposit_required" | "no_deposit_required" | undefined;
        onboardingReservesStatus: "not_started" | "ready" | "in_progress" | "referred" | "fail" | "deposit_required" | "no_deposit_required" | undefined;
        fieldValues: react_hook_form.FieldValues;
        stepState: {
            currentStep: Step<"benefits" | "review" | "contract_details" | "select_country" | "basic_information">;
            totalSteps: number;
            values: {
                benefits: react_hook_form.FieldValues;
                review: react_hook_form.FieldValues;
                contract_details: react_hook_form.FieldValues;
                select_country: react_hook_form.FieldValues;
                basic_information: react_hook_form.FieldValues;
            } | null;
        };
        fields: JSFFields;
        isLoading: boolean;
        isSubmitting: boolean;
        initialValues: {
            select_country: Record<string, unknown>;
            basic_information: Record<string, unknown>;
            contract_details: Record<string, unknown>;
            benefits: Record<string, unknown>;
        };
        handleValidation: (values: react_hook_form.FieldValues) => Promise<_remoteoss_remote_json_schema_form_kit.ValidationResult | null>;
        checkFieldUpdates: React$1.Dispatch<React$1.SetStateAction<react_hook_form.FieldValues>>;
        parseFormValues: (values: react_hook_form.FieldValues) => Promise<react_hook_form.FieldValues>;
        onSubmit: (values: react_hook_form.FieldValues) => Promise<{
            data: {
                countryCode: any;
            };
        } | SuccessResponse<({
            data: EmploymentCreationResponse;
            error: undefined;
        } | {
            data: undefined;
            error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
        }) & {
            request: Request;
            response: Response;
        }> | ErrorResponse<Error> | SuccessResponse<({
            data: EmploymentResponse;
            error: undefined;
        } | {
            data: undefined;
            error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
        }) & {
            request: Request;
            response: Response;
        }> | SuccessResponse<({
            data: SuccessResponse$1;
            error: undefined;
        } | {
            data: undefined;
            error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse | ForbiddenResponse;
        }) & {
            request: Request;
            response: Response;
        }> | undefined>;
        back: () => void;
        next: () => void;
        goTo: (step: keyof typeof STEPS) => void;
        meta: {
            fields: {
                select_country: Meta;
                basic_information: Meta;
                contract_details: Meta;
                benefits: Meta;
            };
            fieldsets: JSFFieldset | null | undefined;
        };
        refetchEmployment: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<(Employment & {
            termination_date?: string | null;
        }) | undefined, unknown>>;
        employment: (Employment & {
            termination_date?: string | null;
        }) | undefined;
        isEmploymentReadOnly: boolean | undefined;
        canInvite: boolean | undefined;
    };
    readonly creditScore: {
        showReserveInvoice: boolean;
        showInviteSuccessful: boolean;
    };
    readonly setCreditScore: React$1.Dispatch<React$1.SetStateAction<{
        showReserveInvoice: boolean;
        showInviteSuccessful: boolean;
    }>>;
};

export { OnboardingContext, useOnboardingContext };

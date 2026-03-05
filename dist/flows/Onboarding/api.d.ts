import { a as JSFFieldset } from '../../remoteFlows-DI0ouAyb.js';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import { E as Employment, p as Company, S as SuccessResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, q as ConflictResponse, B as BadRequestResponse, N as NotFoundResponse, a as UnauthorizedResponse, k as EmploymentCreationResponse, F as ForbiddenResponse, r as EmploymentCreateParams, l as EmploymentResponse, s as EmploymentFullParams, t as UnifiedEmploymentUpsertBenefitOffersRequest, u as ConvertCurrencyResponse, v as ConvertCurrencyParams, w as CreateContractEligibilityParams } from '../../types.gen-BxpagbHP.js';
import { FieldValues } from 'react-hook-form';
import { O as OnboardingFlowProps } from '../../types-DdtBq-tA.js';
import { JSONSchemaFormType, FlowOptions, JSONSchemaFormResultWithFieldsets } from '../types.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react/jsx-runtime';
import './components/OnboardingBack.js';
import './components/OnboardingInvite.js';
import '../../mutations-BKtilfHK.js';
import './components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '../useStepState.js';
import './components/SaveDraftButton.js';

declare const useEmployment: (employmentId: string | undefined) => UseQueryResult<(Employment & {
    termination_date?: string | null;
}) | undefined, Error>;
declare const useCompany: (companyId: string) => UseQueryResult<Company | undefined, Error>;
declare const useBenefitOffers: (employmentId: string | undefined) => UseQueryResult<Record<string, {
    value: string;
}>, Error>;
/**
 * Use this hook to invite an employee to the onboarding flow
 * @returns
 */
declare const useEmploymentInvite: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employment_id: string;
}, unknown>;
declare const useCreateReserveInvoice: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employment_slug: string;
}, unknown>;
/**
 * Use this hook to get the JSON schema form for the onboarding flow
 * @param param0
 * @returns
 */
declare const useJSONSchemaForm: ({ countryCode, form, fieldValues, options, query, jsonSchemaVersion, }: {
    countryCode: string;
    form: JSONSchemaFormType;
    fieldValues: FieldValues;
    options?: FlowOptions & {
        queryOptions?: {
            enabled?: boolean;
        };
    };
    query?: Record<string, unknown>;
    jsonSchemaVersion?: number | "latest";
}) => UseQueryResult<JSONSchemaFormResultWithFieldsets>;
declare const useBenefitOffersSchema: (employmentId: string, fieldValues: FieldValues, options: OnboardingFlowProps["options"]) => UseQueryResult<_remoteoss_remote_json_schema_form_kit.FormResult & {
    meta: {
        "x-jsf-fieldsets": JSFFieldset;
    };
}, Error>;
/**
 * Use this hook to create an employment
 * @returns
 */
declare const useCreateEmployment: () => _tanstack_react_query.UseMutationResult<({
    data: EmploymentCreationResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, EmploymentCreateParams, unknown>;
declare const useUpdateEmployment: (countryCode: string, options?: OnboardingFlowProps["options"]) => _tanstack_react_query.UseMutationResult<({
    data: EmploymentResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | ConflictResponse | BadRequestResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, EmploymentFullParams & {
    employmentId: string;
}, unknown>;
declare const useUpdateBenefitsOffers: (options?: OnboardingFlowProps["options"]) => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, UnifiedEmploymentUpsertBenefitOffersRequest & {
    employmentId: string;
}, unknown>;
declare const useCountriesSchemaField: (options?: Omit<FlowOptions, "jsonSchemaVersion"> & {
    queryOptions?: {
        enabled?: boolean;
    };
}) => {
    isLoading: boolean;
    selectCountryForm: _remoteoss_remote_json_schema_form_kit.FormResult & {
        meta: {
            "x-jsf-fieldsets": JSFFieldset;
        };
    };
};
declare const useConvertCurrency: ({ type, }: {
    type?: "spread" | "no_spread";
}) => _tanstack_react_query.UseMutationResult<({
    data: ConvertCurrencyResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
}) & {
    request: Request;
    response: Response;
}, Error, ConvertCurrencyParams, unknown>;
declare const useUpsertContractEligibility: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
} & CreateContractEligibilityParams, unknown>;
/**
 * Hook to fetch onboarding reserves status for an employment
 * @param companyId - Company ID
 * @param employmentId - Employment ID
 * @param enabled - Whether the query should be enabled
 * @returns Query result with onboarding reserves status
 */
declare const useEmploymentOnboardingReservesStatus: (companyId: string | undefined, employmentId: string | undefined, enabled?: boolean) => UseQueryResult<"not_started" | "ready" | "in_progress" | "referred" | "fail" | "deposit_required" | "no_deposit_required", Error>;

export { useBenefitOffers, useBenefitOffersSchema, useCompany, useConvertCurrency, useCountriesSchemaField, useCreateEmployment, useCreateReserveInvoice, useEmployment, useEmploymentInvite, useEmploymentOnboardingReservesStatus, useJSONSchemaForm, useUpdateBenefitsOffers, useUpdateEmployment, useUpsertContractEligibility };

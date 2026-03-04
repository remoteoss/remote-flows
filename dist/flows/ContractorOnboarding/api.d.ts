import * as _tanstack_query_core from '@tanstack/query-core';
import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import { I as UploadFileResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, a as UnauthorizedResponse, J as FileParams, S as SuccessResponse, B as BadRequestResponse, F as ForbiddenResponse, K as SignContractDocument, g as Signatory, L as ContractorSubscriptionsSummary, Q as ManageContractorPlusSubscriptionOperationsParams, f as CreateContractDocumentResponse, W as CreateContractDocument, X as Country, Y as File, Z as DateTimeIso8601, _ as ContractDocumentItem, $ as EligibilityQuestionnaireResponse, a0 as ConflictErrorResponse, a1 as SubmitEligibilityQuestionnaireRequest } from '../../types.gen-CtACO7H3.js';
import { a as JSFFieldset, $ as $TSFixMe } from '../../remoteFlows-D7HHZxko.js';
import { FormResult } from '@remoteoss/remote-json-schema-form-kit';
import { JSFModify, FlowOptions, JSONSchemaFormResultWithFieldsets } from '../types.js';
import { FieldValues } from 'react-hook-form';
import { ProductType } from './constants.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';

/**
 * Hook to upload a file associated with a specified employment.
 * @returns A mutation result for uploading employee files.
 */
declare const useUploadFile: () => _tanstack_react_query.UseMutationResult<({
    data: UploadFileResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
}) & {
    request: Request;
    response: Response;
}, Error, FileParams, unknown>;

/**
 * Get the contract document signature schema
 * @param fieldValues - The field values
 * @param options - The options
 * @returns The contract document signature schema
 */
declare const useGetContractDocumentSignatureSchema: ({ fieldValues, options, }: {
    fieldValues: FieldValues;
    options?: {
        queryOptions?: {
            enabled?: boolean;
        };
        jsfModify?: JSFModify;
    };
}) => UseQueryResult<FormResult & {
    meta: {
        "x-jsf-fieldsets": JSFFieldset;
    };
}, Error>;
/**
 * Signs the contract document
 * @param employmentId - The employment ID
 * @param contractDocumentId - The contract document ID
 * @param payload - The payload
 * @returns The signed contract document
 */
declare const useSignContractDocument: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: BadRequestResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
    contractDocumentId: string;
    payload: SignContractDocument;
}, unknown>;
/**
 * Get the contract document for a given employment and contract document ID
 * @param employmentId - The employment ID
 * @param contractDocumentId - The contract document ID
 * @returns The contract document
 */
declare const useGetShowContractDocument: ({ employmentId, contractDocumentId, options, }: {
    employmentId: string;
    contractDocumentId: string;
    options?: {
        queryOptions?: {
            enabled?: boolean;
        };
        jsfModify?: JSFModify;
    };
}) => UseQueryResult<{
    contract_document: {
        content: string;
        name?: string | undefined;
        signatories?: Signatory[] | undefined;
        status?: "archived" | "draft" | "awaiting_signatures" | "finished" | "revised" | "awaiting_customer_approval" | "approved_by_customer" | "rejected_by_customer" | undefined;
    };
}, Error>;
/**
 * Get the contractor subscriptions for the given employment id
 * @param employmentId - The employment ID
 * @returns The contractor subscriptions available
 */
declare const useGetContractorSubscriptions: ({ employmentId, options, }: {
    employmentId: string;
    options?: {
        queryOptions?: {
            enabled?: boolean;
        };
    };
}) => UseQueryResult<ContractorSubscriptionsSummary[] | undefined, Error>;
/**
 * Upgrade or downgrade contractor subscription
 */
declare const usePostManageContractorSubscriptions: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: BadRequestResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
    payload: ManageContractorPlusSubscriptionOperationsParams;
}, unknown>;
/**
 * Saves the contractor details data
 * @param employmentId - The employment ID
 * @param payload - The payload
 * @returns The contractor contract document
 */
declare const useCreateContractorContractDocument: () => _tanstack_react_query.UseMutationResult<({
    data: CreateContractDocumentResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
    payload: CreateContractDocument;
}, unknown>;
declare const CONTRACT_PRODUCT_TITLES: {
    "urn:remotecom:resource:product:contractor:standard:monthly": string;
    "urn:remotecom:resource:product:contractor:plus:monthly": string;
    "urn:remotecom:resource:product:contractor:aor:monthly": string;
};
type SelectedCountry = (Pick<Country, 'eor_onboarding' | 'contractor_products_available'> & {
    label: string;
}) | undefined;
declare const useContractorSubscriptionSchemaField: (employmentId: string, selectedCountry: SelectedCountry, options?: FlowOptions & {
    queryOptions?: {
        enabled?: boolean;
    };
    excludeProducts?: ProductType[];
}) => {
    isLoading: boolean;
    form: FormResult & {
        meta: {
            "x-jsf-fieldsets": JSFFieldset;
        };
    };
    contractorSubscriptions: ContractorSubscriptionsSummary[] | undefined;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<ContractorSubscriptionsSummary[] | undefined, Error>>;
    isEligibilityQuestionnaireBlocked: boolean | undefined;
};
declare const useUpdateUKandSaudiFields: (createContractorContractDocumentMutation: ReturnType<typeof useCreateContractorContractDocument>, uploadFileMutation: ReturnType<typeof useUploadFile>, parsedValues: FieldValues) => {
    mutateAsync: ({ employmentId }: {
        employmentId: string;
    }) => Promise<void | UploadFileResponse | CreateContractDocumentResponse>;
};
declare const useGetIR35File: (employmentId: string, options?: {
    enabled?: boolean;
}) => {
    isLoading: boolean;
    data: {
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    };
    error: Error;
    isError: true;
    isPending: false;
    isLoadingError: false;
    isRefetchError: true;
    isSuccess: false;
    isPlaceholderData: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
} | {
    isLoading: boolean;
    data: {
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    };
    error: null;
    isError: false;
    isPending: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    isPlaceholderData: false;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
} | {
    isLoading: boolean;
    data: undefined;
    error: Error;
    isError: true;
    isPending: false;
    isLoadingError: true;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
} | {
    isLoading: boolean;
    data: undefined;
    error: null;
    isError: false;
    isPending: true;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "pending";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
} | {
    isLoading: boolean;
    data: undefined;
    error: null;
    isError: false;
    isPending: true;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "pending";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
} | {
    isLoading: boolean;
    data: {
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    };
    isError: false;
    error: null;
    isPending: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    isPlaceholderData: true;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<{
        content: Blob | File;
        id: string;
        inserted_at: DateTimeIso8601;
        name: string;
        sub_type?: string | null;
        type: string;
    }>;
};
/**
 * Get the contract documents for a given employment
 * @param employmentId - The employment ID
 * @param options - The options
 * @returns The contract documents
 */
declare const useGetContractDocuments: (employmentId: string, options?: {
    enabled?: boolean;
}) => UseQueryResult<ContractDocumentItem[] | undefined, Error>;
declare const useGetEligibilityQuestionnaire: ({ options, fieldValues, }: {
    options?: FlowOptions & {
        queryOptions?: {
            enabled?: boolean;
        };
    };
    fieldValues: FieldValues;
}) => UseQueryResult<FormResult, Error>;
declare const usePostCreateEligibilityQuestionnaire: () => _tanstack_react_query.UseMutationResult<({
    data: EligibilityQuestionnaireResponse;
    error: undefined;
} | {
    data: undefined;
    error: ConflictErrorResponse | UnprocessableEntityResponse | UnauthorizedResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
    payload: SubmitEligibilityQuestionnaireRequest["responses"];
}, unknown>;
declare const usePostManageContractorCorSubscription: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | BadRequestResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
}, unknown>;
declare const useDeleteContractorCorSubscription: () => _tanstack_react_query.UseMutationResult<({
    data: unknown;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | UnauthorizedResponse | ForbiddenResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
}, unknown>;
declare const useCountriesSchemaField: (options?: Omit<FlowOptions, "jsonSchemaVersion"> & {
    queryOptions?: {
        enabled?: boolean;
    };
}) => {
    isLoading: boolean;
    selectCountryForm: FormResult & {
        meta: {
            "x-jsf-fieldsets": JSFFieldset;
        };
    };
    countries: {
        label: string;
        value: string;
        eor_onboarding: boolean | undefined;
        contractor_products_available: ("standard" | "cor" | "plus")[] | undefined;
    }[] | undefined;
};
/**
 * Get contractor onboarding details schema with currency options overridden
 * from the getIndexContractorCurrency endpoint
 */
declare const useContractorOnboardingDetailsSchemaWithCurrencies: ({ countryCode, employmentId, fieldValues, options, }: {
    countryCode: string;
    fieldValues: FieldValues;
    employmentId: string;
    options?: FlowOptions & {
        queryOptions?: {
            enabled?: boolean;
        };
    };
}) => {
    data: $TSFixMe;
    isLoading: boolean;
    error: Error;
    isError: true;
    isPending: false;
    isLoadingError: false;
    isRefetchError: true;
    isSuccess: false;
    isPlaceholderData: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
} | {
    data: $TSFixMe;
    isLoading: boolean;
    error: null;
    isError: false;
    isPending: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    isPlaceholderData: false;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
} | {
    data: $TSFixMe;
    isLoading: boolean;
    error: Error;
    isError: true;
    isPending: false;
    isLoadingError: true;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "error";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
} | {
    data: $TSFixMe;
    isLoading: boolean;
    error: null;
    isError: false;
    isPending: true;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "pending";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
} | {
    data: $TSFixMe;
    isLoading: boolean;
    error: null;
    isError: false;
    isPending: true;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: false;
    isPlaceholderData: false;
    status: "pending";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
} | {
    data: $TSFixMe;
    isLoading: boolean;
    isError: false;
    error: null;
    isPending: false;
    isLoadingError: false;
    isRefetchError: false;
    isSuccess: true;
    isPlaceholderData: true;
    status: "success";
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    failureCount: number;
    failureReason: Error | null;
    errorUpdateCount: number;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isInitialLoading: boolean;
    isPaused: boolean;
    isRefetching: boolean;
    isStale: boolean;
    isEnabled: boolean;
    refetch: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<JSONSchemaFormResultWithFieldsets, Error>>;
    fetchStatus: _tanstack_query_core.FetchStatus;
    promise: Promise<JSONSchemaFormResultWithFieldsets>;
};

export { CONTRACT_PRODUCT_TITLES, useContractorOnboardingDetailsSchemaWithCurrencies, useContractorSubscriptionSchemaField, useCountriesSchemaField, useCreateContractorContractDocument, useDeleteContractorCorSubscription, useGetContractDocumentSignatureSchema, useGetContractDocuments, useGetContractorSubscriptions, useGetEligibilityQuestionnaire, useGetIR35File, useGetShowContractDocument, usePostCreateEligibilityQuestionnaire, usePostManageContractorCorSubscription, usePostManageContractorSubscriptions, useSignContractDocument, useUpdateUKandSaudiFields };

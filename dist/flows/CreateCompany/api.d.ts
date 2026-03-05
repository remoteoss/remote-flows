import { a as JSFFieldset } from '../../remoteFlows-DagBfxnm.js';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import * as _tanstack_react_query from '@tanstack/react-query';
import { y as CompanyCreationResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, F as ForbiddenResponse, z as CompanyCreationConflictErrorResponse, A as CreateCompanyParams, D as CompanyResponse, N as NotFoundResponse, a as UnauthorizedResponse, G as UpdateCompanyParams } from '../../types.gen-DZuOPZbG.js';
import { FieldValues } from 'react-hook-form';
import { FlowOptions } from '../types.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';

/**
 * Hook to create a company
 * @returns Mutation hook for creating a company
 */
declare const useCreateCompanyRequest: () => _tanstack_react_query.UseMutationResult<({
    data: CompanyCreationResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | ForbiddenResponse | CompanyCreationConflictErrorResponse;
}) & {
    request: Request;
    response: Response;
}, Error, CreateCompanyParams, unknown>;
/**
 * Hook to update a company
 * @returns Mutation hook for updating a company
 */
declare const useUpdateCompanyRequest: () => _tanstack_react_query.UseMutationResult<({
    data: CompanyResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | UnauthorizedResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    companyId: string;
    payload: UpdateCompanyParams;
    jsonSchemaVersion?: number | "latest";
}, unknown>;
/**
 * Hook to create the select country form with populated country and currency options
 * @param options - Flow options including jsfModify and queryOptions
 * @returns Form with populated country and currency fields, and loading state
 */
declare const useCountriesSchemaField: (options?: Omit<FlowOptions, "jsonSchemaVersion"> & {
    queryOptions?: {
        enabled?: boolean;
    };
}) => {
    isLoading: boolean;
    companyBasicInformationForm: _remoteoss_remote_json_schema_form_kit.FormResult & {
        meta: {
            "x-jsf-fieldsets": JSFFieldset;
        };
    };
};
/**
 * Hook to fetch address details schema for a given country
 * @param countryCode - The country code to fetch schema for
 * @param fieldValues - Current field values for the form
 * @param options - Flow options including jsfModify and queryOptions
 * @returns Query result with address details form schema
 */
declare const useAddressDetailsSchema: ({ countryCode, fieldValues, options, }: {
    countryCode: string | null;
    fieldValues: FieldValues;
    options?: FlowOptions & {
        queryOptions?: {
            enabled?: boolean;
        };
    };
}) => _tanstack_react_query.UseQueryResult<_remoteoss_remote_json_schema_form_kit.FormResult & {
    meta: {
        "x-jsf-fieldsets": JSFFieldset;
    };
}, Error>;

export { useAddressDetailsSchema, useCountriesSchemaField, useCreateCompanyRequest, useUpdateCompanyRequest };

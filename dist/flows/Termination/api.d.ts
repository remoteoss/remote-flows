import { a as JSFFieldset } from '../../remoteFlows-DagBfxnm.js';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import { O as OffboardingResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, a as UnauthorizedResponse, R as RequestError, a6 as CreateOffboardingParams } from '../../types.gen-DZuOPZbG.js';
import * as _tanstack_react_query from '@tanstack/react-query';
import { E as Employment } from '../../types-Dz9jtnMs.js';
import { T as TerminationFormValues } from '../../types-iNlsBgvW.js';
import { JSFModify } from '../types.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import 'react/jsx-runtime';
import '../Onboarding/components/OnboardingBack.js';
import '../Onboarding/components/OnboardingInvite.js';
import '../../mutations-Bz0Iad09.js';
import '../Onboarding/components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '../useStepState.js';
import '../Onboarding/components/SaveDraftButton.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import './TerminationBack.js';
import './TerminationSubmit.js';

type DaysAndHours = {
    hours: number;
    days: number;
};

type BookedTimeoffBeforeDateResponse = {
    bookedDaysBeforeTermination: DaysAndHours;
    bookedDaysAfterTermination: DaysAndHours;
};
/**
 * Hook to retrieve booked time off data before and after a specific date for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch booked time off data for.
 * @param {string} [params.date] - The date to fetch booked time off data for.
 * @returns {BookedTimeoffBeforeDateResponse} - The booked time off data before and after the specific date.
 *
 * This hook accounts for partial days and multiple timeoff_days per request.
 */
declare const useBookedTimeoffBeforeAndAfterTerminationQuery: ({ employmentId, date, options, }: {
    employmentId: string;
    date: string;
    options?: {
        enabled: boolean;
    };
}) => _tanstack_react_query.UseQueryResult<BookedTimeoffBeforeDateResponse, Error>;
type SummaryTimeOffDataResponse = {
    entitledDays: string;
    bookedDays: string;
    usedDays: string;
    currentEntitlementDays: string;
    approvedDaysBeforeTermination: string;
    approvedDaysAfterTermination: string;
    remainingDays: string;
    isUnlimitedPto: boolean;
};
/**
 * Hook to retrieve summary time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch summary time off data for.
 * @param {string} [params.proposedTerminationDate] - The proposed termination date to fetch summary time off data for.
 * @returns {SummaryTimeOffDataResponse} - The summary time off data.
 *
 * This hook doesn't take into account unlimited time off or half days yet.
 *
 */
declare const useSummaryTimeOffDataQuery: ({ employmentId, proposedTerminationDate, employment, }: {
    employmentId: string;
    proposedTerminationDate: string;
    employment?: Employment;
}) => {
    data: {
        isUnlimitedPto: boolean;
        entitledDays: string;
        bookedDays: string;
        usedDays: string;
        currentEntitlementDays: string;
        approvedDaysBeforeTermination: string;
        approvedDaysAfterTermination: string;
        remainingDays: string;
    };
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
};
declare const useCreateTermination: () => _tanstack_react_query.UseMutationResult<({
    data: OffboardingResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | UnauthorizedResponse | RequestError;
}) & {
    request: Request;
    response: Response;
}, Error, CreateOffboardingParams, unknown>;
declare const useTerminationSchema: ({ formValues, jsfModify, step, }: {
    formValues?: TerminationFormValues;
    jsfModify?: JSFModify;
    step?: string;
}) => _tanstack_react_query.UseQueryResult<_remoteoss_remote_json_schema_form_kit.FormResult & {
    meta: {
        "x-jsf-fieldsets": JSFFieldset;
    };
}, Error>;

export { type BookedTimeoffBeforeDateResponse, type SummaryTimeOffDataResponse, useBookedTimeoffBeforeAndAfterTerminationQuery, useCreateTermination, useSummaryTimeOffDataQuery, useTerminationSchema };

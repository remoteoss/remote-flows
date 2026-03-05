import { a as JSFFieldset } from '../../remoteFlows-DL-yjkRb.js';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import * as _tanstack_react_query from '@tanstack/react-query';
import { j as CostCalculatorEstimatePdfResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, k as CostCalculatorEstimateParams, l as CostCalculatorEstimateCsvResponse, M as MinimalRegion, i as CostCalculatorEstimateResponse } from '../../types.gen-C6jD_TP6.js';
import { CostCalculatorEstimationOptions } from './types.js';
import { JSFModify } from '../types.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import './constants.js';

/**
 * Hook to fetch the countries for the cost calculator.
 * @returns
 */
declare const useCostCalculatorCountries: ({ includePremiumBenefits, }: {
    includePremiumBenefits: CostCalculatorEstimationOptions["includePremiumBenefits"];
}) => _tanstack_react_query.UseQueryResult<{
    value: string;
    label: string;
    childRegions: MinimalRegion[];
    hasAdditionalFields: boolean | undefined;
    regionSlug: string;
    currency: string;
}[] | undefined, Error>;
/**
 * Hook to fetch the company currencies.
 * @returns
 */
declare const useCompanyCurrencies: () => _tanstack_react_query.UseQueryResult<{
    value: string;
    label: string;
}[] | undefined, Error>;
/**
 * Hook to create an estimation.
 * @returns
 */
declare const useCostCalculatorEstimation: () => _tanstack_react_query.UseMutationResult<({
    data: CostCalculatorEstimateResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse;
}) & {
    request: Request;
    response: Response;
}, Error, CostCalculatorEstimateParams, unknown>;
/**
 * Custom hook to create a PDF estimation.
 *
 * @returns
 */
declare const useCostCalculatorEstimationPdf: () => _tanstack_react_query.UseMutationResult<({
    data: CostCalculatorEstimatePdfResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse;
}) & {
    request: Request;
    response: Response;
}, Error, CostCalculatorEstimateParams, unknown>;
/**
 * Custom hook to create a CSV estimation.
 *
 * @returns
 */
declare const useCostCalculatorEstimationCsv: () => _tanstack_react_query.UseMutationResult<({
    data: CostCalculatorEstimateCsvResponse;
    error: undefined;
} | {
    data: undefined;
    error: NotFoundResponse | UnprocessableEntityResponse;
}) & {
    request: Request;
    response: Response;
}, Error, CostCalculatorEstimateParams, unknown>;
/**
 * Hook to fetch the region fields.
 * @param region
 * @returns
 */
declare const useRegionFields: (region: string | undefined, { includePremiumBenefits, options, }: {
    includePremiumBenefits: CostCalculatorEstimationOptions["includePremiumBenefits"];
    options?: {
        jsfModify?: JSFModify;
    };
}) => _tanstack_react_query.UseQueryResult<_remoteoss_remote_json_schema_form_kit.FormResult & {
    meta: {
        "x-jsf-fieldsets": JSFFieldset;
    };
}, Error>;

export { useCompanyCurrencies, useCostCalculatorCountries, useCostCalculatorEstimation, useCostCalculatorEstimationCsv, useCostCalculatorEstimationPdf, useRegionFields };

import { i as CostCalculatorEstimateResponse, N as NotFoundResponse, U as UnprocessableEntityResponse } from '../../types.gen-C6jD_TP6.js';
import { E as ErrorResponse, S as SuccessResponse } from '../../mutations-qZ0G6FAl.js';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import { CostCalculatorEstimationOptions, UseCostCalculatorOptions, CostCalculatorEstimationFormValues, CostCalculatorEstimationSubmitValues } from './types.js';
import { M as Meta } from '../../remoteFlows-DL-yjkRb.js';
import './constants.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';
import 'react';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';

type CostCalculatorVersion = 'standard' | 'marketing';
declare const defaultEstimationOptions: CostCalculatorEstimationOptions;
type UseCostCalculatorParams = {
    /**
     * The default region slug to preselect a country and a region.
     */
    defaultRegion?: string;
    /**
     * The default currency slug to preselect a currency.
     */
    defaultCurrency?: string;
    /**
     * The default salary to preselect a salary.
     */
    defaultSalary?: string;
    /**
     * The estimation options.
     */
    estimationOptions: CostCalculatorEstimationOptions;
    options?: UseCostCalculatorOptions;
    version?: CostCalculatorVersion;
};
/**
 * Hook to use the cost calculator.
 */
declare const useCostCalculator: ({ defaultRegion, defaultCurrency, defaultSalary, estimationOptions, options, version, }?: UseCostCalculatorParams) => {
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
        current: number;
        total: number;
        isLastStep: boolean;
    };
    /**
     * Array of form fields from the cost calculator schema + dynamic region fields like benefits, age, etc.
     */
    fields: Record<string, unknown>[];
    /**
     * Validation schema for the cost calculator form
     */
    validationSchema: yup.AnyObjectSchema;
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: CostCalculatorEstimationFormValues) => Promise<CostCalculatorEstimationSubmitValues>;
    /**
     * Function to handle validation of the cost calculator form
     * @param values - Form values to validate
     * @returns Validation result
     */
    handleValidation: (values: CostCalculatorEstimationFormValues) => Promise<{
        formErrors: any;
        yupError: ValidationError;
    }>;
    /**
     * Whether the cost calculator form is currently being submitted
     */
    isSubmitting: boolean;
    /**
     * Whether the cost calculator form is currently loading
     */
    isLoading: boolean;
    /**
     * Function to submit the cost calculator form
     */
    onSubmit: (values: CostCalculatorEstimationSubmitValues) => Promise<ErrorResponse<Error> | SuccessResponse<({
        data: CostCalculatorEstimateResponse;
        error: undefined;
    } | {
        data: undefined;
        error: NotFoundResponse | UnprocessableEntityResponse;
    }) & {
        request: Request;
        response: Response;
    }>>;
    /**
     * Function to reset the cost calculator form
     */
    resetForm: () => void;
    /**
     * Currencies data useful to get the currency if you have a currencySlug
     */
    currencies: {
        value: string;
        label: string;
    }[] | undefined;
    /**
     * Fields metadata
     */
    meta: {
        fields: Meta;
    };
};

export { type CostCalculatorVersion, defaultEstimationOptions, useCostCalculator };

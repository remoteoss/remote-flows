import { i as EmploymentTermType, j as CostCalculatorEmployment, k as PostCreateEstimationError, V as ValidationError } from '../../types.gen-DZuOPZbG.js';
import { BASE_RATES } from './constants.js';
import { JSFModify } from '../types.js';
import '../../remoteFlows-DagBfxnm.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';

type CostCalculatorEstimationSubmitValues = {
    currency: string;
    currency_code: string;
    country: string;
    salary_converted: 'salary' | 'salary_conversion';
    hiring_budget: string;
    salary: number;
} & Partial<{
    region: string;
    age: number;
    contract_duration_type: EmploymentTermType;
    benefits: Record<string, string>;
    management: {
        management_fee: string;
    };
    estimation_title: string;
}>;
type CostCalculatorEstimationFormValues = {
    currency: string;
    currency_code: string;
    country: string;
    salary: string;
    salary_converted: 'salary' | 'salary_conversion';
    salary_conversion: string;
} & Partial<{
    region: string;
    age: number;
    hiring_budget: string;
    contract_duration_type: EmploymentTermType;
    benefits: Record<string, string>;
    management: {
        management_fee: string;
    };
    estimation_title: string;
}>;
type CostCalculatorEstimationOptions = Partial<{
    /**
     * Title of the estimation. Default is 'Estimation'.
     */
    title: string;
    /**
     * Include benefits in the estimation. Default is false.
     */
    includeBenefits: boolean;
    /**
     * Include cost breakdowns in the estimation. Default is false.
     */
    includeCostBreakdowns: boolean;
    /**
     * Include premium benefits in the estimation. Default is false.
     */
    includePremiumBenefits: boolean;
    /**
     * Enable currency conversion. Default is false.
     */
    enableCurrencyConversion: boolean;
    /**
     * Include management fee in the estimation. Default is false.
     */
    includeManagementFee: boolean;
    /**
     * Include estimation title field in the estimation. Default is false.
     */
    includeEstimationTitle: boolean;
    /**
     * Management fees by currency. Default is null.
     */
    managementFees: Partial<Record<CurrencyKey, number>>;
    /**
     * Show management fee field in the estimation. Default is false.
     */
    showManagementFee: boolean;
}>;
type EstimationError = PostCreateEstimationError | ValidationError;
type UseCostCalculatorOptions = {
    jsfModify?: JSFModify;
    onCurrencyChange?: (currency: string) => void;
    onValidation?: (values: CostCalculatorEstimationFormValues) => void;
};
type CurrencyKey = keyof typeof BASE_RATES;
type CostCalculatorEstimation = CostCalculatorEmployment & {
    title?: string;
};
type CostCalculatorEstimationResponse = {
    data: {
        employments?: Array<CostCalculatorEstimation>;
    };
};

export type { CostCalculatorEstimation, CostCalculatorEstimationFormValues, CostCalculatorEstimationOptions, CostCalculatorEstimationResponse, CostCalculatorEstimationSubmitValues, CurrencyKey, EstimationError, UseCostCalculatorOptions };

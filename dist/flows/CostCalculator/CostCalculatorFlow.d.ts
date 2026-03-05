import * as react_jsx_runtime from 'react/jsx-runtime';
import React__default from 'react';
import { useCostCalculator, CostCalculatorVersion } from './hooks.js';
import { CostCalculatorEstimationOptions, UseCostCalculatorOptions } from './types.js';
import '../../types.gen-DZuOPZbG.js';
import '../../mutations-Bz0Iad09.js';
import '../../remoteFlows-DagBfxnm.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import './constants.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

type CostCalculatorFlowProps = {
    /**
     * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
     */
    estimationOptions?: CostCalculatorEstimationOptions;
    /**
     * Default values for the form fields.
     */
    defaultValues?: Partial<{
        /**
         * Default value for the country field.
         */
        countryRegionSlug: string;
        /**
         * Default value for the currency field.
         */
        currencySlug: string;
        /**
         * Default value for the salary field.
         */
        salary: string;
        /**
         * Default value for the benefits field.
         */
        benefits: Record<string, string>;
        /**
         * Default value for the hiring budget field
         */
        hiringBudget: string;
        /**
         * Default value for the age field.
         */
        age: number;
        /**
         * Default value for the contract duration type field.
         */
        contractDurationType: 'fixed' | 'indefinite';
        /**
         * Default value for the management fee field.
         */
        management: {
            management_fee: string;
        };
        /**
         * Default value for the region field.
         */
        regionSlug: string;
    } & Record<string, unknown>>;
    options?: UseCostCalculatorOptions;
    render: (costCalculatorBag: ReturnType<typeof useCostCalculator>) => React__default.ReactNode;
    /**
     * Whether to include annual_gross_salary in the estimation payload
     */
    version?: CostCalculatorVersion;
};
declare const CostCalculatorFlow: ({ estimationOptions, defaultValues, options, render, version, }: CostCalculatorFlowProps) => react_jsx_runtime.JSX.Element;

export { CostCalculatorFlow, type CostCalculatorFlowProps };

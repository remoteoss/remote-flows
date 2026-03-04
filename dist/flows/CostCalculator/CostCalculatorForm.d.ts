import * as react_jsx_runtime from 'react/jsx-runtime';
import { CostCalculatorEstimationSubmitValues, CostCalculatorEstimationResponse, EstimationError } from './types.js';
import { N as NormalizedFieldError } from '../../mutations-B5hd-NxF.js';
import '../../types.gen-CtACO7H3.js';
import './constants.js';
import '../types.js';
import '../../remoteFlows-D7HHZxko.js';
import 'react';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';

type CostCalculatorFormProps = Partial<{
    /**
     * Callback function that handles form submission. When form is submit, the form values are sent to the consumer app before behind submitted to Remote.
     * @param data - The payload sent to the /cost-calculator/estimation endpoint.
     */
    onSubmit: (data: CostCalculatorEstimationSubmitValues) => Promise<void> | void;
    /**
     * Callback function to handle the success when the estimation succeeds. The CostCalculatorEstimateResponse is sent back to you.
     * @param data - The response data from the /cost-calculator/estimation endpoint.
     */
    onSuccess: (data: CostCalculatorEstimationResponse) => Promise<void> | void;
    /**
     * Callback function to handle the error when the estimation fails.
     * @param error - The error object.
     */
    onError: (error: EstimationError) => void;
    /**
     * Enhanced callback function to handle errors with field-level details.
     * @param error - The error object with field errors.
     */
    onErrorWithFields?: ({ error, fieldErrors, }: {
        error: Error;
        fieldErrors: NormalizedFieldError[];
        rawError: Record<string, unknown>;
    }) => void;
    /**
     * Whether to reset the form when the form is successfully submitted.
     */
    shouldResetForm?: boolean;
    /**
     * Fields to reset when the form is successfully submitted.
     */
    resetFields?: ('country' | 'currency' | 'salary')[];
}>;
declare function CostCalculatorForm({ onSubmit, onError, onSuccess, onErrorWithFields, shouldResetForm, resetFields, }: CostCalculatorFormProps): react_jsx_runtime.JSX.Element;

export { CostCalculatorForm };

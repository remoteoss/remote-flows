import { $ as $TSFixMe, M as Meta } from '../../remoteFlows-BlCKwGdn.js';
import { d as CostCalculatorEstimateResponse, N as NotFoundResponse, U as UnprocessableEntityResponse } from '../../types.gen-CIMOKNAn.js';
import * as react from 'react';
import { useCostCalculator } from './hooks.js';
import { CostCalculatorEstimationFormValues, CostCalculatorEstimationSubmitValues } from './types.js';
import { E as ErrorResponse, S as SuccessResponse } from '../../mutations-KX37KHHt.js';
import * as yup from 'yup';
import { UseFormReturn } from 'react-hook-form';
import '../../types-ZWIpiFgj.js';
import './constants.js';
import '../types.js';
import '@remoteoss/remote-json-schema-form-kit';

declare const CostCalculatorContext: react.Context<{
    form: UseFormReturn<$TSFixMe> | null;
    formId: string | undefined;
    costCalculatorBag?: ReturnType<typeof useCostCalculator>;
}>;
declare const useCostCalculatorContext: () => {
    readonly form: UseFormReturn<any>;
    readonly formId: string | undefined;
    readonly costCalculatorBag: {
        stepState: {
            current: number;
            total: number;
            isLastStep: boolean;
        };
        fields: Record<string, unknown>[];
        validationSchema: yup.AnyObjectSchema;
        parseFormValues: (values: CostCalculatorEstimationFormValues) => Promise<CostCalculatorEstimationSubmitValues>;
        handleValidation: (values: CostCalculatorEstimationFormValues) => Promise<{
            formErrors: any;
            yupError: yup.ValidationError;
        }>;
        isSubmitting: boolean;
        isLoading: boolean;
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
        resetForm: () => void;
        currencies: {
            value: string;
            label: string;
        }[] | undefined;
        meta: {
            fields: Meta;
        };
    } | undefined;
};

export { CostCalculatorContext, useCostCalculatorContext };

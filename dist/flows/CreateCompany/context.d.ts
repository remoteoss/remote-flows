import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import { J as JSFFields, M as Meta, a as JSFFieldset } from '../../remoteFlows-DagBfxnm.js';
import { D as CompanyResponse, N as NotFoundResponse, U as UnprocessableEntityResponse, T as TooManyRequestsResponse, B as BadRequestResponse, a as UnauthorizedResponse } from '../../types.gen-DZuOPZbG.js';
import * as React from 'react';
import { F as FieldError } from '../../mutations-Bz0Iad09.js';
import * as react_hook_form from 'react-hook-form';
import { Step } from '../useStepState.js';
import { u as useCreateCompany } from '../../types-WUo_hssC.js';
import { STEPS } from './utils.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import 'react/jsx-runtime';
import '../types.js';
import './components/CreateCompanySubmit.js';

declare const CreateCompanyContext: React.Context<{
    formId: string | undefined;
    createCompanyBag: ReturnType<typeof useCreateCompany> | null;
}>;
declare const useCreateCompanyContext: () => {
    readonly formId: string;
    readonly createCompanyBag: {
        isLoading: boolean;
        isSubmitting: boolean;
        fieldValues: react_hook_form.FieldValues;
        stepState: {
            currentStep: Step<"address_details" | "company_basic_information">;
            totalSteps: number;
            values: {
                address_details: react_hook_form.FieldValues;
                company_basic_information: react_hook_form.FieldValues;
            } | null;
        };
        checkFieldUpdates: React.Dispatch<React.SetStateAction<react_hook_form.FieldValues>>;
        back: () => void;
        next: () => void;
        goTo: (step: keyof typeof STEPS) => void;
        onSubmit: (values: react_hook_form.FieldValues) => Promise<{
            data: {
                countryCode: any;
                companyOwnerEmail: any;
                companyOwnerName: any;
                desiredCurrency: any;
                name: any;
                phoneNumber: any;
                taxNumber: any;
            };
        } | {
            data: null;
            error: Error;
            rawError: Record<string, unknown>;
            fieldErrors: FieldError[];
        } | {
            data: ({
                data: CompanyResponse;
                error: undefined;
            } | {
                data: undefined;
                error: NotFoundResponse | UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse | UnauthorizedResponse;
            }) & {
                request: Request;
                response: Response;
            };
        }>;
        fields: JSFFields;
        meta: {
            fields: {
                company_basic_information: Meta;
                address_details: Meta;
            };
            fieldsets: JSFFieldset | null | undefined;
        };
        parseFormValues: (values: react_hook_form.FieldValues) => Promise<Record<string, any>>;
        handleValidation: (values: react_hook_form.FieldValues) => Promise<_remoteoss_remote_json_schema_form_kit.ValidationResult | null>;
        initialValues: {
            company_basic_information: Record<string, unknown>;
            address_details: Record<string, unknown>;
        };
    };
};

export { CreateCompanyContext, useCreateCompanyContext };

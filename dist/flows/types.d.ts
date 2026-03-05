import { a as JSFFieldset } from '../remoteFlows-DagBfxnm.js';
import { ModifyConfig, FormResult } from '@remoteoss/remote-json-schema-form-kit';
import 'react';
import 'yup';
import '../types.gen-DZuOPZbG.js';
import '../types-ZWIpiFgj.js';
import 'react-hook-form';

type Success<T> = {
    data: T;
    error: null;
};
type Failure<E> = {
    data: null;
    error: E | Error;
};
type Result<T, E = Error> = Success<T> | Failure<E>;
type Field = {
    name: string;
    label?: string;
    description?: string;
    fields?: Field[];
    type: 'string' | 'integer' | 'number' | 'object' | 'boolean';
    inputType: 'text' | 'textarea' | 'number' | 'select' | 'money' | 'radio' | 'checkbox' | 'date' | 'hidden';
    required: boolean;
    jsonType?: string;
    isVisible: boolean;
    accept?: string;
    errorMessage?: Record<string, string>;
    computedAttributes?: Record<string, unknown>;
    minDate?: string;
    maxDate?: string;
    maxLength?: number;
    maxFileSize?: number;
    format?: string;
    anyOf?: unknown[];
    options?: unknown[];
    onChange?: (value: string) => void;
    [key: string]: unknown;
};
type JSONSchemaFormType = 'address_details' | 'administrative_details' | 'bank_account_details' | 'employment_basic_information' | 'contractor_basic_information' | 'contractor_contract_details' | 'billing_address_details' | 'contract_details' | 'emergency_contact' | 'employment_document_details' | 'personal_details' | 'pricing_plan_details' | 'global_payroll_administrative_details' | 'global_payroll_contract_details' | 'global_payroll_personal_details' | 'benefit_renewal_request';
type JSFModify = ModifyConfig & {
    /**
     * allows to specify additional required fields for the form.
     */
    required?: string[];
    /**
     * allows to specify additional allOf rules for the form.
     */
    allOf?: unknown[];
};
type FlowOptions = {
    jsfModify?: JSFModify;
    jsonSchemaVersion?: {
        contract_amendments?: number;
        /**
         * @deprecated use jsonSchemaVersionByCountry instead
         */
        form_schema?: {
            [key in JSONSchemaFormType]?: number;
        };
        benefit_offers_form_schema?: number;
        contractor_contract_details_form_schema?: number;
    };
};
type JSONSchemaFormResultWithFieldsets = FormResult & {
    meta: {
        'x-jsf-fieldsets': JSFFieldset;
    };
};

export type { Field, FlowOptions, JSFModify, JSONSchemaFormResultWithFieldsets, JSONSchemaFormType, Result };

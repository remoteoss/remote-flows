import { modify } from '@remoteoss/json-schema-form';

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E | Error;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export type Field = {
  name: string;
  label?: string;
  description?: string;
  fields?: Field[];
  type: 'string' | 'integer' | 'number' | 'object' | 'boolean';
  inputType:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'money'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'hidden';
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
  // Allow additional properties from x-jsf-presentation (e.g. meta from oneOf/anyOf)
  [key: string]: unknown;
};

export type JSONSchemaFormType =
  // Employee/contractor forms
  | 'address_details'
  | 'administrative_details'
  | 'bank_account_details'
  | 'employment_basic_information'
  | 'contractor_basic_information'
  | 'contractor_contract_details'
  | 'billing_address_details'
  | 'contract_details'
  | 'emergency_contact'
  | 'employment_document_details'
  | 'personal_details'
  | 'pricing_plan_details'

  // Global payroll forms
  | 'global_payroll_administrative_details'
  | 'global_payroll_contract_details'
  | 'global_payroll_personal_details'

  // Benefits forms
  | 'benefit_renewal_request';

export type JSFModify = Parameters<typeof modify>[1];

export type FlowOptions = {
  jsfModify?: JSFModify;
  jsonSchemaVersion?: {
    contract_amendments?: number;
    form_schema?: {
      [key in JSONSchemaFormType]?: number;
    };
    benefit_offers_form_schema?: number;
    contractor_contract_details_form_schema?: number;
  };
};

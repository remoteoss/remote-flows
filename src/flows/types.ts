import type { JSFModify } from '@remoteoss/remote-flows-core';
import type { NormalizedFieldError } from '@/src/lib/mutations';

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E | Error;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

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

export type FlowOptions = {
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
    employment_basic_information?: number | 'latest';
  };
};

/**
 * Shared callback prop type for GP step components (admin and employee flows).
 * `TSuccess` lets a step narrow the success payload to its own response type;
 * defaults to `unknown` for compatibility.
 */
export type GPStepCallbacks<TSuccess = unknown> = {
  onSubmit?: (payload: Record<string, unknown>) => void | Promise<void>;
  onSuccess?: (data: TSuccess) => void | Promise<void>;
  onError?: (args: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

export type JSFModifyField = {
  description?: string;
  enum?: string[];
  type?: string;
  oneOf?: Array<{
    const: string;
    title?: string;
    description?: string;
  }>;
  'x-jsf-presentation'?: {
    inputType?: string;
    options?: Array<{
      value: string;
      label?: string;
      description?: string;
    }>;
  };
};

export type { Field } from '@remoteoss/remote-flows-core';

export type {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@remoteoss/remote-flows-core';

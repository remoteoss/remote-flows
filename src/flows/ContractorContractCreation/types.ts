import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { Employment } from '@/src/client';
import { JSFFields, NestedMeta } from '@/src/types/remoteFlows';
import { JSFModify } from '@/src/flows/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { ContractorContractCreationForm } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationForm';
import { ContractorContractCreationSubmitButton } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationSubmitButton';

/**
 * Form payload for contractor contract creation
 * TODO: Probably we need to correct the type
 */
export type ContractorContractCreationFormPayload = Record<string, unknown>;

/**
 * Response from contractor contract document creation
 * TODO: Probably we need to correct type...
 */
export type ContractorContractCreationResponse = {
  contract_document?: {
    id: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Props for the flow bag exposed to render prop
 */
export interface ContractorContractCreationFlowBag {
  /**
   * Loading state indicating if the flow is loading data
   */
  isLoading: boolean;

  /**
   * Current state of the form fields
   */
  fieldValues: FieldValues;

  /**
   * Array of form fields from the schema
   */
  fields: JSFFields;

  /**
   * Function to update the current form field values
   * @param values - New form values to set
   */
  checkFieldUpdates: (values: FieldValues) => void;

  /**
   * Function to validate form values against the schema
   * @param values - Form values to validate
   * @returns Validation result or null if no schema is available
   */
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;

  /**
   * Function to parse form values before submission
   * @param values - Form values to parse
   * @returns Parsed form values
   */
  parseFormValues: (values: FieldValues) => Promise<FieldValues>;

  /**
   * Function to handle form submission
   * @param values - Form values to submit
   * @returns Promise resolving to the mutation result
   */
  onSubmit: (values: FieldValues) => Promise<unknown>;

  /**
   * Initial form values
   */
  initialValues: Record<string, unknown>;

  /**
   * Employment data for the contractor
   */
  employment?: Employment;

  /**
   * Indicates whether AI validation errors can be skipped
   */
  canSkipAiValidation: boolean;

  /**
   * Loading state indicating if the mutation is in progress
   */
  isSubmitting: boolean;

  /**
   * Fields metadata
   */
  meta: {
    fields: NestedMeta;
    fieldsets: unknown;
    presentation: Record<string, unknown> | null | undefined;
  };
}

/**
 * Props for render prop function
 */
export interface ContractorContractCreationRenderProps {
  flowBag: ContractorContractCreationFlowBag;
  components: {
    Form: typeof ContractorContractCreationForm;
    SubmitButton: typeof ContractorContractCreationSubmitButton;
  };
}

/**
 * Props for the ContractorContractCreationFlow component
 */
export interface ContractorContractCreationFlowProps {
  /**
   * Required: Contractor employment ID to create contract for
   */
  employmentId: string;

  /**
   * Optional: User-provided field overrides
   * TODO: We need to correct type...
   */
  jsfModify?: JSFModify['contract_details'];

  /**
   * Optional: Initial values
   */
  initialValues?: Record<string, unknown>;

  /**
   * Optional: JSON schema version
   */
  jsonSchemaVersion?: number | 'latest';

  /**
   * Callback fired when form is submitted (before API call)
   */
  onSubmit?: (
    payload: ContractorContractCreationFormPayload,
  ) => void | Promise<void>;

  /**
   * Callback fired when contract creation is successful
   */
  onSuccess?: (
    response: ContractorContractCreationResponse,
  ) => void | Promise<void>;

  /**
   * Callback fired when an error occurs
   */
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;

  /**
   * Render prop function
   */
  render: (props: ContractorContractCreationRenderProps) => ReactNode;
}

/**
 * Props for the useContractorContractCreation hook
 */
export interface ContractorContractCreationHookProps {
  employmentId: string;
  initialValues?: Record<string, unknown>;
  jsfModify?: JSFModify['contract_details'];
  jsonSchemaVersion?: number | 'latest';
}

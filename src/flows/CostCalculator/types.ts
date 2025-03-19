import { EmploymentTermType } from '@/src/client';
import { AnyObjectSchema } from 'yup';

export type CostCalculatorEstimateFormValues = {
  currency: string;
  country: string;
  salary: string;
} & Partial<{
  region: string;
  age: number;
  contract_duration_type: EmploymentTermType;
}>;

export type Field = {
  name: string;
  label?: string;
  description?: string;
  fields?: Field[];
  type: 'string' | 'integer' | 'number' | 'object';
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

export type BaseHookReturn<TFormParams extends object, TResponse> = {
  stepState: {
    current: number;
    total: number;
    isLastStep: boolean;
  };
  fields: Field[];
  validationSchema: AnyObjectSchema;
  handleValidation?: (values: Record<string, unknown>) => void;
  onSubmit: (values: TFormParams) => Promise<TResponse | null>;
};

export type CostCalculatorEstimationOptions = Partial<{
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
}>;

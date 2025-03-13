import { AnyObjectSchema } from 'yup';

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

  // Allow additional properties from x-jsf-presentation (e.g. meta from oneOf/anyOf)
  [key: string]: unknown;
};

export type BaseHookReturn<TFormParams extends object> = {
  stepState: {
    current: number;
    total: number;
    isLastStep: boolean;
  };
  fields: Field[];
  validationSchema: AnyObjectSchema;
  handleValidation?: (values: Record<string, unknown>) => void;
  onSubmit: (values: TFormParams) => Promise<void>;
};

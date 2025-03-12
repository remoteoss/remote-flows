import type { AnyObjectSchema } from 'yup';
import type { Field } from './fields';

export type BaseFlow<TFormParams extends {}> = {
  stepState: {
    current: number;
    total: number;
    isLastStep: boolean;
  };
  fields: Field[];
  validationSchema: AnyObjectSchema;
  handleValidation?: (values: Record<string, unknown>) => any;
  onSubmit: (values: TFormParams) => Promise<any>;
};

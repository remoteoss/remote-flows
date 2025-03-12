import type { Field } from './fields';

export type BaseFlow<TFormParams extends {}> = {
  stepState: {
    current: number;
    total: number;
    isLastStep: boolean;
  };
  fields: Field[];
  handleValidation?: (values: Record<string, unknown>) => any;
  onSubmit: (values: TFormParams) => Promise<any>;
};

import { FieldValues } from 'react-hook-form';
import { useJsonSchemaPlayground } from './hooks';
import { JsonSchemaPlaygroundForm } from './JsonSchemaPlaygroundForm';
import { JsonSchemaPlaygroundSubmitButton } from './JsonSchemaPlaygroundSubmitButton';
import { JsonSchemaPlaygroundResetButton } from './JsonSchemaPlaygroundResetButton';

export interface JsonSchemaPlaygroundResult {
  success: boolean;
  data: FieldValues;
  timestamp: string;
}

export interface JsonSchemaPlaygroundState {
  resetKey: number;
  selectedSchema: string;
  submittedResults: JsonSchemaPlaygroundResult[];
  isLoading: boolean;
  isSubmitting: boolean;
  fieldsVersion: number;
}

export interface SampleSchema {
  key: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

export interface UseJsonSchemaPlaygroundOptions {
  defaultSchema?: string;
  initialValues?: FieldValues;
  /**
   * Extra schemas made available alongside the built-in samples, keyed by
   * schema key. An entry with the same key as a built-in overrides it.
   */
  schemas: Record<string, SampleSchema>;
  onSubmit?: (values: FieldValues) => void | Promise<void>;
  onSchemaChange?: (schema: string) => void;
  onError?: (error: unknown) => void;
}

export type JsonSchemaPlaygroundRenderProps = {
  /**
   * The playground bag returned by the useJsonSchemaPlayground hook.
   * This bag contains all the methods and properties needed to handle the playground flow.
   * @see {@link useJsonSchemaPlayground}
   */
  playgroundBag: ReturnType<typeof useJsonSchemaPlayground>;
  /**
   * The components used in the playground flow.
   * This includes the form, submit button, and reset button.
   * @see {@link JsonSchemaPlaygroundForm}
   * @see {@link JsonSchemaPlaygroundSubmitButton}
   * @see {@link JsonSchemaPlaygroundResetButton}
   */
  components: {
    Form: typeof JsonSchemaPlaygroundForm;
    SubmitButton: typeof JsonSchemaPlaygroundSubmitButton;
    ResetButton: typeof JsonSchemaPlaygroundResetButton;
  };
};

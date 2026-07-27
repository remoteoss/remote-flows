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
}

export interface UseJsonSchemaPlaygroundOptions {
  defaultSchema?: string;
  initialValues?: FieldValues;
  onSubmit?: (values: FieldValues) => void | Promise<void>;
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

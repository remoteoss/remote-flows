import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { useJsonSchemaPlaygroundContext } from './context';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Components } from '@/src/types/remoteFlows';

export interface JsonSchemaPlaygroundFormProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  onValidationError?: (errors: string[]) => void;
  className?: string;
  components?: Components;
}

export const JsonSchemaPlaygroundForm = ({
  onSubmit,
  onValidationError,
  className,
  components,
}: JsonSchemaPlaygroundFormProps) => {
  const { formId, playgroundBag } = useJsonSchemaPlaygroundContext();

  const form = useJSONSchemaForm({
    handleValidation: playgroundBag.handleValidation,
    defaultValues: playgroundBag.initialValues,
    checkFieldUpdates: playgroundBag.checkFieldUpdates,
  });

  useEffect(() => {
    // Update field values when form values change or schema changes
    const currentValues = form.getValues();
    playgroundBag.checkFieldUpdates(currentValues);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundBag.selectedSchema]);

  // Monitor form errors and report them
  useEffect(() => {
    const errors = form.formState.errors;
    if (errors && Object.keys(errors).length > 0) {
      const errorMessages = Object.entries(errors).map(([field, error]) => {
        const message = error?.message || 'Invalid value';
        return `${field}: ${message}`;
      });
      onValidationError?.(errorMessages);
    } else {
      onValidationError?.([]);
    }
  }, [form.formState.errors, onValidationError]);

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    const parsedValues = await playgroundBag.parseFormValues(values);
    await playgroundBag.handleSubmit(parsedValues);
    onSubmit?.(parsedValues);
  };

  return (
    <Form {...form} key={`form-${playgroundBag.selectedSchema}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={className}
      >
        <JSONSchemaFormFields
          components={components}
          fields={playgroundBag.fields ?? []}
          fieldValues={playgroundBag.fieldValues}
          fieldsets={playgroundBag.meta?.['x-jsf-fieldsets'] ?? []}
        />
      </form>
    </Form>
  );
};

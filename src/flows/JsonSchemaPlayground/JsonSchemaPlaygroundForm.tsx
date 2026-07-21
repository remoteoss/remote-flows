import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { useJsonSchemaPlaygroundContext } from './context';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Components } from '@/src/types/remoteFlows';

export interface JsonSchemaPlaygroundFormProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  className?: string;
  components?: Components;
  defaultValues?: Record<string, unknown>;
}

export const JsonSchemaPlaygroundForm = ({
  onSubmit,
  className,
  components,
  defaultValues = {},
}: JsonSchemaPlaygroundFormProps) => {
  const { formId, playgroundBag } = useJsonSchemaPlaygroundContext();

  const form = useJSONSchemaForm({
    handleValidation: playgroundBag.handleValidation,
    defaultValues: defaultValues,
    checkFieldUpdates: playgroundBag.checkFieldUpdates,
  });

  useEffect(() => {
    // Update field values when form values change
    playgroundBag.checkFieldUpdates(form.getValues());
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          fieldsets={playgroundBag.meta['x-jsf-fieldsets']}
        />
      </form>
    </Form>
  );
};

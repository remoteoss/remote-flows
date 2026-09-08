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

const JsonSchemaPlaygroundFormInner = ({
  onSubmit,
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
    // Update field values when form values change
    playgroundBag.checkFieldUpdates(form.getValues());
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    await playgroundBag.handleSubmit(values);
    onSubmit?.(values);
  };

  return (
    <Form {...form}>
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

export const JsonSchemaPlaygroundForm = (
  props: JsonSchemaPlaygroundFormProps,
) => {
  const { playgroundBag } = useJsonSchemaPlaygroundContext();

  // `useJSONSchemaForm` (inside JsonSchemaPlaygroundFormInner) creates its
  // react-hook-form instance with `defaultValues` that react-hook-form only
  // reads once, on mount. The key must live here, not on the inner <Form>,
  // so switching schemas or resetting fully remounts that hook instance
  // instead of re-rendering it with stale defaults.
  return (
    <JsonSchemaPlaygroundFormInner
      key={`form-${playgroundBag.selectedSchema}-${playgroundBag.resetKey}`}
      {...props}
    />
  );
};

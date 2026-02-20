import { JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { Components } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { useEffect, useRef } from 'react';

type CreateCompanyFormProps = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  components?: Components;
  fields?: JSFFields;
  defaultValues: Record<string, unknown>;
};

export function CreateCompanyForm({
  defaultValues,
  onSubmit,
  components,
}: CreateCompanyFormProps) {
  const { formId, createCompanyBag } = useCreateCompanyContext();
  const prevValuesRef = useRef(defaultValues);

  const resolver = useJsonSchemasValidationFormResolver(
    createCompanyBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const hasChanged = Object.keys(values).some(
        (key) => values[key] !== prevValuesRef.current[key],
      );
      if (hasChanged) {
        createCompanyBag?.checkFieldUpdates(values);
        prevValuesRef.current = { ...values };
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    await onSubmit(values);
  };

  return (
    <Form {...form} key={`form-${createCompanyBag.stepState.currentStep.name}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__OnboardingForm'
      >
        <JSONSchemaFormFields
          components={components}
          fields={createCompanyBag.fields}
          fieldsets={createCompanyBag.meta.fieldsets}
          fieldValues={createCompanyBag.fieldValues}
        />
      </form>
    </Form>
  );
}

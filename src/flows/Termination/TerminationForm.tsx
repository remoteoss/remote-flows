import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolverNext } from '@/src/components/form/validationResolver';
import { Fields } from '@remoteoss/json-schema-form';

type TerminationFormProps = {
  onSubmit: (payload: TerminationFormValues) => void;
  fields?: Fields;
};

export function TerminationForm({ fields, onSubmit }: TerminationFormProps) {
  const { formId, terminationBag } = useTerminationContext();

  const resolver = useJsonSchemasValidationFormResolverNext(
    // @ts-expect-error no matching type
    terminationBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues: terminationBag?.initialValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isAnyFieldDirty = Object.keys(values).some(
        (key) =>
          values[key as keyof TerminationFormValues] !==
          terminationBag?.initialValues?.[key as keyof TerminationFormValues],
      );
      if (isAnyFieldDirty) {
        terminationBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jsonSchemaFields = fields ? fields : (terminationBag?.fields ?? []);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 RemoteFlows__TerminationForm'
      >
        <JSONSchemaFormFields fields={jsonSchemaFields} />
      </form>
    </Form>
  );
}

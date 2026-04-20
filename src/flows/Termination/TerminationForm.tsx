import { JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { FieldValues } from 'react-hook-form';

type TerminationFormProps = {
  onSubmit: (payload: TerminationFormValues) => void;
  fields?: JSFFields;
  defaultValues?: FieldValues;
};

export function TerminationForm({
  defaultValues,
  fields,
  onSubmit,
}: TerminationFormProps) {
  const { formId, terminationBag } = useTerminationContext();

  const form = useJSONSchemaForm({
    handleValidation: terminationBag.handleValidation,
    defaultValues: defaultValues || {},
    checkFieldUpdates: terminationBag.checkFieldUpdates,
  });

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

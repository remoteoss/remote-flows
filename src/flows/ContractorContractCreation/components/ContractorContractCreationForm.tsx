import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { $TSFixMe, JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { Components } from '@/src/types/remoteFlows';
import { useContractorContractCreationContext } from '@/src/flows/ContractorContractCreation/context';
import { ContractorContractCreationFormPayload } from '@/src/flows/ContractorContractCreation/types';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';

type ContractorContractCreationFormProps = {
  onSubmit: (
    payload: ContractorContractCreationFormPayload,
    form: UseFormReturn<$TSFixMe>,
  ) => Promise<void>;
  components?: Components;
  fields?: JSFFields;
  defaultValues: Record<string, unknown>;
};

/**
 * Form component for contractor contract creation
 * Renders the contract details form fields using the JSON schema
 */
export function ContractorContractCreationForm({
  defaultValues,
  onSubmit,
  components,
}: ContractorContractCreationFormProps) {
  const { formId, contractorContractCreationBag } =
    useContractorContractCreationContext();

  const form = useJSONSchemaForm({
    handleValidation: contractorContractCreationBag.handleValidation,
    defaultValues,
    checkFieldUpdates: contractorContractCreationBag.checkFieldUpdates,
  });

  // Initialize field values
  useEffect(() => {
    if (contractorContractCreationBag.employment?.id) {
      contractorContractCreationBag.checkFieldUpdates(form.getValues());
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    await onSubmit(values as ContractorContractCreationFormPayload, form);
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__ContractorContractCreationForm'
      >
        <JSONSchemaFormFields
          components={components}
          fields={contractorContractCreationBag.fields}
          fieldsets={contractorContractCreationBag.meta.fieldsets}
          fieldValues={contractorContractCreationBag.fieldValues}
        />
      </form>
    </Form>
  );
}

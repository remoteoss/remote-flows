import { useEffect } from 'react';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { Components } from '@/src/types/remoteFlows';

type ContractDocumentPreviewFormProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
};

export function ContractDocumentPreviewForm({
  components,
}: ContractDocumentPreviewFormProps) {
  const { contractDocumentBag } = useContractDocumentContext();

  const form = useJSONSchemaForm({
    handleValidation: contractDocumentBag.handleValidation,
    checkFieldUpdates: contractDocumentBag.checkFieldUpdates,
    defaultValues:
      contractDocumentBag.stepState.values?.contract_preview ??
      contractDocumentBag.initialValues.contract_preview,
  });

  useEffect(() => {
    contractDocumentBag.checkFieldUpdates(form.getValues());
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contractDocumentBag.isContractReviewed) {
      form.setValue('review_completed', true);
    }
  }, [contractDocumentBag.isContractReviewed, form]);

  return (
    <Form {...form}>
      <div className='space-y-4 RemoteFlows__ContractDocumentPreviewForm'>
        <JSONSchemaFormFields
          components={components}
          fields={contractDocumentBag.fields}
          fieldsets={contractDocumentBag.meta.fieldsets}
          fieldValues={contractDocumentBag.fieldValues}
        />
      </div>
    </Form>
  );
}

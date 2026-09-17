import { useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { StatementOfWorkDisclaimer } from '@/src/common/contract-documents/components/StatementOfWorkDisclaimer';
import { isCMOrCMPlus } from '@/src/common/contract-documents/utils';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import {
  ContractDocumentContractDetailsPayload,
  ContractDocumentContractDetailsResponse,
} from '@/src/flows/ContractDocument/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { handleStepError } from '@/src/lib/utils';
import { Components } from '@/src/types/remoteFlows';

type ContractDocumentFormProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /**
   * Called with the parsed payload before it is sent to Remote. Throwing aborts the submission.
   */
  onSubmit?: (
    payload: ContractDocumentContractDetailsPayload,
  ) => Promise<void> | void;
  /**
   * Called once the contract document has been created, before moving to the preview step.
   */
  onSuccess?: (
    data: ContractDocumentContractDetailsResponse,
  ) => Promise<void> | void;
  /**
   * Called when creating the contract document fails.
   */
  onError?: (error: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

export function ContractDocumentForm({
  components,
  onSubmit,
  onSuccess,
  onError,
}: ContractDocumentFormProps) {
  const { formId, contractDocumentBag } = useContractDocumentContext();

  const form = useJSONSchemaForm({
    handleValidation: contractDocumentBag.handleValidation,
    checkFieldUpdates: contractDocumentBag.checkFieldUpdates,
    defaultValues: contractDocumentBag.initialValues.contract_details,
  });

  useEffect(() => {
    contractDocumentBag.checkFieldUpdates(form.getValues());
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: FieldValues) => {
    try {
      const payload = await contractDocumentBag.parseFormValues(values);
      await onSubmit?.(payload);

      const response = await contractDocumentBag.onSubmit(values);
      if (response?.data) {
        await onSuccess?.(response.data);
      }
      contractDocumentBag.next();
    } catch (error: unknown) {
      onError?.(handleStepError(error, undefined, form));
    }
  };

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-4 RemoteFlows__ContractDocumentForm'
        >
          <JSONSchemaFormFields
            components={components}
            fields={contractDocumentBag.fields}
            fieldsets={contractDocumentBag.meta.fieldsets}
            fieldValues={contractDocumentBag.fieldValues}
          />
        </form>
      </Form>
      {isCMOrCMPlus(contractDocumentBag.productIdentifier) && (
        <StatementOfWorkDisclaimer
          subscription={contractDocumentBag.productIdentifier}
        />
      )}
    </div>
  );
}

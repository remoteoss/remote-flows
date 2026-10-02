import { useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import {
  ContractDocumentContractPreviewPayload,
  ContractDocumentContractPreviewResponse,
} from '@/src/flows/ContractDocument/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { handleStepError } from '@/src/lib/utils';
import { Components } from '@/src/types/remoteFlows';

type ContractDocumentPreviewFormProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /**
   * Called with the signature before it is sent to Remote. Throwing aborts the submission.
   */
  onSubmit?: (
    payload: ContractDocumentContractPreviewPayload,
  ) => Promise<void> | void;
  /**
   * Called once the contract document has been signed.
   */
  onSuccess?: (
    data: ContractDocumentContractPreviewResponse,
  ) => Promise<void> | void;
  /**
   * Called when signing the contract document fails.
   */
  onError?: (error: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

export function ContractDocumentPreviewForm({
  components,
  onSubmit,
  onSuccess,
  onError,
}: ContractDocumentPreviewFormProps) {
  const { formId, contractDocumentBag } = useContractDocumentContext();

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

  const reviewCompleted = Boolean(
    contractDocumentBag.fieldValues?.review_completed,
  );
  useEffect(() => {
    if (reviewCompleted) {
      form.setValue('review_completed', true);
    }
  }, [reviewCompleted, form]);

  const handleSubmit = async (values: FieldValues) => {
    try {
      const payload = (await contractDocumentBag.parseFormValues(
        values,
      )) as ContractDocumentContractPreviewPayload;
      await onSubmit?.(payload);

      const response = await contractDocumentBag.onSubmit(values);
      if (response?.data) {
        await onSuccess?.(
          response.data as ContractDocumentContractPreviewResponse,
        );
      }
    } catch (error: unknown) {
      onError?.(
        handleStepError(
          error,
          contractDocumentBag.meta.fields.contract_preview,
          form,
        ),
      );
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__ContractDocumentPreviewForm'
      >
        <JSONSchemaFormFields
          components={components}
          fields={contractDocumentBag.fields}
          fieldsets={contractDocumentBag.meta.fieldsets}
          fieldValues={contractDocumentBag.fieldValues}
        />
      </form>
    </Form>
  );
}

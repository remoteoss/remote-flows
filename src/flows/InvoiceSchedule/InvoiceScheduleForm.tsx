import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Form } from '@/src/components/ui/form';
import { useInvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  InvoiceScheduleResponse,
} from '@/src/flows/InvoiceSchedule/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { isStructuredError } from '@/src/lib/utils';
import { AlertCircle } from 'lucide-react';

type InvoiceScheduleFormProps = Partial<{
  /**
   * Called with the parsed payload before it is sent to Remote. Throwing aborts the submission.
   */
  onSubmit: (payload: InvoiceSchedulePayload) => Promise<void> | void;
  /**
   * Called once the schedule has been created.
   */
  onSuccess: (data: InvoiceScheduleResponse) => Promise<void> | void;
  /**
   * Called when creating the schedule fails.
   */
  onError: (error: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
}>;

export function InvoiceScheduleForm({
  onSubmit,
  onSuccess,
  onError,
}: InvoiceScheduleFormProps) {
  const { form, formId, invoiceScheduleBag } = useInvoiceScheduleContext();

  const handleSubmit = async (values: InvoiceScheduleFormValues) => {
    try {
      const payload = await invoiceScheduleBag?.parseFormValues(values);

      if (payload) {
        await onSubmit?.(payload);
      }

      const response = await invoiceScheduleBag?.onSubmit(values);
      await onSuccess?.(response as InvoiceScheduleResponse);
    } catch (error: unknown) {
      if (isStructuredError(error)) {
        onError?.({
          error: error.error,
          rawError: error.rawError,
          fieldErrors: error.fieldErrors,
        });
        return;
      }

      onError?.({
        error: error as Error,
        rawError: {},
        fieldErrors: [],
      });
    }
  };

  const employment = invoiceScheduleBag?.employment;
  const missingWithdrawalMethod =
    employment?.has_active_withdrawal_method === false;
  const contractorName =
    (employment?.basic_information?.name as string | undefined) ||
    'This contractor';

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__InvoiceScheduleForm'
      >
        {missingWithdrawalMethod && (
          <Alert variant='warning'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              {contractorName} does not have an active deposit method on their
              account yet. Schedule this invoice and we&apos;ll reach out to
              them to get one added.
            </AlertDescription>
          </Alert>
        )}
        <JSONSchemaFormFields fields={invoiceScheduleBag?.fields ?? []} />
      </form>
    </Form>
  );
}

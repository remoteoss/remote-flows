import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useInvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  InvoiceScheduleResponse,
} from '@/src/flows/InvoiceSchedule/types';
import { isMutationError, NormalizedFieldError } from '@/src/lib/mutations';

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
      // Reported to the consumer rather than re-thrown: this runs inside react-hook-form's
      // handleSubmit, so re-throwing would surface as an unhandled rejection.
      if (isMutationError(error)) {
        onError?.({
          error: error.error,
          rawError: error.rawError as Record<string, unknown>,
          fieldErrors: error.fieldErrors as NormalizedFieldError[],
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

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__InvoiceScheduleForm'
      >
        <JSONSchemaFormFields fields={invoiceScheduleBag?.fields ?? []} />
      </form>
    </Form>
  );
}

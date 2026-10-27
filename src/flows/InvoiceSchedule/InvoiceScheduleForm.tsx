import { useEffect, useMemo } from 'react';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { getInitialValues } from '@/src/components/form/utils';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useInvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  InvoiceScheduleResponse,
} from '@/src/flows/InvoiceSchedule/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { isStructuredError } from '@/src/lib/utils';

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

export function InvoiceScheduleForm(props: InvoiceScheduleFormProps) {
  const { invoiceScheduleBag } = useInvoiceScheduleContext();

  if (invoiceScheduleBag.fields.length === 0) {
    return null;
  }

  return <InvoiceScheduleFormContent {...props} />;
}

function InvoiceScheduleFormContent({
  onSubmit,
  onSuccess,
  onError,
}: InvoiceScheduleFormProps) {
  const { formId, defaultValues, invoiceScheduleBag } =
    useInvoiceScheduleContext();

  const initialValues = useMemo(
    () =>
      getInitialValues(invoiceScheduleBag.fields, {
        currency: '',
        periodicity: '',
        start_date: '',
        number: '',
        note: '',
        ...defaultValues,
      }),
    [invoiceScheduleBag.fields, defaultValues],
  );

  const form = useJSONSchemaForm({
    handleValidation: invoiceScheduleBag.handleValidation,
    checkFieldUpdates: invoiceScheduleBag.checkFieldUpdates,
    defaultValues: initialValues,
  });

  useEffect(() => {
    invoiceScheduleBag.checkFieldUpdates(form.getValues());
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: InvoiceScheduleFormValues) => {
    try {
      const payload = await invoiceScheduleBag.parseFormValues(values);

      if (payload) {
        await onSubmit?.(payload);
      }

      const response = await invoiceScheduleBag.onSubmit(values);
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

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__InvoiceScheduleForm'
      >
        <JSONSchemaFormFields fields={invoiceScheduleBag.fields ?? []} />
      </form>
    </Form>
  );
}

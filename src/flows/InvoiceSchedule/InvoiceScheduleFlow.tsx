import React, { useEffect, useId } from 'react';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { ONE_TIME_PERIODICITY } from '@/src/common/invoice-schedules';
import { InvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';
import { UseInvoiceScheduleOptions } from '@/src/flows/InvoiceSchedule/types';

export type InvoiceScheduleFlowProps = {
  /**
   * The contractor to create the schedule for. Sourcing it is yours — a picker of your own, a
   * route param, the row the user clicked; the flow only ever acts on this one contractor.
   */
  employmentId: string;
  /**
   * Modify the generated JSON-schema form fields.
   */
  jsfModify?: UseInvoiceScheduleOptions['jsfModify'];
  /**
   * Default values for the form fields.
   */
  defaultValues?: Record<string, unknown>;
  render: (
    invoiceScheduleBag: ReturnType<typeof useInvoiceSchedule>,
  ) => React.ReactNode;
};

/**
 * Standalone screen for creating a contractor invoice schedule, mirroring the platform's
 * single-screen modal. Mount it anywhere — it does not depend on the onboarding flow.
 */
export const InvoiceScheduleFlow = ({
  employmentId,
  jsfModify,
  defaultValues,
  render,
}: InvoiceScheduleFlowProps) => {
  const formId = useId();
  const invoiceScheduleBag = useInvoiceSchedule({
    employmentId,
    jsfModify,
  });

  // `useJSONSchemaForm` subscribes to form changes and feeds them back through
  // `checkFieldUpdates`, which is what makes the schema's conditionals — the item-row
  // reveal and the semi-monthly day fields — re-evaluate as the form is filled in.
  const form = useJSONSchemaForm({
    handleValidation: invoiceScheduleBag.handleValidation,
    checkFieldUpdates: invoiceScheduleBag.checkFieldUpdates,
    defaultValues: {
      currency: '',
      periodicity: '',
      start_date: '',
      number: '',
      note: '',
      ...defaultValues,
    },
  });

  // Contractor of Record is only known once the employment request resolves, so the form
  // offers the recurring frequencies until then and a frequency chosen in that window
  // outlives the schema shrinking to one-off. Validation does reject it — the field's `oneOf`
  // no longer holds it — but the select renders blank in the meantime and the user only finds
  // out on submit, so drop it as soon as the restriction is known.
  const { isContractorOfRecord } = invoiceScheduleBag;

  useEffect(() => {
    if (!isContractorOfRecord) return;

    const periodicity = form.getValues('periodicity');
    if (periodicity && periodicity !== ONE_TIME_PERIODICITY) {
      form.setValue('periodicity', '');
    }
  }, [isContractorOfRecord, form]);

  return (
    <InvoiceScheduleContext.Provider
      value={{
        form,
        formId,
        invoiceScheduleBag,
      }}
    >
      {render(invoiceScheduleBag)}
    </InvoiceScheduleContext.Provider>
  );
};

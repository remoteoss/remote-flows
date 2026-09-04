import React, { useEffect, useId, useRef } from 'react';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { InvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';
import { UseInvoiceScheduleOptions } from '@/src/flows/InvoiceSchedule/types';

export type InvoiceScheduleFlowProps = {
  /**
   * Create the schedule for this contractor and skip the picker. Omit to have the flow load
   * the company's active contractors and render a picker as the first field.
   */
  employmentId?: string;
  /**
   * Modify the generated JSON-schema form fields.
   */
  jsfModify?: UseInvoiceScheduleOptions['jsfModify'];
  /**
   * Filter the `contractors` bag entry by name, server-side. The rendered picker is a
   * type-ahead that owns its own search, so this is only needed if you build your own picker.
   */
  contractorSearch?: string;
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
  contractorSearch,
  defaultValues,
  render,
}: InvoiceScheduleFlowProps) => {
  const formId = useId();
  const invoiceScheduleBag = useInvoiceSchedule({
    employmentId,
    jsfModify,
    contractorSearch,
  });

  // `useJSONSchemaForm` subscribes to form changes and feeds them back through
  // `checkFieldUpdates`, which is what makes the schema's conditionals — the item-row
  // reveal and the semi-monthly day fields — re-evaluate as the form is filled in.
  const form = useJSONSchemaForm({
    handleValidation: invoiceScheduleBag.handleValidation,
    checkFieldUpdates: invoiceScheduleBag.checkFieldUpdates,
    defaultValues: {
      employment_id: employmentId ?? '',
      currency: '',
      periodicity: '',
      start_date: '',
      number: '',
      note: '',
      ...defaultValues,
    },
  });

  // The picker drives the currency options and the Contractor-of-Record restriction, so the
  // hook needs to know about a change before the form is submitted.
  const employmentIdValue = form.watch('employment_id');
  const { onContractorChange, rendersContractorSelect } = invoiceScheduleBag;
  const lastNotified = useRef<string | undefined>(employmentId);

  useEffect(() => {
    if (!rendersContractorSelect) return;
    if (lastNotified.current === employmentIdValue) return;
    lastNotified.current = employmentIdValue;
    onContractorChange(employmentIdValue);
  }, [employmentIdValue, onContractorChange, rendersContractorSelect]);

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

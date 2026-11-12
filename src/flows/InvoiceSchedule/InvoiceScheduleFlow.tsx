import React, { useId } from 'react';
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
  /**
   * Called when opening the invoice number sequence page fails. The link stays on screen.
   */
  onMagicLinkError?: UseInvoiceScheduleOptions['onMagicLinkError'];
  render: (
    invoiceScheduleBag: ReturnType<typeof useInvoiceSchedule>,
  ) => React.ReactNode;
};

/**
 * Standalone screen for creating a contractor invoice schedule, mirroring the platform's
 * single-screen modal. Mount it anywhere — it does not depend on the onboarding flow.
 */
export const InvoiceScheduleFlow = (props: InvoiceScheduleFlowProps) => (
  <InvoiceScheduleFlowContent key={props.employmentId} {...props} />
);

const InvoiceScheduleFlowContent = ({
  employmentId,
  jsfModify,
  defaultValues,
  onMagicLinkError,
  render,
}: InvoiceScheduleFlowProps) => {
  const formId = useId();
  const invoiceScheduleBag = useInvoiceSchedule({
    employmentId,
    jsfModify,
    defaultValues,
    onMagicLinkError,
  });

  return (
    <InvoiceScheduleContext.Provider
      value={{
        formId,
        invoiceScheduleBag,
      }}
    >
      {render(invoiceScheduleBag)}
    </InvoiceScheduleContext.Provider>
  );
};

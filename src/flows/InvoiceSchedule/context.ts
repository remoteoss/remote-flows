import { createContext, useContext } from 'react';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';

export const InvoiceScheduleContext = createContext<{
  formId: string | undefined;
  defaultValues?: Record<string, unknown>;
  invoiceScheduleBag?: ReturnType<typeof useInvoiceSchedule>;
}>({
  formId: undefined,
  defaultValues: undefined,
  invoiceScheduleBag: undefined,
});

export const useInvoiceScheduleContext = () => {
  const context = useContext(InvoiceScheduleContext);
  if (!context.invoiceScheduleBag) {
    throw new Error(
      'useInvoiceScheduleContext must be used within an InvoiceScheduleFlow',
    );
  }

  return {
    formId: context.formId,
    defaultValues: context.defaultValues,
    invoiceScheduleBag: context.invoiceScheduleBag,
  } as const;
};

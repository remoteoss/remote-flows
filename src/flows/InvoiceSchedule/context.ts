import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';

export const InvoiceScheduleContext = createContext<{
  form: UseFormReturn<$TSFixMe> | null;
  formId: string | undefined;
  invoiceScheduleBag?: ReturnType<typeof useInvoiceSchedule>;
}>({
  form: null,
  formId: undefined,
  invoiceScheduleBag: undefined,
});

export const useInvoiceScheduleContext = () => {
  const context = useContext(InvoiceScheduleContext);
  if (!context.form) {
    throw new Error(
      'useInvoiceScheduleContext must be used within an InvoiceScheduleFlow',
    );
  }

  return {
    form: context.form,
    formId: context.formId,
    invoiceScheduleBag: context.invoiceScheduleBag,
  } as const;
};

import { createContext, RefObject, useContext } from 'react';
import { UseFormTrigger } from 'react-hook-form';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';

export const InvoiceScheduleContext = createContext<{
  formId: string | undefined;
  invoiceScheduleBag?: ReturnType<typeof useInvoiceSchedule>;
  formRef?: {
    trigger: RefObject<UseFormTrigger<Record<string, unknown>> | undefined>;
  };
}>({
  formId: undefined,
  invoiceScheduleBag: undefined,
  formRef: undefined,
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
    invoiceScheduleBag: context.invoiceScheduleBag,
    formRef: context.formRef,
  } as const;
};

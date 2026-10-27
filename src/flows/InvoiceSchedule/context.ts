import { createContext, MutableRefObject, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useInvoiceSchedule } from '@/src/flows/InvoiceSchedule/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';

export const InvoiceScheduleContext = createContext<{
  formRef: MutableRefObject<UseFormReturn<$TSFixMe> | null> | undefined;
  formId: string | undefined;
  defaultValues?: Record<string, unknown>;
  invoiceScheduleBag?: ReturnType<typeof useInvoiceSchedule>;
}>({
  formRef: undefined,
  formId: undefined,
  defaultValues: undefined,
  invoiceScheduleBag: undefined,
});

export const useInvoiceScheduleContext = () => {
  const context = useContext(InvoiceScheduleContext);
  if (!context.invoiceScheduleBag || !context.formRef) {
    throw new Error(
      'useInvoiceScheduleContext must be used within an InvoiceScheduleFlow',
    );
  }

  return {
    formRef: context.formRef,
    formId: context.formId,
    defaultValues: context.defaultValues,
    invoiceScheduleBag: context.invoiceScheduleBag,
  } as const;
};

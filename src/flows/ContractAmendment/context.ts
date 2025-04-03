import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useContractAmendment } from './hooks';

type ContractAmendmentFormValues = {
  effective_date: string;
  job_title: string | undefined;
  additional_comments: string;
};

export const ContractAmendmentContext = createContext<{
  form: UseFormReturn<ContractAmendmentFormValues> | null;
  formId: string | undefined;
  contractAmendmentBag: ReturnType<typeof useContractAmendment> | null;
}>({ form: null, formId: undefined, contractAmendmentBag: null });

export const useContractAmendmentContext = () => {
  const context = useContext(ContractAmendmentContext);
  if (!context.form || !context.contractAmendmentBag) {
    throw new Error(
      'useContractAmendmentContext must be used within a ContractAmendmentProvider',
    );
  }

  return {
    form: context.form,
    formId: context.formId,
    contractAmendment: context.contractAmendmentBag,
  } as const;
};

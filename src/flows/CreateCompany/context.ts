import type { useCreateCompany } from '@/src/flows/CreateCompany/hooks';
import { createContext, useContext, RefObject } from 'react';
import { UseFormSetValue } from 'react-hook-form';
export const CreateCompanyContext = createContext<{
  formId: string | undefined;
  createCompanyBag: ReturnType<typeof useCreateCompany> | null;
  formRef?: {
    setValue: RefObject<UseFormSetValue<Record<string, unknown>> | undefined>;
  };
}>({
  formId: undefined,
  createCompanyBag: null,
  formRef: undefined,
});

export const useCreateCompanyContext = () => {
  const context = useContext(CreateCompanyContext);
  if (!context.formId || !context.createCompanyBag) {
    throw new Error(
      'useCreateCompanyContext must be used within a CreateCompanyContextProvider',
    );
  }

  return {
    formId: context.formId,
    createCompanyBag: context.createCompanyBag,
    formRef: context.formRef,
  } as const;
};

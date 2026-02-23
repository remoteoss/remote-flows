import type { useCreateCompany } from '@/src/flows/CreateCompany/hooks';
import { createContext, useContext } from 'react';
export const CreateCompanyContext = createContext<{
  formId: string | undefined;
  createCompanyBag: ReturnType<typeof useCreateCompany> | null;
}>({
  formId: undefined,
  createCompanyBag: null,
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
  } as const;
};

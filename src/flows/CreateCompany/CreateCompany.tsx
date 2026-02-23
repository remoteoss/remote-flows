import { CreateCompanyFlowProps } from '@/src/flows/CreateCompany/types';
import { useCreateCompany } from '@/src/flows/CreateCompany/hooks';
import { CreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { CompanyBasicInformationStep } from '@/src/flows/CreateCompany/components/CompanyBasicInformationStep';
import { AddressDetailsStep } from '@/src/flows/CreateCompany/components/AddressDetailsStep';
import { CreateCompanySubmit } from '@/src/flows/CreateCompany/components/CreateCompanySubmit';
import { useId } from 'react';
export const CreateCompanyFlow = ({
  render,
  countryCode,
  options,
  initialValues,
}: CreateCompanyFlowProps) => {
  const createCompanyBag = useCreateCompany({
    options,
    countryCode,
    initialValues,
  });
  const formId = useId();
  return (
    <CreateCompanyContext.Provider value={{ createCompanyBag, formId }}>
      {render({
        createCompanyBag,
        components: {
          CompanyBasicInformationStep: CompanyBasicInformationStep,
          AddressDetailsStep: AddressDetailsStep,
          SubmitButton: CreateCompanySubmit,
        },
      })}
    </CreateCompanyContext.Provider>
  );
};

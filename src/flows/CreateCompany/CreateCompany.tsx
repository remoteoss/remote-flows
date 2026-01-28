
import { CreateCompanyFlowProps} from '@/src/flows/CreateCompany/types'
import { useCreateCompany} from '@/src/flows/CreateCompany/hooks'
import { CreateCompanyContext} from '@/src/flows/CreateCompany/context'
import { SelectCountryStep } from '@/src/flows/CreateCompany/components/SelectCountryStep';
import { CreateCompanySubmit } from '@/src/flows/CreateCompany/components/CreateCompanySubmit';
import { useId } from 'react';
export const CreateCompanyFlow = ({
  render,
  countryCode,
  options,
}: CreateCompanyFlowProps) => {
  const createCompanyBag = useCreateCompany({
    options,
    countryCode,
  });
  const formId = useId();
  return (
    <CreateCompanyContext.Provider
      value={{ createCompanyBag, formId }}
    >
      {render({
        createCompanyBag,
        components: {
          SelectCountryStep: SelectCountryStep,
	  SubmitButton: CreateCompanySubmit
        },
      })}
    </CreateCompanyContext.Provider>
  );
};

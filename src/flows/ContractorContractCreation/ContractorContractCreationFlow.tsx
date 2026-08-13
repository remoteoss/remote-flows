import { useId } from 'react';
import { ContractorContractCreationContext } from '@/src/flows/ContractorContractCreation/context';
import { useContractorContractCreation } from '@/src/flows/ContractorContractCreation/hooks';
import { ContractorContractCreationFlowProps } from '@/src/flows/ContractorContractCreation/types';
import { ContractorContractCreationForm } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationForm';
import { ContractorContractCreationSubmitButton } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationSubmitButton';

/**
 * ContractorContractCreationFlow component
 *
 * A single-step flow for creating contractor contracts directly from a contractor profile
 * without going through the full onboarding process.
 *
 */
export const ContractorContractCreationFlow = ({
  render,
  employmentId,
  initialValues,
  jsfModify,
  jsonSchemaVersion,
}: ContractorContractCreationFlowProps) => {
  const formId = useId();

  const contractorContractCreationBag = useContractorContractCreation({
    employmentId,
    initialValues,
    jsfModify,
    jsonSchemaVersion,
  });

  return (
    <ContractorContractCreationContext.Provider
      value={{ contractorContractCreationBag, formId }}
    >
      {render({
        flowBag: contractorContractCreationBag,
        components: {
          Form: ContractorContractCreationForm,
          SubmitButton: ContractorContractCreationSubmitButton,
        },
      })}
    </ContractorContractCreationContext.Provider>
  );
};

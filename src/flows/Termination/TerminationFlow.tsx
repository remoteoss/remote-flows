import { TerminationContext } from '@/src/flows/Termination/context';
import { useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';
import { EmployeeCommunicationForm } from '@/src/flows/Termination/EmployeeComunicationForm';
import { TerminationDetailsForm } from '@/src/flows/Termination/TerminationDetailsForm';
import { PaidTimeOffForm } from '@/src/flows/Termination/PaidTimeOffForm';
import { AdditionalDetailsForm } from '@/src/flows/Termination/AdditionalDetailsForm';
import { TerminationFlowProps } from '@/src/flows/Termination/types';

export const TerminationFlow = ({
  employmentId,
  render,
  options,
  initialValues,
}: TerminationFlowProps) => {
  const formId = useId();
  const terminationBag = useTermination({
    employmentId,
    options,
    initialValues,
  });

  return (
    <TerminationContext.Provider
      value={{
        formId: formId,
        terminationBag,
      }}
    >
      {render({
        terminationBag,
        components: {
          SubmitButton: TerminationSubmit,
          Back: TerminationBack,
          EmployeeComunicationStep: EmployeeCommunicationForm,
          TerminationDetailsStep: TerminationDetailsForm,
          PaidTimeOffStep: PaidTimeOffForm,
          AdditionalDetailsStep: AdditionalDetailsForm,
        },
      })}
    </TerminationContext.Provider>
  );
};

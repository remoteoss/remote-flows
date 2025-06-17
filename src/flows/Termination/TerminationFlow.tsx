import { TerminationContext } from '@/src/flows/Termination/context';
import React, { useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/types';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { TimeOff } from '@/src/flows/Termination/TimeOff';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';
import { EmployeeCommunicationForm } from '@/src/flows/Termination/EmployeeComunicationForm';
import { TerminationDetailsForm } from '@/src/flows/Termination/TerminationDetailsForm';
import { PaidTimeOffForm } from '@/src/flows/Termination/PaidTimeOffForm';
import { AdditionalDetailsForm } from '@/src/flows/Termination/AdditionalDetailsForm';

export type TerminationRenderProps = {
  /**
   * The termination bag returned by the useTermination hook.
   * This bag contains all the methods and properties needed to handle the termination flow.
   * @see {@link useTermination}
   */
  terminationBag: ReturnType<typeof useTermination>;
  /**
   * The components used in the termination flow.
   * This includes different steps, submit button, back button and timeoff.
   * @see {@link TerminationSubmit}
   * @see {@link TimeOff}
   * @see {@link TerminationBack}
   * @see {@link EmployeeCommunicationForm}
   * @see {@link TerminationDetailsForm}
   * @see {@link PaidTimeOffForm}
   * @see {@link AdditionalDetailsForm}
   */
  components: {
    SubmitButton: typeof TerminationSubmit;
    TimeOff: typeof TimeOff;
    Back: typeof TerminationBack;
    EmployeeComunicationStep: typeof EmployeeCommunicationForm;
    TerminationDetailsStep: typeof TerminationDetailsForm;
    PaidTimeOffStep: typeof PaidTimeOffForm;
    AdditionalDetailsStep: typeof AdditionalDetailsForm;
  };
};

type TerminationFlowProps = {
  employmentId: string;
  render: ({
    terminationBag,
    components,
  }: TerminationRenderProps) => React.ReactNode;
  options?: {
    jsfModify?: JSFModify;
  };
};

export const TerminationFlow = ({
  employmentId,
  render,
  options,
}: TerminationFlowProps) => {
  const formId = useId();
  const terminationBag = useTermination({ employmentId, options });

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
          TimeOff: TimeOff,
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

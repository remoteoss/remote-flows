import { TerminationContext } from '@/src/flows/Termination/context';
import React, { useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { TimeOff } from '@/src/flows/Termination/TimeOff';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';

export type RenderProps = {
  /**
   * The termination bag returned by the useTermination hook.
   * This bag contains all the methods and properties needed to handle the termination flow.
   * @see {@link useTermination}
   */
  terminationBag: ReturnType<typeof useTermination>;
  /**
   * The components used in the contract amendment flow.
   * This includes the form, submit button, and confirmation form.
   * @see {@link TerminationForm}
   * @see {@link TerminationSubmit}
   * @see {@link TimeOff}
   * @see {@link TerminationBack}
   */
  components: {
    Form: typeof TerminationForm;
    SubmitButton: typeof TerminationSubmit;
    TimeOff: typeof TimeOff;
    Back: typeof TerminationBack;
  };
};

type TerminationFlowProps = {
  employmentId: string;
  render: ({ terminationBag, components }: RenderProps) => React.ReactNode;
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
          Form: TerminationForm,
          SubmitButton: TerminationSubmit,
          TimeOff: TimeOff,
          Back: TerminationBack,
        },
      })}
    </TerminationContext.Provider>
  );
};

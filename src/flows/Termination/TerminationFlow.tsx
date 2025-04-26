import { TerminationContext } from '@/src/flows/Termination/context';
import React, { useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';
import { TimeOff } from '@/src/flows/Termination/TimeOff';
import { TerminationBack } from '@/src/flows/Termination/TerminationBack';

export type RenderProps = {
  terminationBag: ReturnType<typeof useTermination>;
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

import { TerminationContext } from '@/src/flows/Termination/context';
import React, { PropsWithChildren, useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';
import { TerminationSubmit } from '@/src/flows/Termination/TerminationSubmit';

type RenderProps = {
  /**
   * The termination amendment bag returned by the useTermination hook.
   * This bag contains all the methods and properties needed to handle the termination flow.
   * @see {@link useTermination}
   */
  terminationBag: ReturnType<typeof useTermination>;
  /**
   * The components used in the termination flow.
   * This includes the form, submit button.
   * @see {@link TerminationForm}
   * @see {@link TerminationSubmit}
   */
  components: {
    Form: typeof TerminationForm;
    SubmitButton: typeof TerminationSubmit;
  };
};

function TerminationFlowProvider({
  render,
  terminationBag,
}: PropsWithChildren<{
  render: ({ terminationBag }: RenderProps) => React.ReactNode;
  terminationBag: ReturnType<typeof useTermination>;
}>) {
  const formId = useId();

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
        },
      })}
    </TerminationContext.Provider>
  );
}

type TerminationFlowProps = {
  employmentId: string;
  render: ({
    terminationBag,
  }: {
    terminationBag: ReturnType<typeof useTermination>;
  }) => React.ReactNode;
  options?: {
    jsfModify?: JSFModify;
  };
};

export const TerminationFlow = ({
  employmentId,
  render,
  options,
}: TerminationFlowProps) => {
  const terminationBag = useTermination({ employmentId, options });

  return (
    <TerminationFlowProvider terminationBag={terminationBag} render={render} />
  );
};

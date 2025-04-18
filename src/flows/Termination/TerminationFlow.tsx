import { TerminationContext } from '@/src/flows/Termination/context';
import React, { PropsWithChildren, useId } from 'react';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';

function TerminationFlowProvider({
  render,
  terminationBag,
}: PropsWithChildren<{
  render: ({
    terminationBag,
  }: {
    terminationBag: ReturnType<typeof useTermination>;
  }) => React.ReactNode;
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
      {render({ terminationBag })}
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

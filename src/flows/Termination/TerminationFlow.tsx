import { TerminationContext } from '@/src/flows/Termination/context';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';

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
  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    terminationBag.handleValidation,
  );

  const formId = useId();
  const form = useForm({
    resolver,
    defaultValues: terminationBag.initialValues,
    shouldUnregister: true,
    mode: 'onBlur',
  });

  return (
    <TerminationContext.Provider
      value={{
        form,
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
  user: {
    name: string;
  };
  options?: {
    jsfModify?: JSFModify;
  };
};

export const TerminationFlow = ({
  employmentId,
  user,
  render,
  options,
}: TerminationFlowProps) => {
  const terminationBag = useTermination({ employmentId, user, options });

  return (
    <TerminationFlowProvider terminationBag={terminationBag} render={render} />
  );
};

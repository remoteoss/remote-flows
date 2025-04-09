import { TerminationContext } from '@/src/flows/Termination/context';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTermination } from '@/src/flows/Termination/hooks';
import { JSFModify } from '@/src/flows/CostCalculator/types';

function TerminationFlowProvider({
  render,
  termination,
}: PropsWithChildren<{
  render: () => React.ReactNode;
  termination: ReturnType<typeof useTermination>;
}>) {
  const resolver = function (values: any) {
    //const { formErrors } = contractAmendment.handleValidation(values);
    /*  if (Object.keys(formErrors).length > 0) {
      const errors = Object.entries(formErrors).reduce<
        Record<string, ValidationField>
      >((result, [key, value]) => {
        result[key] = {
          message: String(value),
          type: 'validation',
        };
        return result;
      }, {});
      return {
        values: {},
        errors,
      };
    }

    return {
      values,
      errors: {},
    }; */
  };

  const formId = useId();
  const form = useForm({
    /* resolver, */
    /*  defaultValues: contractAmendment.initialValues, */
    defaultValues: {},
    shouldUnregister: true,
    mode: 'onBlur',
  });

  return (
    <TerminationContext.Provider
      value={{
        form,
        formId: formId,
        termination,
      }}
    >
      {render({ termination })}
    </TerminationContext.Provider>
  );
}

export const TerminationFlow = ({
  render,
  options,
}: {
  render: () => React.ReactNode;
  options?: {
    jsfModify?: JSFModify;
  };
}) => {
  const termination = useTermination({ options });
  if (termination.isLoading) {
    return <>{render({ termination })}</>;
  }

  return <TerminationFlowProvider termination={termination} render={render} />;
};

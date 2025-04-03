import { TerminationContext } from '@/src/flows/Termination/context';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';

function TerminationFlowProvider({
  render,
}: PropsWithChildren<{
  render: () => React.ReactNode;
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
      }}
    >
      {render()}
    </TerminationContext.Provider>
  );
}

export const TerminationFlow = ({
  render,
}: {
  render: () => React.ReactNode;
}) => {
  return <TerminationFlowProvider render={render} />;
};

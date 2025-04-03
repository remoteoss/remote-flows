/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { ContractAmendmentContext } from './context';
import { useContractAmendment } from './hooks';

interface ValidationField {
  message: string;
  type: string;
}

function ContractAmendmentProvider({
  render,
  contractAmendment,
}: PropsWithChildren<{
  contractAmendment: ReturnType<typeof useContractAmendment>;
  render: ({
    contractAmendment,
  }: {
    contractAmendment: ReturnType<typeof useContractAmendment>;
  }) => React.ReactNode;
}>) {
  const resolver = function (values: any) {
    const { formErrors } = contractAmendment.handleValidation(values);

    if (Object.keys(formErrors).length > 0) {
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
    };
  };

  const formId = useId();
  const form = useForm({
    resolver,
    defaultValues: contractAmendment.initialValues,
    shouldUnregister: true,
    mode: 'onBlur',
  });

  return (
    <ContractAmendmentContext.Provider
      value={{
        form,
        formId: formId,
        contractAmendment,
      }}
    >
      {render({ contractAmendment })}
    </ContractAmendmentContext.Provider>
  );
}

export function ContractAmendmentFlow({
  employmentId,
  countryCode,
  render,
}: any) {
  const contractAmendment = useContractAmendment({
    employmentId,
    countryCode,
  });

  if (contractAmendment.isLoading) {
    return <>{render({ contractAmendment })}</>;
  }

  return (
    <ContractAmendmentProvider
      contractAmendment={contractAmendment}
      render={render}
    />
  );
}

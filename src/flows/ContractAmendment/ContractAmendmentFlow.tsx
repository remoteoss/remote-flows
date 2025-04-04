import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { ContractAmendmentContext } from './context';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

function ContractAmendmentProvider({
  render,
  contractAmendmentBag,
}: PropsWithChildren<{
  contractAmendmentBag: ReturnType<typeof useContractAmendment>;
  render: ({
    contractAmendmentBag,
  }: {
    contractAmendmentBag: ReturnType<typeof useContractAmendment>;
  }) => React.ReactNode;
}>) {
  const formId = useId();
  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    contractAmendmentBag.handleValidation,
  );
  const form = useForm({
    resolver,
    defaultValues: contractAmendmentBag.initialValues,
    shouldUnregister: true,
    mode: 'onBlur',
  });

  return (
    <ContractAmendmentContext.Provider
      value={{
        form,
        formId: formId,
        contractAmendmentBag,
      }}
    >
      {render({ contractAmendmentBag })}
    </ContractAmendmentContext.Provider>
  );
}

type ContractAmendmentFlowProps = ContractAmendmentParams & {
  render: ({
    contractAmendmentBag,
  }: {
    contractAmendmentBag: ReturnType<typeof useContractAmendment>;
  }) => React.ReactNode;
};

export function ContractAmendmentFlow({
  employmentId,
  countryCode,
  options,
  render,
}: ContractAmendmentFlowProps) {
  const contractAmendmentBag = useContractAmendment({
    employmentId,
    countryCode,
    options,
  });

  if (contractAmendmentBag.isLoading) {
    return <>{render({ contractAmendmentBag })}</>;
  }

  return (
    <ContractAmendmentProvider
      contractAmendmentBag={contractAmendmentBag}
      render={render}
    />
  );
}

import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { ContractAmendmentContext } from './context';
import { ContractAmendmentForm } from './ContractAmendmentForm';
import { ContractAmendmentSubmit } from './ContractAmendmentSubmit';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

type TUseContractAmendment = ReturnType<typeof useContractAmendment>;
type RenderProps = {
  contractAmendmentBag: TUseContractAmendment;
  components: {
    ContractAmendmentForm: typeof ContractAmendmentForm;
    ContractAmendmentSubmit: typeof ContractAmendmentSubmit;
  };
};

type ContractAmendmentProviderProps = PropsWithChildren<{
  contractAmendmentBag: TUseContractAmendment;
  render: ({ contractAmendmentBag }: RenderProps) => React.ReactNode;
}>;

function ContractAmendmentProvider({
  render,
  contractAmendmentBag,
}: ContractAmendmentProviderProps) {
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
      {render({
        contractAmendmentBag,
        components: { ContractAmendmentForm, ContractAmendmentSubmit },
      })}
    </ContractAmendmentContext.Provider>
  );
}

type ContractAmendmentFlowProps = ContractAmendmentParams & {
  render: ({
    contractAmendmentBag,
    components,
  }: RenderProps) => React.ReactNode;
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
    return (
      <>
        {render({
          contractAmendmentBag,
          components: { ContractAmendmentForm, ContractAmendmentSubmit },
        })}
      </>
    );
  }

  return (
    <ContractAmendmentProvider
      contractAmendmentBag={contractAmendmentBag}
      render={render}
    />
  );
}

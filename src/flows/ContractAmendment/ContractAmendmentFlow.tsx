import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';
import { ContractAmendmentContext } from './context';
import { ContractAmendmentConfirmationForm } from './ContractAmendmentConfirmationForm';
import { ContractAmendmentForm } from './ContractAmendmentForm';
import { ContractAmendmentSubmit } from './ContractAmendmentSubmit';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

type TUseContractAmendment = ReturnType<typeof useContractAmendment>;

export type RenderProps = {
  /**
   * The contract amendment bag returned by the useContractAmendment hook.
   * This bag contains all the methods and properties needed to handle the contract amendment flow.
   * @see {@link useContractAmendment}
   */
  contractAmendmentBag: TUseContractAmendment;
  /**
   * The components used in the contract amendment flow.
   * This includes the form, submit button, and confirmation form.
   * @see {@link ContractAmendmentForm}
   * @see {@link ContractAmendmentSubmit}
   * @see {@link ContractAmendmentConfirmationForm}
   */
  components: {
    Form: typeof ContractAmendmentForm;
    SubmitButton: typeof ContractAmendmentSubmit;
    ConfirmationForm: typeof ContractAmendmentConfirmationForm;
  };
};

type ContractAmendmentProviderProps = PropsWithChildren<{
  contractAmendmentBag: TUseContractAmendment;
  render: (props: RenderProps) => React.ReactNode;
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
        components: {
          Form: ContractAmendmentForm,
          SubmitButton: ContractAmendmentSubmit,
          ConfirmationForm: ContractAmendmentConfirmationForm,
        },
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

  return (
    <ContractAmendmentProvider
      contractAmendmentBag={contractAmendmentBag}
      render={render}
    />
  );
}

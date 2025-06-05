import { useId } from 'react';
import { ContractAmendmentContext } from './context';
import { ContractAmendmentBack } from './ContractAmendmentBack';
import { ContractAmendmentConfirmationForm } from './ContractAmendmentConfirmationForm';
import { ContractAmendmentForm } from './ContractAmendmentForm';
import { ContractAmendmentSubmit } from './ContractAmendmentSubmit';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

type TUseContractAmendment = ReturnType<typeof useContractAmendment>;

export type ContractAmendmentRenderProps = {
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
    BackButton: typeof ContractAmendmentBack;
  };
};

type ContractAmendmentFlowProps = ContractAmendmentParams & {
  render: ({
    contractAmendmentBag,
    components,
  }: ContractAmendmentRenderProps) => React.ReactNode;
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
  const formId = useId();

  return (
    <ContractAmendmentContext.Provider
      value={{
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
          BackButton: ContractAmendmentBack,
        },
      })}
    </ContractAmendmentContext.Provider>
  );
}

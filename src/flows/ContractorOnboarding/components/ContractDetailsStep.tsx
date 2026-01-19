import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
} from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  ContractorOnboardingContractDetailsFormPayload,
  ContractorOnboardingContractDetailsResponse,
} from '@/src/flows/ContractorOnboarding/types';
import { StatementOfWorkDisclaimer } from '@/src/flows/ContractorOnboarding/components/StatementOfWorkDisclaimer';
import { isCMOrCMPlus } from '@/src/flows/ContractorOnboarding/utils';
import { handleStepError } from '@/src/lib/utils';

type ContractDetailsStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (
    payload: ContractorOnboardingContractDetailsFormPayload,
  ) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (
    data: ContractorOnboardingContractDetailsResponse,
  ) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

export function ContractDetailsStep({
  onSubmit,
  onSuccess,
  onError,
}: ContractDetailsStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as $TSFixMe);
      const response = await contractorOnboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as $TSFixMe); // TODO: add type
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.contract_details,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.contract_details ||
    contractorOnboardingBag.initialValues.contract_details;

  const subscription =
    contractorOnboardingBag.stepState.values?.pricing_plan?.subscription;
  const shouldShowDisclaimer = isCMOrCMPlus(subscription);

  return (
    <div className='space-y-4'>
      <ContractorOnboardingForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
      />
      {shouldShowDisclaimer && (
        <StatementOfWorkDisclaimer subscription={subscription} />
      )}
    </div>
  );
}

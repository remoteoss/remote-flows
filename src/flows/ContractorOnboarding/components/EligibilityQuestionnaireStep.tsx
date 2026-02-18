import { useState } from 'react';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';
import {
  EligibilityQuestionnaireFormPayload,
  EligibilityQuestionnaireResponse,
} from '@/src/flows/ContractorOnboarding/types';
import { Drawer } from '@/src/components/shared/drawer/Drawer';

type EligibilityQuestionnaireStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (
    payload: EligibilityQuestionnaireFormPayload,
  ) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: EligibilityQuestionnaireResponse) => void | Promise<void>;
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

export function EligibilityQuestionnaireStep({
  onSubmit,
  onSuccess,
  onError,
}: EligibilityQuestionnaireStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as EligibilityQuestionnaireFormPayload);
      const response = await contractorOnboardingBag.onSubmit(payload);

      if (
        response &&
        'data' in response &&
        response.data &&
        'is_blocking' in response.data &&
        response?.data?.is_blocking
      ) {
        setOpenDrawer(true);
        return;
      }

      if (response?.data) {
        await onSuccess?.(response?.data as EligibilityQuestionnaireResponse);
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.eligibility_questionnaire,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.eligibility_questionnaire ||
    contractorOnboardingBag.initialValues.eligibility_questionnaire;

  return (
    <>
      <ContractorOnboardingForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
      />
      {openDrawer && (
        <Drawer
          title='Eligibility Questionnaire Blocked'
          open={openDrawer}
          onOpenChange={setOpenDrawer}
          trigger={<></>}
          direction='bottom'
        >
          <div>
            <p>
              The eligibility questionnaire has been blocked. Please contact
              support.
            </p>
          </div>
        </Drawer>
      )}
    </>
  );
}

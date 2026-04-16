import { useEffect } from 'react';
import { $TSFixMe, JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { Components } from '@/src/types/remoteFlows';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import {
  EligibilityQuestionnaireFormPayload,
  PricingPlanFormPayload,
  ContractorOnboardingContractDetailsFormPayload,
} from '@/src/flows/ContractorOnboarding/types';
import { normalizeFieldErrors } from '@/src/lib/mutations';
import { useJsonSchemaForm } from '@/src/components/form/useJSONSchemaForm';

type ContractorOnboardingFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | PricingPlanFormPayload
      | ContractorOnboardingContractDetailsFormPayload
      | EligibilityQuestionnaireFormPayload,
  ) => Promise<void>;
  components?: Components;
  fields?: JSFFields;
  defaultValues: Record<string, unknown>;
};

export function ContractorOnboardingForm({
  defaultValues,
  onSubmit,
  components,
}: ContractorOnboardingFormProps) {
  const { formId, contractorOnboardingBag, formRef } =
    useContractorOnboardingContext();

  const form = useJsonSchemaForm({
    handleValidation: contractorOnboardingBag.handleValidation,
    defaultValues,
    checkFieldUpdates: contractorOnboardingBag.checkFieldUpdates,
  });

  // Register the form's setValue method with the context so other components can access it
  useEffect(() => {
    if (formRef?.setValue) {
      formRef.setValue.current = form.setValue;
    }
  }, [form.setValue, formRef]);

  useEffect(() => {
    // When the employmentId is set,
    // we need to run the checkFieldUpdates to update fieldValues in useStepState
    if (contractorOnboardingBag.employmentId) {
      contractorOnboardingBag?.checkFieldUpdates(form.getValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (
    values: Record<string, unknown>,
    event?: React.BaseSyntheticEvent,
  ) => {
    const nativeEvent = event?.nativeEvent as $TSFixMe;

    if (nativeEvent?.isDraftSubmission) {
      const { onSuccess, onError } = nativeEvent.draftCallbacks;

      try {
        await contractorOnboardingBag.onSubmit(values);
        onSuccess?.();
      } catch (error: $TSFixMe) {
        const currentStepName =
          contractorOnboardingBag.stepState.currentStep.name;
        const currentStepFields =
          contractorOnboardingBag.meta?.fields?.[
            currentStepName as keyof typeof contractorOnboardingBag.meta.fields
          ];

        const normalizedFieldErrors = normalizeFieldErrors(
          error?.fieldErrors || [],
          currentStepFields,
        );
        onError?.({
          error: error?.error || (error as Error),
          rawError: error?.rawError || (error as Record<string, unknown>),
          fieldErrors: normalizedFieldErrors,
        });
      }
    } else {
      await onSubmit(values as $TSFixMe);
    }
  };

  return (
    <Form
      {...form}
      key={`form-${contractorOnboardingBag.stepState.currentStep.name}`}
    >
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__OnboardingForm'
      >
        <JSONSchemaFormFields
          components={components}
          fields={contractorOnboardingBag.fields}
          fieldsets={contractorOnboardingBag.meta.fieldsets}
          fieldValues={contractorOnboardingBag.fieldValues}
        />
      </form>
    </Form>
  );
}

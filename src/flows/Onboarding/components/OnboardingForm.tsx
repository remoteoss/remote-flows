import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { JOB_TITLE_ELIGIBILITY_RESULT_FIELD } from '@/src/flows/Onboarding/utils';
import { JSFFields } from '@/src/types/remoteFlows';
import {
  BasicInformationFormPayload,
  BenefitsFormPayload,
  ContractDetailsFormPayload,
  EngagementAgreementDetailsFormPayload,
} from '@/src/flows/Onboarding/types';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { normalizeFieldErrors } from '@/src/lib/mutations';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';

type OnboardingFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | BenefitsFormPayload
      | ContractDetailsFormPayload
      | EngagementAgreementDetailsFormPayload,
  ) => Promise<void>;
  components?: Components;
  fields?: JSFFields;
  defaultValues: Record<string, unknown>;
};

export function OnboardingForm({
  defaultValues,
  onSubmit,
  components,
}: OnboardingFormProps) {
  const { formId, onboardingBag } = useOnboardingContext();

  const form = useJSONSchemaForm({
    handleValidation: onboardingBag.handleValidation,
    defaultValues: defaultValues,
    checkFieldUpdates: onboardingBag.checkFieldUpdates,
  });

  useEffect(() => {
    // When the employmentId is set,
    // we need to run the checkFieldUpdates to update fieldValues in useStepState
    if (onboardingBag.employmentId) {
      onboardingBag?.checkFieldUpdates(form.getValues());
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncJobTitleEligibility = async (values: Record<string, unknown>) => {
    const eligibilityValues =
      await onboardingBag.checkJobTitleEligibility(values);
    console.log('eligibilityValues', eligibilityValues);
    Object.entries(eligibilityValues ?? {}).forEach(([name, value]) =>
      form.setValue(name, value),
    );
    return eligibilityValues;
  };

  const handleSubmit = async (
    values: Record<string, unknown>,
    event?: React.BaseSyntheticEvent,
  ) => {
    const nativeEvent = event?.nativeEvent as $TSFixMe;

    if (nativeEvent?.isDraftSubmission) {
      // Handle draft submission
      const { onSuccess, onError } = nativeEvent.draftCallbacks;

      try {
        // Submit the form
        const response = await onboardingBag.onSubmit(values);

        if (response?.data) {
          onSuccess?.();
        } else if (response?.error) {
          const currentStepName = onboardingBag.stepState.currentStep.name;

          // Get the appropriate fields based on current step
          const currentStepFields =
            onboardingBag.meta?.fields?.[
              currentStepName as keyof typeof onboardingBag.meta.fields
            ];

          const normalizedFieldErrors = normalizeFieldErrors(
            response?.fieldErrors || [],
            currentStepFields,
          );
          onError?.({
            error: response.error,
            rawError: response.rawError,
            fieldErrors: normalizedFieldErrors,
          });
        }
      } catch (error) {
        onError?.({
          error: error as Error,
          rawError: error as Record<string, unknown>,
          fieldErrors: [],
        });
      }
    } else {
      // Handle normal form submission
      const eligibilityValues = await syncJobTitleEligibility(values);
      const hasVerdictChanged =
        eligibilityValues &&
        (values[JOB_TITLE_ELIGIBILITY_RESULT_FIELD] ?? null) !==
          eligibilityValues[JOB_TITLE_ELIGIBILITY_RESULT_FIELD];
      if (hasVerdictChanged && !(await form.trigger())) {
        return;
      }
      await onSubmit({ ...values, ...eligibilityValues });
    }
  };

  return (
    <Form {...form} key={`form-${onboardingBag.stepState.currentStep.name}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__OnboardingForm'
        onBlur={() => syncJobTitleEligibility(form.getValues())}
      >
        <JSONSchemaFormFields
          components={components}
          fields={onboardingBag.fields}
          fieldsets={onboardingBag.meta.fieldsets}
          fieldValues={onboardingBag.fieldValues}
        />
      </form>
    </Form>
  );
}

import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { JSFFields } from '@/src/types/remoteFlows';
import {
  BasicInformationFormPayload,
  BenefitsFormPayload,
  ContractDetailsFormPayload,
} from '@/src/flows/Onboarding/types';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { normalizeFieldErrors } from '@/src/lib/mutations';

type OnboardingFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | BenefitsFormPayload
      | ContractDetailsFormPayload,
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

  const resolver = useJsonSchemasValidationFormResolver(
    onboardingBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    // When the employmentId is set,
    // we need to run the checkFieldUpdates to update fieldValues in useStepState
    if (onboardingBag.employmentId) {
      onboardingBag?.checkFieldUpdates(form.getValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isAnyFieldDirty = Object.keys(values).some(
        (key) =>
          values[key as keyof unknown] !== defaultValues[key as keyof unknown],
      );
      if (isAnyFieldDirty) {
        onboardingBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (
    values: Record<string, unknown>,
    event?: React.BaseSyntheticEvent,
  ) => {
    const nativeEvent = event?.nativeEvent as $TSFixMe;

    if (nativeEvent?.isDraftSubmission) {
      // Handle draft submission
      const { onSuccess, onError } = nativeEvent.draftCallbacks;

      try {
        // Trigger validation
        const isValid = await form.trigger();
        if (!isValid) {
          return; // Don't submit if validation fails
        }

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
      await onSubmit(values);
    }
  };

  return (
    <Form {...form} key={`form-${onboardingBag.stepState.currentStep.name}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__OnboardingForm'
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

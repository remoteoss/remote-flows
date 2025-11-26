import { Fields } from '@remoteoss/json-schema-form-old';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { Components } from '@/src/types/remoteFlows';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useEffect } from 'react';
import { PricingPlanFormPayload } from '@/src/flows/ContractorOnboarding/types';
import { ContractorOnboardingContractDetailsFormPayload } from '@/src/flows/ContractorOnboarding/types';

type ContractorOnboardingFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | PricingPlanFormPayload
      | ContractorOnboardingContractDetailsFormPayload,
  ) => void;
  components?: Components;
  fields?: Fields;
  defaultValues: Record<string, unknown>;
};

export function ContractorOnboardingForm({
  defaultValues,
  onSubmit,
  components,
}: ContractorOnboardingFormProps) {
  const { formId, contractorOnboardingBag } = useContractorOnboardingContext();

  const resolver = useJsonSchemasValidationFormResolver(
    contractorOnboardingBag.handleValidation,
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
    if (contractorOnboardingBag.employmentId) {
      contractorOnboardingBag?.checkFieldUpdates(form.getValues());
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
        contractorOnboardingBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    onSubmit(values);
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

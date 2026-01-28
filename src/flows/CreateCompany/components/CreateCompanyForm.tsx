import { JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { Components } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { useEffect } from 'react';
import { PricingPlanFormPayload } from '@/src/flows/CreateCompany/types';
import { CreateCompanyContractDetailsFormPayload } from '@/src/flows/CreateCompany/types';

type CreateCompanyFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | PricingPlanFormPayload
      | CreateCompanyContractDetailsFormPayload,
  ) => Promise<void>;
  components?: Components;
  fields?: JSFFields;
  defaultValues: Record<string, unknown>;
};

export function CreateCompanyForm({
  defaultValues,
  onSubmit,
  components,
}: CreateCompanyFormProps) {
  const { formId, contractorOnboardingBag, formRef } =
    useCreateCompanyContext();

  const resolver = useJsonSchemasValidationFormResolver(
    contractorOnboardingBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
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
    await onSubmit(values);
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

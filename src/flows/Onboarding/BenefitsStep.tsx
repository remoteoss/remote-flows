import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { Components } from '@/src/types/remoteFlows';
import { Form } from '@/src/components/ui/form';
import { useOnboardingContext } from './context';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';

type BenefitsStepProps = {
  components: Components;
  /**
   * Callback function to be called when the benefits form is submitted.
   * It can be used to perform any additional validation or processing before
   * the onboarding moves to the last step.
   * @param values
   * @returns
   */
  onSubmit?: (values: FieldValues) => Promise<void>;
  /**
   * Callback function to be called when the submitting benefits form fails.
   * @param error
   * @returns
   */
  onError?: (error: unknown) => void;
  /**
   * Callback function to be called when benefits form is successfully submitted.
   * This function is called after the submitting benefits form is submitted.
   * @param data
   * @returns
   */
  onSuccess?: (data: unknown) => void;
};

export function BenefitsStep({ components }: BenefitsStepProps) {
  const { formId } = useOnboardingContext();

  const form = useForm({
    shouldUnregister: false,
    mode: 'onBlur',
  });

  return (
    <Form {...form}>
      <form id={formId} className="space-y-4 RemoteFlows__OnboardingForm">
        <JSONSchemaFormFields fields={[]} components={components} />
      </form>
    </Form>
  );
}

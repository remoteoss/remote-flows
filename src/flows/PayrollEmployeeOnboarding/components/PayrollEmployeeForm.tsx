import type { UseFormReturn } from 'react-hook-form';
import { Form } from '@/src/components/ui/form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import type { $TSFixMe, JSFFieldset } from '@/src/types/remoteFlows';

type PayrollEmployeeFormProps = {
  onSubmit: (
    values: Record<string, unknown>,
    form: UseFormReturn<$TSFixMe>,
  ) => Promise<void>;
  defaultValues?: Record<string, unknown>;
};

export function PayrollEmployeeForm({
  onSubmit,
  defaultValues,
}: PayrollEmployeeFormProps) {
  const { formId, employeeBag } = usePayrollEmployeeOnboardingContext();

  const form = useJSONSchemaForm({
    handleValidation: employeeBag.handleValidation,
    defaultValues: defaultValues ?? {},
    checkFieldUpdates: employeeBag.setFieldValues,
  });

  return (
    <Form {...form} key={`form-${employeeBag.stepState.currentStep.name}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
        className='space-y-4 RemoteFlows__PayrollEmployeeForm'
      >
        <JSONSchemaFormFields
          fields={employeeBag.fields}
          fieldsets={employeeBag.meta['x-jsf-fieldsets'] as JSFFieldset}
          fieldValues={employeeBag.fieldValues}
        />
      </form>
    </Form>
  );
}

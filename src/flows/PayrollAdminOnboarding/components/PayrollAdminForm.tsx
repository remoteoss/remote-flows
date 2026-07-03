import { Form } from '@/src/components/ui/form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';

type PayrollAdminFormProps = {
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  defaultValues?: Record<string, unknown>;
};

export function PayrollAdminForm({
  onSubmit,
  defaultValues,
}: PayrollAdminFormProps) {
  const { formId, adminBag } = usePayrollAdminOnboardingContext();

  const form = useJSONSchemaForm({
    handleValidation: adminBag.handleValidation,
    defaultValues: defaultValues ?? {},
    checkFieldUpdates: adminBag.setFieldValues,
  });

  return (
    <Form {...form} key={`form-${adminBag.stepState.currentStep.name}`}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 RemoteFlows__PayrollAdminForm'
      >
        <JSONSchemaFormFields
          fields={adminBag.fields}
          fieldsets={adminBag.meta['x-jsf-fieldsets']}
          fieldValues={adminBag.fieldValues}
        />
      </form>
    </Form>
  );
}

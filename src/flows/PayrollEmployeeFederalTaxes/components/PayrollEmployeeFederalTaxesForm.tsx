import { Form } from '@/src/components/ui/form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { usePayrollEmployeeFederalTaxesContext } from '@/src/flows/PayrollEmployeeFederalTaxes/context';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import type { JSFFieldset } from '@/src/types/remoteFlows';

type PayrollEmployeeFederalTaxesFormProps = {
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  defaultValues?: Record<string, unknown>;
};

export function PayrollEmployeeFederalTaxesForm({
  onSubmit,
  defaultValues,
}: PayrollEmployeeFederalTaxesFormProps) {
  const { formId, flowBag } = usePayrollEmployeeFederalTaxesContext();

  const form = useJSONSchemaForm({
    handleValidation: flowBag.handleValidation,
    defaultValues: defaultValues ?? {},
    checkFieldUpdates: flowBag.setFieldValues,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 RemoteFlows__PayrollEmployeeFederalTaxesForm'
      >
        <JSONSchemaFormFields
          fields={flowBag.fields}
          fieldsets={flowBag.meta['x-jsf-fieldsets'] as JSFFieldset}
          fieldValues={flowBag.fieldValues}
        />
      </form>
    </Form>
  );
}

import { JSFFields } from '@/src/types/remoteFlows';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { BasicInformationFormPayload } from '@/src/flows/CreateCompany/types';
import { Components } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { useEffect } from 'react';

type CreateCompanyFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
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
  const { formId, createCompanyBag, formRef } =
    useCreateCompanyContext();

  const resolver = useJsonSchemasValidationFormResolver(
    createCompanyBag.handleValidation,
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

  const handleSubmit = async (values: Record<string, string>) => {
    console.log("SUBMITTING", values)
    await onSubmit(
      {
	company_owner_email: values.company_owner_email,
	company_owner_name: values.company_owner_name,
	country_code: values.country_code,
	desired_currency: values.desired_currency,
	name: values.name,
	phone_number: values.phone_number,
	tax_number: values.tax_number,
	tax_job_category: values.tax_job_category,
	tax_servicing_countries: [],
      });
  };

  return (
    <Form
      {...form}
      key={`form-${createCompanyBag.stepState.currentStep.name}`}
    >
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__OnboardingForm'
      >
        <JSONSchemaFormFields
          components={components}
          fields={createCompanyBag.fields}
          fieldsets={createCompanyBag.meta.fieldsets}
          fieldValues={createCompanyBag.fieldValues}
        />
      </form>
    </Form>
  );
}

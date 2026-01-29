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
	company_owner_name: values.company_owner_email,
	country_code: values.company_owner_email,
	desired_currency: values.company_owner_email,
	name: values.company_owner_email,
	phone_number: values.company_owner_email,
	tax_number: values.company_owner_email,
	tax_job_category: values.company_owner_email,
	tax_servicing_countries: [values.company_owner_email],
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

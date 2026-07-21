import { FormProvider } from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJsonSchemaPlaygroundContext } from './context';

export interface JsonSchemaPlaygroundFormProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  className?: string;
}

export const JsonSchemaPlaygroundForm = ({
  onSubmit,
  className,
}: JsonSchemaPlaygroundFormProps) => {
  const { form, formId, playgroundBag } = useJsonSchemaPlaygroundContext();

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    const parsedValues = await playgroundBag.parseFormValues(values);
    await playgroundBag.handleSubmit(parsedValues);
    onSubmit?.(parsedValues);
  };

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={className}
      >
        <JSONSchemaFormFields fields={playgroundBag.fields ?? []} />
      </form>
    </FormProvider>
  );
};

import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import React, { useEffect } from 'react';
import { FieldValues } from 'react-hook-form';

export function CostCalculatorForm() {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  useEffect(() => {
    const subscription = form?.watch((values) => {
      if (form.formState.isDirty) {
        costCalculatorBag.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: FieldValues) => {
    const costCalculatorResults = await costCalculatorBag?.onSubmit(values);

    await onSubmit?.(values);
    if (costCalculatorResults.error) {
      onError?.(costCalculatorResults.error);
    } else {
      onSuccess?.(costCalculatorResults.data);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__CostCalculatorForm"
      >
        <JSONSchemaFormFields fields={costCalculatorBag?.fields ?? []} />
      </form>
    </Form>
  );
}

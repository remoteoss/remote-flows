import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';

export function RequestIdStep() {
  const { formId, timeOffBag } = useTimeOffContext();

  const form = useJSONSchemaForm({
    handleValidation: timeOffBag.handleValidation,
    checkFieldUpdates: timeOffBag.checkFieldUpdates,
    defaultValues: { timeoff_id: timeOffBag.timeOffId ?? '' },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(timeOffBag.next)}
        className='RemoteFlows__RequestIdStep'
      >
        <JSONSchemaFormFields fields={timeOffBag.fields} />
      </form>
    </Form>
  );
}

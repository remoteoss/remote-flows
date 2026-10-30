import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useTimeOffListContext } from '@/src/flows/TimeOff/context';

export function StatusFilter() {
  const { timeOffListBag } = useTimeOffListContext();

  const form = useJSONSchemaForm({
    handleValidation: timeOffListBag.handleValidation,
    checkFieldUpdates: timeOffListBag.checkFieldUpdates,
    defaultValues: { status: timeOffListBag.status },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => event.preventDefault()}
        className='RemoteFlows__StatusFilter'
      >
        <JSONSchemaFormFields fields={timeOffListBag.fields} />
      </form>
    </Form>
  );
}

import { useTerminationContext } from './context';
import {
  TerminationDetailsFormValues,
  TerminationFormValues,
} from '@/src/flows/Termination/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type TerminationDetailsFormProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: TerminationDetailsFormValues) => void | Promise<void>;
};

export function TerminationDetailsForm({
  onSubmit,
}: TerminationDetailsFormProps) {
  const { terminationBag } = useTerminationContext();
  const handleSubmit = async (values: TerminationFormValues) => {
    await onSubmit?.(
      terminationBag?.parseFormValues(values) as TerminationDetailsFormValues,
    );
    terminationBag?.next();
  };

  return <TerminationForm onSubmit={handleSubmit} />;
}

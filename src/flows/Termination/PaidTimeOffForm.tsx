import { useTerminationContext } from './context';
import {
  PaidTimeOffFormValues,
  TerminationFormValues,
} from '@/src/flows/Termination/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type PaidTimeOffFormProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: PaidTimeOffFormValues) => void | Promise<void>;
};

export function PaidTimeOffForm({ onSubmit }: PaidTimeOffFormProps) {
  const { terminationBag } = useTerminationContext();
  const handleSubmit = async (values: TerminationFormValues) => {
    const parsedValues = await terminationBag?.parseFormValues(values);
    await onSubmit?.(parsedValues as PaidTimeOffFormValues);
    terminationBag?.next();
  };

  return <TerminationForm onSubmit={handleSubmit} />;
}

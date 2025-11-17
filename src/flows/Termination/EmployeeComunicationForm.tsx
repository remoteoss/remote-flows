import { useTerminationContext } from './context';
import {
  EmployeeCommunicationFormValues,
  TerminationFormValues,
} from '@/src/flows/Termination/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type EmployeeComunicationProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: EmployeeCommunicationFormValues) => void | Promise<void>;
};

export function EmployeeCommunicationForm({
  onSubmit,
}: EmployeeComunicationProps) {
  const { terminationBag } = useTerminationContext();
  const handleSubmit = async (values: TerminationFormValues) => {
    await onSubmit?.(
      terminationBag?.parseFormValues(
        values,
      ) as EmployeeCommunicationFormValues,
    );
    terminationBag?.next();
  };

  return <TerminationForm onSubmit={handleSubmit} />;
}

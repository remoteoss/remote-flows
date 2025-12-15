import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { OffboardingResponse } from '@/src/client';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type AdditionalDetailsFormProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: TerminationFormValues) => void | Promise<void>;
  /*
   * The function is called when the form submission has failed.
   */
  onError?: (error: Error) => void;
  /*
   * The function is called when the form submission is successful. It receives the response data as
   * an argument.
   */
  onSuccess?: (data: OffboardingResponse) => void | Promise<void>;
};

export function AdditionalDetailsForm({
  onSubmit,
  onSuccess,
  onError,
}: AdditionalDetailsFormProps) {
  const { terminationBag } = useTerminationContext();

  const handleSubmit = async (values: TerminationFormValues) => {
    const parsedValues = (await terminationBag?.parseFormValues(
      values,
      true,
    )) as TerminationFormValues;
    await onSubmit?.(parsedValues);
    const terminationResult = await terminationBag?.onSubmit(values);

    if (terminationResult?.error) {
      onError?.(terminationResult.error);
    } else {
      if (terminationResult?.data) {
        await onSuccess?.(terminationResult.data as OffboardingResponse);
      }
    }
  };

  return (
    <TerminationForm
      defaultValues={terminationBag.fieldValues}
      fields={terminationBag?.fields}
      onSubmit={handleSubmit}
    />
  );
}

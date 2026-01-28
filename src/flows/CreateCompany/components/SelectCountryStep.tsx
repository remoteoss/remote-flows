// TODO: Correct types later
import {
  SelectCountryFormPayload,
  SelectCountrySuccess,
} from '@/src/flows/Onboarding/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { CreateCompanyForm } from '@/src/flows/CreateCompany/components/CreateCompanyForm';
import { handleStepError } from '@/src/lib/utils';

type SelectCountryStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: SelectCountryFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: SelectCountrySuccess) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
};

export function SelectCountryStep({
  onSubmit,
  onSuccess,
  onError,
}: SelectCountryStepProps) {
  const { createCompanyBag } = useCreateCompanyContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.({ countryCode: payload.country });
      const response = await createCompanyBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as SelectCountrySuccess);
        createCompanyBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        createCompanyBag.meta?.fields?.select_country,
      );

      onError?.(structuredError);
    }
  };

  const initialValues =
    createCompanyBag.stepState.values?.select_country ||
    createCompanyBag.initialValues.select_country;

  return (
    <CreateCompanyForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

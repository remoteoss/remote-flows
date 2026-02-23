import {
  CompanyAddressDetailsFormPayload,
  CompanyAddressDetailsSuccess,
} from '@/src/flows/CreateCompany/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { CreateCompanyForm } from '@/src/flows/CreateCompany/components/CreateCompanyForm';
import { handleStepError } from '@/src/lib/utils';

type AddressDetailsStepProps = {
  /**
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (
    payload: CompanyAddressDetailsFormPayload,
  ) => void | Promise<void>;
  /**
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: CompanyAddressDetailsSuccess) => void | Promise<void>;
  /**
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

/**
 * AddressDetailsStep component for the second step of company creation
 * Handles address details form submission and company update
 */

export function AddressDetailsStep({
  onSubmit,
  onSuccess,
  onError,
}: AddressDetailsStepProps) {
  const { createCompanyBag } = useCreateCompanyContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.(payload);
      const response = await createCompanyBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as CompanyAddressDetailsSuccess);
        return;
      }
      if (response?.error) {
        const structuredError = handleStepError(
          response,
          createCompanyBag.meta?.fields?.address_details,
        );
        onError?.(structuredError);
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        createCompanyBag.meta?.fields?.address_details,
      );

      onError?.(structuredError);
    }
  };

  const initialValues =
    createCompanyBag.stepState.values?.address_details ||
    createCompanyBag.initialValues.address_details;

  return (
    <CreateCompanyForm defaultValues={initialValues} onSubmit={handleSubmit} />
  );
}

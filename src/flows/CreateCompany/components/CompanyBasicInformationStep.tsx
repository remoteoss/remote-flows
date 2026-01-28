import {
  CompanyBasicInfoFormPayload,
  CompanyBasicInfoSuccess,
} from '@/src/flows/CreateCompany/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { CreateCompanyForm } from '@/src/flows/CreateCompany/components/CreateCompanyForm';
import { handleStepError } from '@/src/lib/utils';

type CompanyBasicInformationStepProps = {
  /**
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: CompanyBasicInfoFormPayload) => void | Promise<void>;
  /**
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: CompanyBasicInfoSuccess) => void | Promise<void>;
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
 * CompanyBasicInformationStep component for the first step of company creation
 * Handles company basic information form submission
 */
export function CompanyBasicInformationStep({
  onSubmit,
  onSuccess,
  onError,
}: CompanyBasicInformationStepProps) {
  const { createCompanyBag } = useCreateCompanyContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.({
        countryCode: payload.country_code,
        companyOwnerEmail: payload.company_owner_email,
        companyOwnerName: payload.company_owner_name,
        desiredCurrency: payload.desired_currency,
        phoneNumber: payload.phone_number,
        taxNumber: payload.tax_number,
      });
      const response = await createCompanyBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as CompanyBasicInfoSuccess);
        createCompanyBag?.next();
        return;
      }
      if (response?.error) {
        const structuredError = handleStepError(
          response,
          createCompanyBag.meta?.fields?.company_basic_information,
        );
        onError?.(structuredError);
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        createCompanyBag.meta?.fields?.company_basic_information,
      );

      onError?.(structuredError);
    }
  };

  const initialValues =
    createCompanyBag.stepState.values?.company_basic_information ||
    createCompanyBag.initialValues.company_basic_information;

  return (
    <CreateCompanyForm defaultValues={initialValues} onSubmit={handleSubmit} />
  );
}

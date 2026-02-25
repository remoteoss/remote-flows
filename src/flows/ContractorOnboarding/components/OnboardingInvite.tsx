import { ButtonHTMLAttributes, ReactNode } from 'react';
import omit from 'lodash.omit';
import { useEmploymentInvite } from '@/src/flows/Onboarding/api';
import { FieldError, mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';

export type OnboardingInviteProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: ({
    data,
    employmentStatus,
  }: {
    data: SuccessResponse;
    employmentStatus: 'invited';
  }) => void | Promise<void>;
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: FieldError[];
  }) => void;
  onSubmit?: () => void | Promise<void>;
  render: (props: { employmentStatus: 'invited' }) => ReactNode;
} & Record<string, unknown>;

export function OnboardingInvite({
  onSubmit,
  onSuccess,
  onError,
  render,
  ...props
}: OnboardingInviteProps) {
  const { components } = useFormFields();
  const { contractorOnboardingBag } = useContractorOnboardingContext();
  const employmentInviteMutation = useEmploymentInvite();

  const { mutateAsyncOrThrow: employmentInviteMutationAsync } =
    mutationToPromise(employmentInviteMutation);

  const handleSubmit = async () => {
    try {
      await onSubmit?.();
      if (contractorOnboardingBag.employmentId) {
        const data = await employmentInviteMutationAsync({
          employment_id: contractorOnboardingBag.employmentId,
        });
        await onSuccess?.({
          data: data as SuccessResponse,
          employmentStatus: 'invited',
        });
        contractorOnboardingBag.refetchEmployment();
      }
    } catch (error: unknown) {
      const structuredError = error as {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: FieldError[];
      };
      onError?.(omit(structuredError, 'response'));
    }
  };

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      disabled={employmentInviteMutation.isPending || props.disabled}
      onClick={(evt) => {
        handleSubmit();
        props.onClick?.(evt);
      }}
    >
      {render({
        employmentStatus: 'invited',
      })}
    </CustomButton>
  );
}

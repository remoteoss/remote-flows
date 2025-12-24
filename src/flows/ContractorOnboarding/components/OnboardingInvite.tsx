import { ButtonHTMLAttributes, ReactNode } from 'react';
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

  const { mutateAsync: employmentInviteMutationAsync } = mutationToPromise(
    employmentInviteMutation,
  );

  const handleSubmit = async () => {
    try {
      await onSubmit?.();
      if (contractorOnboardingBag.employmentId) {
        const response = await employmentInviteMutationAsync({
          employment_id: contractorOnboardingBag.employmentId,
        });
        if (response.data) {
          await onSuccess?.({
            data: response.data as SuccessResponse,
            employmentStatus: 'invited',
          });
          contractorOnboardingBag.refetchEmployment();
          return;
        }
        if (response.error) {
          onError?.({
            error: response.error,
            rawError: response.rawError,
            fieldErrors: [],
          });
        }
      }
    } catch (error: unknown) {
      onError?.({
        error: error as Error,
        rawError: error as Record<string, unknown>,
        fieldErrors: [],
      });
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

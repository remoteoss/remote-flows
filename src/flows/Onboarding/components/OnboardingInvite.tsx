import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEmploymentInvite } from '@/src/flows/Onboarding/api';
import { useCreateReserveInvoice } from '@/src/flows/Onboarding/api';
import { FieldError, mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export type OnboardingInviteProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: ({
    data,
    employmentStatus,
  }: {
    data: SuccessResponse;
    employmentStatus: 'invited' | 'created_awaiting_reserve';
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
  render: (props: {
    employmentStatus: 'invited' | 'created_awaiting_reserve';
  }) => ReactNode;
} & Record<string, unknown>;

export function OnboardingInvite({
  onSubmit,
  onSuccess,
  onError,
  render,
  ...props
}: OnboardingInviteProps) {
  const { components } = useFormFields();
  const { onboardingBag, setCreditScore } = useOnboardingContext();
  const employmentInviteMutation = useEmploymentInvite();
  const useCreateReserveInvoiceMutation = useCreateReserveInvoice();

  const { mutateAsync: employmentInviteMutationAsync } = mutationToPromise(
    employmentInviteMutation,
  );

  const { mutateAsync: createReserveInvoiceMutationAsync } = mutationToPromise(
    useCreateReserveInvoiceMutation,
  );

  const handleSubmit = async () => {
    try {
      await onSubmit?.();
      if (
        onboardingBag.creditRiskStatus === 'deposit_required' &&
        onboardingBag.employmentId &&
        onboardingBag.employment?.status &&
        !onboardingBag.isEmploymentReadOnly
      ) {
        const response = await createReserveInvoiceMutationAsync({
          employment_slug: onboardingBag.employmentId,
        });
        if (response.data) {
          await onSuccess?.({
            data: response.data as SuccessResponse,
            employmentStatus: 'created_awaiting_reserve',
          });
          setCreditScore?.((prev) => ({
            ...prev,
            showReserveInvoice: true,
          }));
          onboardingBag.refetchEmployment();
          return;
        }

        if (response.error) {
          onError?.({
            error: response.error,
            rawError: response.rawError,
            fieldErrors: [],
          });
        }
      } else if (onboardingBag.employmentId) {
        const response = await employmentInviteMutationAsync({
          employment_id: onboardingBag.employmentId,
        });
        if (response.data) {
          await onSuccess?.({
            data: response.data as SuccessResponse,
            employmentStatus: 'invited',
          });
          setCreditScore?.((prev) => ({
            ...prev,
            showInviteSuccessful: true,
          }));
          onboardingBag.refetchEmployment();
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

  const isReserveFlow =
    onboardingBag.creditRiskStatus === 'deposit_required' &&
    onboardingBag.employment?.status &&
    !onboardingBag.isEmploymentReadOnly;

  const CustomButton = components?.button || ButtonDefault;
  return (
    <CustomButton
      {...props}
      disabled={
        employmentInviteMutation.isPending ||
        useCreateReserveInvoiceMutation.isPending ||
        props.disabled
      }
      onClick={(evt) => {
        handleSubmit();
        props.onClick?.(evt);
      }}
    >
      {render({
        employmentStatus: isReserveFlow
          ? 'created_awaiting_reserve'
          : 'invited',
      })}
    </CustomButton>
  );
}

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEmploymentInvite } from './api';
import { Button } from '@/src/components/ui/button';
import { useCreateReserveInvoice } from '@/src/flows/Onboarding/api';
import { mutationToPromise } from '@/src/lib/mutations';
import { Employment, SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';
import { useFormFields } from '@/src/context';

export type OnboardingInviteProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onSuccess?: ({
    data,
    employmentStatus,
  }: {
    data: SuccessResponse;
    employmentStatus: 'invited' | 'created_awaiting_reserve';
  }) => void | Promise<void>;
  onError?: (error: unknown) => void;
  onSubmit?: () => void | Promise<void>;
  render: (props: {
    employmentStatus: 'invited' | 'created_awaiting_reserve';
  }) => ReactNode;
};

const employmentStatusList: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];

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
        !employmentStatusList.includes(onboardingBag.employment?.status)
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
          onError?.(response.error);
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
          onError?.(response.error);
        }
      }
    } catch (error) {
      onError?.(error);
    }
  };

  const isReserveFlow =
    onboardingBag.creditRiskStatus === 'deposit_required' &&
    onboardingBag.employment?.status &&
    !employmentStatusList.includes(onboardingBag.employment.status);

  console.log({
    isReserveFlow,
    credit: onboardingBag.creditRiskStatus,
    status: onboardingBag.employment?.status,
  });

  const CustomButton = components?.button;
  if (CustomButton) {
    console.log('rendering button');
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

  return (
    <Button
      {...props}
      disabled={
        employmentInviteMutation.isPending ||
        useCreateReserveInvoiceMutation.isPending ||
        props.disabled
      }
      onClick={() => {
        handleSubmit();
      }}
    >
      {render({
        employmentStatus: isReserveFlow
          ? 'created_awaiting_reserve'
          : 'invited',
      })}
    </Button>
  );
}

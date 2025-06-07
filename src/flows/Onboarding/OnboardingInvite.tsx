import { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { useEmploymentInvite } from './api';
import { Button } from '@/src/components/ui/button';
import { useCreateReserveInvoice } from '@/src/flows/Onboarding/api';
import { mutationToPromise } from '@/src/lib/mutations';
import { Employment, SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';
import { CreditRiskStatus } from '@/src/flows/Onboarding/types';

export type OnboardingInviteProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    onSuccess?: (
      data: SuccessResponse,
      status: 'invited' | 'created_awaiting_reserve',
    ) => void | Promise<void>;
    onError?: (error: unknown) => void;
    onSubmit?: () => void | Promise<void>;
  }
>;

const FINAL_EMPLOYMENT_STATUSES: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];

const getLabel = ({
  children,
  creditRiskStatus,
  employmentStatus,
}: {
  children: ReactNode;
  creditRiskStatus?: CreditRiskStatus;
  employmentStatus?: Employment['status'];
}) => {
  if (children) {
    return children;
  }
  if (
    creditRiskStatus === 'deposit_required' &&
    employmentStatus &&
    !FINAL_EMPLOYMENT_STATUSES.includes(employmentStatus)
  ) {
    return 'Create Reserve';
  }

  return 'Invite Employee';
};

export function OnboardingInvite({
  onSubmit,
  onSuccess,
  onError,
  ...props
}: OnboardingInviteProps) {
  const { onboardingBag } = useOnboardingContext();
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
        !FINAL_EMPLOYMENT_STATUSES.includes(onboardingBag.employment?.status)
      ) {
        const response = await createReserveInvoiceMutationAsync({
          employment_slug: onboardingBag.employmentId,
        });
        if (response.data) {
          await onSuccess?.(
            response.data as SuccessResponse,
            'created_awaiting_reserve',
          );
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
          await onSuccess?.(response.data as SuccessResponse, 'invited');
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

  const label = getLabel({
    children: props.children,
    creditRiskStatus: onboardingBag.creditRiskStatus,
    employmentStatus: onboardingBag.employment?.status,
  });

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
      {label}
    </Button>
  );
}

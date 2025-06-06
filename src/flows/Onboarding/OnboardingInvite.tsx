import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEmploymentInvite } from './api';
import { Button } from '@/src/components/ui/button';
import { useCreateReserveInvoice } from '@/src/flows/Onboarding/api';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';

export type OnboardingInviteProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    onSuccess?: (data: SuccessResponse) => void | Promise<void>;
    onError?: (error: unknown) => void;
    onSubmit?: () => void | Promise<void>;
  }
>;

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
        onboardingBag.employmentId
      ) {
        const response = await createReserveInvoiceMutationAsync({
          employment_slug: onboardingBag.employmentId,
        });
        if (response.data) {
          await onSuccess?.(response.data as SuccessResponse);
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
          await onSuccess?.(response.data as SuccessResponse);
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

  return (
    <Button
      {...props}
      onClick={() => {
        handleSubmit();
      }}
    >
      {props.children === undefined
        ? onboardingBag.creditRiskStatus === 'deposit_required'
          ? 'Create Reserve'
          : 'Invite Employee'
        : props.children}
    </Button>
  );
}

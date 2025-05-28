import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEmploymentInvite, useMagicLink } from './api';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';
import { $TSFixMe } from '@remoteoss/json-schema-form';

type OnboardingInviteProps = PropsWithChildren<
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

  const { mutateAsync: employmentInviteMutationAsync } = mutationToPromise(
    employmentInviteMutation,
  );
  const magicLinkMutation = useMagicLink();

  const { mutateAsync: createMagicLinkMutation } =
    mutationToPromise(magicLinkMutation);

  const handleSubmit = async () => {
    try {
      await onSubmit?.();

      if (onboardingBag.creditRiskStatus === 'deposit_required') {
        const response = await createMagicLinkMutation({
          user_id: onboardingBag.owner_id as string,
          path: '/dashboard/billing',
        });
        if (response.data) {
          await onSuccess?.(response.data as $TSFixMe);
        }

        if (response.data?.error) {
          onError?.(response.data.error as Error);
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

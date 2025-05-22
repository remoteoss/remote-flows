import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEmploymentInvite } from './hooks';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';

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

  const handleSubmit = async () => {
    try {
      await onSubmit?.();

      if (!onboardingBag.employmentId) {
        throw new Error('Employment ID is required');
      }

      const response = await employmentInviteMutationAsync({
        employment_id: onboardingBag.employmentId,
      });
      if (response.data) {
        onSuccess?.(response.data as SuccessResponse);
        return;
      }
      if (response.error) {
        onError?.(response.error);
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
      {props.children}
    </Button>
  );
}

import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEmploymentInvite } from './hooks';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';

type OnboardingInviteProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    employmentId: string;
    onSuccess?: (data: SuccessResponse) => void;
    onError?: (error: unknown) => void;
    onSubmit?: () => void;
  }
>;

export function OnboardingInvite({
  employmentId,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: OnboardingInviteProps) {
  const employmentInviteMutation = useEmploymentInvite();

  const { mutateAsync: employmentInviteMutationAsync } = mutationToPromise(
    employmentInviteMutation,
  );

  const handleSubmit = async () => {
    try {
      await onSubmit?.();
      const response = await employmentInviteMutationAsync({
        employment_id: employmentId,
      });
      if (response.data?.data) {
        onSuccess?.(response.data.data);
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

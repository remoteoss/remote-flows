import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCreateReserve } from './hooks';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';

type OnboardingCreateReserveProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    onSuccess?: (data: SuccessResponse) => void | Promise<void>;
    onError?: (error: unknown) => void;
    onSubmit?: () => void | Promise<void>;
  }
>;

export function OnboardingCreateReserve({
  onSubmit,
  onSuccess,
  onError,
  ...props
}: OnboardingCreateReserveProps) {
  const { onboardingBag } = useOnboardingContext();
  const createReserveMutation = useCreateReserve();

  const { mutateAsync: createReserveMutationAsync } = mutationToPromise(
    createReserveMutation,
  );

  const handleSubmit = async () => {
    try {
      await onSubmit?.();

      if (!onboardingBag.employmentId) {
        throw new Error('Employment ID is required');
      }

      const response = await createReserveMutationAsync({
        employment_id: onboardingBag.employmentId,
      });
      if (response.data) {
        await onSuccess?.(response.data as SuccessResponse);
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

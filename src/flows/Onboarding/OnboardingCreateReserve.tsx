import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCreateReserve } from './api';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useOnboardingContext } from './context';
import { $TSFixMe } from '@remoteoss/json-schema-form';

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
      if (!onboardingBag.employmentId) {
        throw new Error('Employment ID is required');
      }

      if (onboardingBag.creditRiskStatus !== 'deposit_required') {
        throw new Error(
          'You can only create a reserve when a deposit is required.',
        );
      }

      await onSubmit?.();

      const response = await createReserveMutationAsync({
        employment_id: onboardingBag.employmentId,
      });
      if (response.data) {
        await onSuccess?.(response.data as $TSFixMe);
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

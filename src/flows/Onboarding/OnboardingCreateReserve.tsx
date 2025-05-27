import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useMagicLink } from './api';
import { Button } from '@/src/components/ui/button';
import { mutationToPromise } from '@/src/lib/mutations';
import { MagicLinkResponse } from '@/src/client';
import { useOnboardingContext } from './context';

type OnboardingCreateReserveProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    onSuccess?: (data: MagicLinkResponse) => void | Promise<void>;
    onError?: (error: Error) => void;
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
  const magicLinkMutation = useMagicLink();

  const { mutateAsync: createMagicLinkMutation } =
    mutationToPromise(magicLinkMutation);

  const handleSubmit = async () => {
    try {
      if (!onboardingBag.employmentId) {
        throw new Error('Employment ID is required');
      }

      if (onboardingBag.creditRiskStatus !== 'deposit_required') {
        throw new Error(
          'You can only redirect to /dashboard/billing when deposit is required.',
        );
      }

      await onSubmit?.();

      const response = await createMagicLinkMutation({
        user_id: onboardingBag.owner_id as string,
        path: '/dashboard/billing',
      });
      if (response.data?.data) {
        await onSuccess?.(response.data.data);
      }

      if (response.data?.error) {
        onError?.(response.data.error as Error);
      }
    } catch (error) {
      onError?.(error as Error);
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

import { PropsWithChildren } from 'react';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useFormFields } from '@/src/context';
import type { GPAdminStepCallbacks } from '@/src/flows/PayrollAdminOnboarding/types';
import { isMutationError } from '@/src/lib/mutations';

type InvitationStepProps = Pick<
  GPAdminStepCallbacks,
  'onSuccess' | 'onError'
> & {
  children?: React.ReactNode;
};

export function InvitationStep({
  onSuccess,
  onError,
  children,
}: PropsWithChildren<InvitationStepProps>) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  const handleInvite = async () => {
    try {
      const data = await adminBag.sendInvite();
      await onSuccess?.(data);
      adminBag.goToNextStep();
    } catch (error: unknown) {
      if (isMutationError(error)) {
        onError?.({
          error: error.error,
          rawError: error.rawError,
          fieldErrors: error.fieldErrors,
        });
      } else {
        onError?.({
          error: error as Error,
          rawError: error as Record<string, unknown>,
          fieldErrors: [],
        });
      }
    }
  };

  return (
    <CustomButton onClick={handleInvite} disabled={adminBag.isSubmitting}>
      {children ?? 'Send invitation'}
    </CustomButton>
  );
}

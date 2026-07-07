import { PropsWithChildren } from 'react';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useFormFields } from '@/src/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { isMutationError, mutationToPromise } from '@/src/lib/mutations';
import { useGPInviteEmployee } from '@/src/flows/PayrollAdminOnboarding/api';

type InvitationStepProps = Pick<GPStepCallbacks, 'onSuccess' | 'onError'> & {
  children?: React.ReactNode;
};

export function InvitationStep({
  onSuccess,
  onError,
  children,
}: PropsWithChildren<InvitationStepProps>) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const { components } = useFormFields();
  const inviteMutation = useGPInviteEmployee();
  const { mutateAsyncOrThrow: inviteAsync } = mutationToPromise(inviteMutation);

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  const handleInvite = async () => {
    if (!adminBag.employmentId) return;
    try {
      const data = await inviteAsync({ employmentId: adminBag.employmentId });
      await adminBag.refetchSteps();
      await onSuccess?.(data);
      adminBag.next();
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
    <CustomButton
      onClick={handleInvite}
      disabled={inviteMutation.isPending || adminBag.isSubmitting}
    >
      {children ?? 'Send invitation'}
    </CustomButton>
  );
}

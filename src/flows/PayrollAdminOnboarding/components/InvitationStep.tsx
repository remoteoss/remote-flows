import { PropsWithChildren } from 'react';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useFormFields } from '@/src/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { mutationToPromise } from '@/src/lib/mutations';
import { useGPInviteEmployee } from '@/src/flows/PayrollAdminOnboarding/api';
import { handleStepError } from '@/src/lib/utils';

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
    try {
      if (!adminBag.employmentId) {
        throw new Error(
          'Employment ID is missing. Complete the previous steps first.',
        );
      }
      const data = await inviteAsync({ employmentId: adminBag.employmentId });
      await adminBag.refetchSteps();
      await onSuccess?.(data);
      adminBag.next();
    } catch (error: unknown) {
      onError?.(handleStepError(error));
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

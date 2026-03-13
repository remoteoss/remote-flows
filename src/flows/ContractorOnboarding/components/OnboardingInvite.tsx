import { ButtonHTMLAttributes, ReactNode } from 'react';
import omit from 'lodash.omit';
import {
  useCreateReserveInvoice,
  useEmploymentInvite,
} from '@/src/flows/Onboarding/api';
import { FieldError, mutationToPromise } from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';
import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { isStructuredError } from '@/src/lib/utils';

export type OnboardingInviteProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: ({
    data,
    employmentStatus,
  }: {
    data: SuccessResponse;
    employmentStatus: 'invited' | 'created_awaiting_reserve';
  }) => void | Promise<void>;
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: FieldError[];
  }) => void;
  onSubmit?: () => void | Promise<void>;
  render: (props: {
    employmentStatus: 'invited' | 'created_awaiting_reserve';
  }) => ReactNode;
} & Record<string, unknown>;

export function OnboardingInvite({
  onSubmit,
  onSuccess,
  onError,
  render,
  ...props
}: OnboardingInviteProps) {
  const { components } = useFormFields();
  const { contractorOnboardingBag } = useContractorOnboardingContext();
  const employmentInviteMutation = useEmploymentInvite();
  const createReserveInvoiceMutation = useCreateReserveInvoice();

  const { mutateAsyncOrThrow: employmentInviteMutationAsync } =
    mutationToPromise(employmentInviteMutation);

  const { mutateAsyncOrThrow: createReserveInvoiceMutationAsync } =
    mutationToPromise(createReserveInvoiceMutation);

  const isCOR = contractorOnboardingBag.employment?.contractor_type === 'cor';

  const handleSubmit = async () => {
    try {
      await onSubmit?.();

      if (
        isCOR &&
        !contractorOnboardingBag.isEmploymentReadOnly &&
        contractorOnboardingBag.employmentId
      ) {
        const response = await createReserveInvoiceMutationAsync({
          employment_slug: contractorOnboardingBag.employmentId as string,
        });
        if (response?.data) {
          await onSuccess?.({
            data: response,
            employmentStatus: 'created_awaiting_reserve',
          });

          contractorOnboardingBag.refetchEmployment();
          return;
        }
      } else if (contractorOnboardingBag.employmentId) {
        const data = await employmentInviteMutationAsync({
          employment_id: contractorOnboardingBag.employmentId,
        });
        if (data) {
          await onSuccess?.({
            data: data,
            employmentStatus: 'invited',
          });
          contractorOnboardingBag.refetchEmployment();
        }
      }
    } catch (error: unknown) {
      if (isStructuredError(error)) {
        onError?.(omit(error, 'response'));
      } else {
        onError?.({
          error: error as Error,
          rawError: error as Record<string, unknown>,
          fieldErrors: [],
        });
      }
    }
  };

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  const isReserveFlow =
    isCOR &&
    contractorOnboardingBag.employment?.status &&
    !contractorOnboardingBag.isEmploymentReadOnly;

  const disabled =
    employmentInviteMutation.isPending ||
    createReserveInvoiceMutation.isPending ||
    !contractorOnboardingBag.canInvite ||
    props.disabled;

  return (
    <CustomButton
      {...props}
      disabled={disabled}
      onClick={(evt) => {
        handleSubmit();
        props.onClick?.(evt);
      }}
    >
      {render({
        employmentStatus: isReserveFlow
          ? 'created_awaiting_reserve'
          : 'invited',
      })}
    </CustomButton>
  );
}

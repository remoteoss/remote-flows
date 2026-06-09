import { useState, useMemo, useCallback } from 'react';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type { PayrollAdminOnboardingFlowProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';

export type AdminStepKey =
  | 'select_country'
  | 'contract_details'
  | 'administrative_details'
  | 'invite';

const buildAdminSteps = (
  skipCountry: boolean,
): Record<AdminStepKey, Step<AdminStepKey>> => {
  let index = 0;
  return {
    select_country: {
      index: index++,
      name: 'select_country',
      visible: !skipCountry,
    },
    contract_details: { index: index++, name: 'contract_details' },
    administrative_details: {
      index: index++,
      name: 'administrative_details',
    },
    invite: { index: index++, name: 'invite' },
  };
};

export const usePayrollAdminOnboarding = ({
  companyId,
  legalEntityId,
  countryCode: initialCountryCode,
  employmentId: initialEmploymentId,
  initialValues,
  options,
}: Omit<PayrollAdminOnboardingFlowProps, 'render'>) => {
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(initialEmploymentId);

  const [internalCountryCode, setInternalCountryCode] = useState<
    string | undefined
  >(initialCountryCode);

  // Fix: derive from state, not from the prop, so setInternalCountryCode changes are reflected
  const skipCountry = !!internalCountryCode;

  // Fix: memoize to avoid allocating a new object on every render
  const steps = useMemo(() => buildAdminSteps(skipCountry), [skipCountry]);

  const { updateErrorContext } = useErrorReporting({ flow: 'payroll_admin_onboarding' });

  const onStepChange = useCallback(
    (step: Step<AdminStepKey>) => {
      updateErrorContext({ step: step.name });
    },
    [updateErrorContext],
  );

  const { stepState, nextStep, previousStep, goToStep, setStepValues } =
    useStepState<AdminStepKey>(steps, onStepChange);

  const {
    data: apiSteps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useGPOnboardingSteps(internalEmploymentId);

  const isComplete =
    apiSteps?.find((s) => s.type === 'completion')?.sub_steps?.[0]?.status ===
    'completed';

  return {
    stepState,
    isLoading: isLoadingSteps,
    isComplete: isComplete ?? false,
    companyId,
    legalEntityId,
    countryCode: internalCountryCode,
    employmentId: internalEmploymentId,
    initialValues,
    options,
    apiSteps,
    setInternalEmploymentId,
    setInternalCountryCode,
    refetchSteps,
    goToNextStep: nextStep,
    goToPreviousStep: previousStep,
    goToStep,
    setStepValues,
  };
};

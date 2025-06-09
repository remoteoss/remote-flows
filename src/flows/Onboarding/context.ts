import type { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { createContext, useContext, useState } from 'react';

export const OnboardingContext = createContext<{
  formId: string | undefined;
  onboardingBag: ReturnType<typeof useOnboarding> | null;
}>({
  formId: undefined,
  onboardingBag: null,
});

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  const [creditScore, setCreditScore] = useState<{
    showReserveInvoice: boolean;
    showInviteSuccessful: boolean;
  }>({
    showReserveInvoice: false,
    showInviteSuccessful: false,
  });
  if (!context.formId || !context.onboardingBag) {
    throw new Error(
      'useOnboardingContext must be used within a OnboardingContextProvider',
    );
  }

  return {
    formId: context.formId,
    onboardingBag: context.onboardingBag,
    showReserveInvoice: creditScore.showReserveInvoice,
    setShowReserveInvoice: (value: boolean) => {
      setCreditScore((prev) => ({ ...prev, showReserveInvoice: value }));
    },
    showInviteSuccessful: creditScore.showInviteSuccessful,
    setShowInviteSuccessful: (value: boolean) => {
      setCreditScore((prev) => ({ ...prev, showInviteSuccessful: value }));
    },
  } as const;
};

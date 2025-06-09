import type { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { createContext, useContext } from 'react';

export const OnboardingContext = createContext<{
  formId: string | undefined;
  onboardingBag: ReturnType<typeof useOnboarding> | null;
  showReserveInvoice?: boolean;
  setShowReserveInvoice?: (value: boolean) => void;
  showInviteSuccessful?: boolean;
  setShowInviteSuccessful?: (value: boolean) => void;
}>({
  formId: undefined,
  onboardingBag: null,
  showReserveInvoice: false,
  setShowReserveInvoice: () => {},
  showInviteSuccessful: false,
  setShowInviteSuccessful: () => {},
});

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context.formId || !context.onboardingBag) {
    throw new Error(
      'useOnboardingContext must be used within a OnboardingContextProvider',
    );
  }

  return {
    formId: context.formId,
    onboardingBag: context.onboardingBag,
    showReserveInvoice: context.showReserveInvoice,
    setShowReserveInvoice: context.setShowReserveInvoice,
    showInviteSuccessful: context.showInviteSuccessful,
    setShowInviteSuccessful: context.setShowInviteSuccessful,
  } as const;
};

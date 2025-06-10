import type { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { createContext, useContext } from 'react';

export const OnboardingContext = createContext<{
  formId: string | undefined;
  onboardingBag: ReturnType<typeof useOnboarding> | null;
  creditScore: {
    showReserveInvoice: boolean;
    showInviteSuccessful: boolean;
  };
  setCreditScore: React.Dispatch<
    React.SetStateAction<{
      showReserveInvoice: boolean;
      showInviteSuccessful: boolean;
    }>
  >;
}>({
  formId: undefined,
  onboardingBag: null,
  creditScore: {
    showReserveInvoice: false,
    showInviteSuccessful: false,
  },
  setCreditScore: () => {},
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
    creditScore: context.creditScore,
    setCreditScore: context.setCreditScore,
  } as const;
};

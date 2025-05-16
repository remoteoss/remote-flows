import type { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { createContext, useContext } from 'react';

export const OnboardingContext = createContext<{
  formId: string | undefined;
  onboardingBag: ReturnType<typeof useOnboarding> | null;
}>({
  formId: undefined,
  onboardingBag: null,
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
  } as const;
};

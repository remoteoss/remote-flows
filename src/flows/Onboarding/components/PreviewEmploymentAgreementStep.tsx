import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';

export function PreviewEmploymentAgreementStep() {
  const { onboardingBag } = useOnboardingContext();

  const handleSubmit = async () => {
    onboardingBag?.next();
  };

  return <OnboardingForm defaultValues={{}} onSubmit={handleSubmit} />;
}

import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';

export function PreviewEmploymentAgreementStep() {
  const { onboardingBag } = useOnboardingContext();

  const handleSubmit = async () => {
    onboardingBag?.next();
  };

  // this step in theory shouldn't be a form, not sure yet...

  return <OnboardingForm defaultValues={{}} onSubmit={handleSubmit} />;
}

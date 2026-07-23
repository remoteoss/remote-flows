import { OnboardingRenderProps } from '@remoteoss/remote-flows';

export const getStepTitle = (
  step: OnboardingRenderProps['onboardingBag']['steps'][number],
  selectedCountryCode: string | null,
) => {
  if (
    selectedCountryCode === 'DEU' &&
    step.name === 'engagement_agreement_details'
  ) {
    return 'Labor leasing in Germany';
  }
  return step.label;
};

export const StepsNavigation = ({
  steps,
  stepState,
  selectedCountry,
}: {
  steps: OnboardingRenderProps['onboardingBag']['steps'];
  stepState: OnboardingRenderProps['onboardingBag']['stepState'];
  selectedCountry: OnboardingRenderProps['onboardingBag']['selectedCountry'];
}) => {
  const currentStepIndex = stepState.currentStep.index;
  return (
    <div className='steps-navigation'>
      <ul>
        {steps
          .filter((step) => step.visible)
          .map((step, index) => (
            <li
              key={step.name}
              className={`step-item ${step.index === currentStepIndex ? 'active' : ''}`}
            >
              {index + 1}. {getStepTitle(step, selectedCountry?.code ?? null)}
            </li>
          ))}
      </ul>
    </div>
  );
};

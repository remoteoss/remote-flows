import {
  OnboardingFlow,
  RemoteFlows,
  OnboardingRenderProps,
} from '@remoteoss/remote-flows';
import './App.css';

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

const MultiStepForm = ({ onboardingBag, components }: MultiStepFormProps) => {
  const { BasicInformationStep, SubmitButton } = components;

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={(payload) => console.log('payload', payload)}
            onError={(error) => console.log('error', error)}
          />
          <SubmitButton>Next Step</SubmitButton>
          {/* <SubmitButton>Next Step</SubmitButton> */}
        </>
      );
    case 'contract_details':
      return <p>hello</p>;
  }
};

const fetchToken = () => {
  return fetch('/api/token')
    .then((res) => res.json())
    .then((data) => ({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }))
    .catch((error) => {
      console.error({ error });
      throw error;
    });
};

export const OnboardingEOR = () => {
  return (
    <RemoteFlows auth={fetchToken}>
      <div className="cost-calculator__container">
        <OnboardingFlow
          employmentId="1234"
          countryCode="PRT"
          employeeType="employee"
          externalId="1234"
          render={MultiStepForm}
        />
      </div>
    </RemoteFlows>
  );
};

import { OnboardingFlow, RemoteFlows } from '@remoteoss/remote-flows';

const MultiStepForm = ({ onboardingBag, components }) => {
  const { BasicInformationStep } = components;

  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <div className="alert">
            <p>
              Please do not inform the employee of their termination until we
              review your request for legal risks. When we approve your request,
              you can inform the employee and we'll take it from there.
            </p>
          </div>
          <BasicInformationStep />
          {/* <SubmitButton>Next Step</SubmitButton> */}
        </>
      );
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
      <OnboardingFlow employmentId={'1234'} render={MultiStepForm} />
    </RemoteFlows>
  );
};

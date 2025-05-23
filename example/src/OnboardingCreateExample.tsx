import {
  BasicInformationFormPayload,
  BenefitsFormPayload,
  ContractDetailsFormPayload,
  EmploymentCreationResponse,
  EmploymentResponse,
  OnboardingFlow,
  OnboardingRenderProps,
  RemoteFlows,
  SuccessResponse,
} from '@remoteoss/remote-flows';
import './App.css';

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

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

const MultiStep = ({ components, onboardingBag }: MultiStepFormProps) => {
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
    OnboardingInvite,
  } = components;

  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={(payload: BasicInformationFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentCreationResponse) => {
              // call the BAMBOOHR API server
              if (!onboardingBag.employmentId) {
                // do the post API  call
                console.log('API call to create employment', data);
              }
            }}
            onError={(error: Error) => console.log(error.message)}
          />
          <div className="onboarding-basic-information__buttons">
            <SubmitButton type="submit" disabled={onboardingBag.isSubmitting}>
              Create Employment & Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'contract_details':
      return (
        <>
          <ContractDetailsStep
            onSubmit={(payload: ContractDetailsFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentResponse) => console.log('data', data)}
            onError={(error: Error) => console.log(error.message)}
          />
          <div className="onboarding-contract-details__buttons">
            <BackButton type="submit" className="back-button">
              Previous Step
            </BackButton>
            <SubmitButton type="submit" disabled={onboardingBag.isSubmitting}>
              Continue
            </SubmitButton>
          </div>
        </>
      );

    case 'benefits':
      return (
        <div className="benefits-container">
          <BenefitsStep
            onSubmit={(payload: BenefitsFormPayload) =>
              console.log('payload', payload)
            }
            onError={(error: Error) => console.log(error.message)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          <div className="onboarding-benefits__buttons">
            <BackButton className="back-button" type="submit">
              Previous Step
            </BackButton>
            <SubmitButton type="submit" disabled={onboardingBag.isSubmitting}>
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    case 'review':
      return (
        <div className="onboarding-review">
          <h2 className="title">Review</h2>
          <OnboardingInvite type="submit">Invite Employee</OnboardingInvite>
        </div>
      );
  }
};

export const OnboardingCreateExample = () => {
  return (
    <RemoteFlows auth={fetchToken}>
      <OnboardingFlow
        countryCode={'PRT'}
        type={'employee'}
        render={MultiStep}
      />
    </RemoteFlows>
  );
};

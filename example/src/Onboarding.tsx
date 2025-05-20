import {
  OnboardingFlow,
  RemoteFlows,
  OnboardingRenderProps,
  SuccessResponse,
  BenefitsFormPayload,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  EmploymentResponse,
  ContractDetailsFormPayload,
} from '@remoteoss/remote-flows';
import './App.css';
import { useState } from 'react';

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

function Review({ values }: { values: Record<string, unknown> }) {
  return (
    <div className="onboarding-values">
      {Object.entries(values).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <pre>
              {key}: {value.join(', ')}
            </pre>
          );
        }
        if (typeof value === 'object') {
          return (
            <pre>
              {key}: {JSON.stringify(value)}
            </pre>
          );
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return (
            <pre>
              {key}: {value}
            </pre>
          );
        }
      })}
    </div>
  );
}

const MultiStepForm = ({ onboardingBag, components }: MultiStepFormProps) => {
  const [apiError, setApiError] = useState<string | null>();
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
    OnboardingInvite,
  } = components;

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={(payload: BasicInformationFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentCreationResponse) =>
              console.log('data', data)
            }
            onError={(error: Error) => setApiError(error.message)}
          />
          {apiError && <p className="error">{apiError}</p>}
          <div className="onboarding-basic-information__buttons">
            <SubmitButton
              type="submit"
              disabled={onboardingBag.isSubmitting}
              onClick={() => setApiError(null)}
            >
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
            onError={(error: Error) => setApiError(error.message)}
          />
          {apiError && <p className="error">{apiError}</p>}
          <div className="onboarding-contract-details__buttons">
            <BackButton type="submit" onClick={() => setApiError(null)}>
              Previous Step
            </BackButton>
            <SubmitButton
              type="submit"
              onClick={() => setApiError(null)}
              disabled={onboardingBag.isSubmitting}
            >
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
            onError={(error: Error) => setApiError(error.message)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          {apiError && <p className="error">{apiError}</p>}
          <div className="onboarding-benefits__buttons">
            <BackButton onClick={() => setApiError(null)} type="submit">
              Previous Step
            </BackButton>
            <SubmitButton
              onClick={() => setApiError(null)}
              type="submit"
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    case 'review':
      return (
        <div className="onboarding-review">
          <h2 className="title">Basic Information</h2>
          <Review
            values={onboardingBag.stepState.values?.basic_information || {}}
          />
          <h2 className="title">Contract Details</h2>
          <Review
            values={onboardingBag.stepState.values?.contract_details || {}}
          />
          <h2 className="title">Benefits</h2>
          <Review values={onboardingBag.stepState.values?.benefits || {}} />
          <div className="onboarding-review__buttons">
            <BackButton onClick={() => setApiError(null)} type="submit">
              Back
            </BackButton>
            <OnboardingInvite onClick={() => setApiError(null)} type="submit">
              Invite Employee
            </OnboardingInvite>
          </div>
        </div>
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
      <OnboardingFlow
        countryCode="PRT"
        type="employee"
        render={MultiStepForm}
      />
    </RemoteFlows>
  );
};

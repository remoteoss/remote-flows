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

const STEPS = [
  'Basic Information',
  'Contract Details',
  'Benefits',
  'Review & Invite',
];

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

function Review({
  meta,
}: {
  meta: Record<string, { label: string; prettyValue: string | boolean }>;
}) {
  return (
    <div className="onboarding-values">
      {Object.values(meta)
        .filter(Boolean)
        .map((value) => {
          if (!value.prettyValue) {
            return Object.values(value)
              .filter(Boolean)
              .map((v) => {
                const val = v as unknown as {
                  label: string;
                  prettyValue: string;
                };
                return (
                  <pre>
                    {val.label}: {value.prettyValue === true ? 'Yes' : 'No'}
                  </pre>
                );
              });
          }
          return (
            <pre>
              {value.label}: {value.prettyValue}
            </pre>
          );
        })}
    </div>
  );
}

const MultiStepForm = ({ components, onboardingBag }: MultiStepFormProps) => {
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
    OnboardingInvite,
    InvitationSection,
  } = components;
  const [apiError, setApiError] = useState<string | null>();

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
          <div className="buttons-container">
            <SubmitButton
              className="submit-button"
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
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              className="submit-button"
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
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              onClick={() => setApiError(null)}
              className="submit-button"
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
          <Review meta={onboardingBag.meta.fields.basic_information || {}} />
          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('basic_information')}
          >
            Edit Basic Information
          </button>
          <h2 className="title">Contract Details</h2>
          <Review meta={onboardingBag.meta.fields.contract_details || {}} />
          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('contract_details')}
          >
            Edit Contract Details
          </button>
          <h2 className="title">Benefits</h2>
          <Review meta={onboardingBag.meta.fields.benefits || {}} />

          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('benefits')}
          >
            Edit Benefits
          </button>
          <h2 className="title">Review</h2>
          <InvitationSection
            render={({ DefaultComponent, props, onboardingBag }) => {
              return (
                <>
                  <DefaultComponent />
                  {onboardingBag.creditRiskStatus === 'deposit_required' && (
                    <>
                      <p>Reserve payment required to hire this employee</p>
                      <a href={props.supportLink}>What is a reserve payment</a>
                    </>
                  )}
                </>
              );
            }}
          />
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Back
            </BackButton>
            <OnboardingInvite
              onSuccess={(response) => {
                if ('url' in response.data && response.data.url) {
                  const open = window.open(response.data.url, '_blank');
                  if (open) {
                    open.focus();
                  }
                }
              }}
              onError={(error: Error) => setApiError(error.message)}
              type="submit"
            >
              {onboardingBag.creditRiskStatus === 'deposit_required'
                ? 'Create Reserve...'
                : 'Invite Employee'}
            </OnboardingInvite>
          </div>
        </div>
      );
  }
};

const OnBoardingRender = ({
  onboardingBag,
  components,
}: MultiStepFormProps) => {
  const currentStepIndex = onboardingBag.stepState.currentStep.index;

  const stepTitle = STEPS[currentStepIndex];

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="steps-navigation">
        <ul>
          {STEPS.map((step, index) => (
            <li
              key={index}
              className={`step-item ${index === currentStepIndex ? 'active' : ''}`}
            >
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h1 className="heading">{stepTitle}</h1>
        <MultiStepForm onboardingBag={onboardingBag} components={components} />
      </div>
    </>
  );
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

type OnboardingFormData = {
  companyId: string;
  countryCode: string;
  type: 'employee' | 'contractor';
  employmentId: string;
};

const OnboardingWithProps = ({
  companyId,
  countryCode,
  type,
  employmentId,
}: OnboardingFormData) => (
  <RemoteFlows auth={fetchToken}>
    <OnboardingFlow
      companyId={companyId}
      countryCode={countryCode}
      type={type}
      render={OnBoardingRender}
      employmentId={employmentId}
    />
  </RemoteFlows>
);

export const OnboardingForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    countryCode: 'PRT',
    type: 'employee',
    employmentId: '',
    companyId: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingWithProps {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className="onboarding-form-container">
      <div className="onboarding-form-group">
        <label htmlFor="companyId" className="onboarding-form-label">
          Company ID:
        </label>
        <input
          id="companyId"
          type="text"
          value={formData.companyId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, companyId: e.target.value }))
          }
          required
          placeholder="e.g. Your Company ID"
          className="onboarding-form-input"
        />
      </div>
      <div className="onboarding-form-group">
        <label htmlFor="countryCode" className="onboarding-form-label">
          Country Code:
        </label>
        <input
          id="countryCode"
          type="text"
          value={formData.countryCode}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, countryCode: e.target.value }))
          }
          required
          placeholder="e.g. PRT"
          className="onboarding-form-input"
        />
      </div>
      <div className="onboarding-form-group">
        <label htmlFor="type" className="onboarding-form-label">
          Type:
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: e.target.value as 'employee' | 'contractor',
            }))
          }
          required
          className="onboarding-form-select"
        >
          <option value="employee">Employee</option>
          <option value="contractor">Contractor</option>
        </select>
      </div>
      <div className="onboarding-form-group">
        <label htmlFor="employmentId" className="onboarding-form-label">
          Employment ID:
        </label>
        <input
          id="employmentId"
          type="text"
          value={formData.employmentId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, employmentId: e.target.value }))
          }
          placeholder="Enter employment ID"
          className="onboarding-form-input"
        />
      </div>
      <button type="submit" className="onboarding-form-button">
        Start Onboarding
      </button>
    </form>
  );
};

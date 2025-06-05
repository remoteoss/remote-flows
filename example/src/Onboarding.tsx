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
  SelectCountrySuccess,
  SelectCountryFormPayload,
} from '@remoteoss/remote-flows';
import './App.css';
import React, { useState } from 'react';
import { OnboardingAlertStatutes } from './OnboardingAlertStatutes';

export const InviteSection = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div className="rmt-invitation-section">
      <h2 className="rmt-invitation-title">{title}</h2>
      <p className="rmt-invitation-description">{description}</p>
      {children}
    </div>
  );
};
const STEPS = [
  'Select Country',
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
  meta: Record<string, { label?: string; prettyValue?: string | boolean }>;
}) {
  return (
    <div className="onboarding-values">
      {Object.entries(meta).map(([key, value]) => {
        const label = value?.label;
        const prettyValue = value?.prettyValue;

        // Skip if there's no label or prettyValue is undefined or empty string
        if (!label || prettyValue === undefined || prettyValue === '') {
          return null;
        }

        // Handle boolean prettyValue
        const displayValue =
          typeof prettyValue === 'boolean'
            ? prettyValue
              ? 'Yes'
              : 'No'
            : prettyValue;

        return (
          <pre key={key}>
            {label}: {displayValue}
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
    SelectCountryStep,
  } = components;
  const [apiError, setApiError] = useState<string | null>();
  const [showReserveInvoice, setShowReserveInvoice] = useState(false);
  const [showInviteSuccessful, setShowInviteSuccessful] = useState(false);

  switch (onboardingBag.stepState.currentStep.name) {
    case 'select_country':
      return (
        <>
          <SelectCountryStep
            onSubmit={(payload: SelectCountryFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(response: SelectCountrySuccess) =>
              console.log('response', response)
            }
            onError={(error: Error) => setApiError(error.message)}
          />
          <div className="buttons-container">
            <SubmitButton
              className="submit-button"
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'basic_information':
      return (
        <>
          <OnboardingAlertStatutes
            creditRiskStatus={onboardingBag.creditRiskStatus}
          />
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
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
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
          <OnboardingAlertStatutes
            creditRiskStatus={onboardingBag.creditRiskStatus}
          />
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
          <h2 className="title">Select country</h2>
          <Review meta={onboardingBag.meta.fields.select_country} />
          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('select_country')}
          >
            Edit Country
          </button>
          <h2 className="title">Basic Information</h2>
          <Review meta={onboardingBag.meta.fields.basic_information} />
          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('basic_information')}
          >
            Edit Basic Information
          </button>
          <h2 className="title">Contract Details</h2>
          <Review meta={onboardingBag.meta.fields.contract_details} />
          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('contract_details')}
          >
            Edit Contract Details
          </button>
          <h2 className="title">Benefits</h2>
          <Review meta={onboardingBag.meta.fields.benefits} />

          <button
            className="back-button"
            onClick={() => onboardingBag.goTo('benefits')}
          >
            Edit Benefits
          </button>
          <h2 className="title">Review</h2>
          {!showReserveInvoice &&
            onboardingBag.creditRiskStatus === 'deposit_required' && (
              <InviteSection
                title="Confirm Details && Continue"
                description="If the employee's details look good, click Continue to check if your reserve invoice is ready for payment. After we receive payment, you'll be able to invite the employee to onboard to Remote."
              >
                <p>Reserve payment required to hire this employee</p>
                <a href="https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment">
                  What is a reserve payment
                </a>
              </InviteSection>
            )}
          {!showInviteSuccessful &&
            onboardingBag.creditRiskStatus !== 'deposit_required' && (
              <InviteSection
                title={`Ready to invite ${onboardingBag.stepState.values?.basic_information?.name} to Remote?`}
                description="If you're ready to invite this employee to onboard with Remote, click the button below."
              />
            )}

          {onboardingBag.creditRiskStatus === 'deposit_required' &&
            showReserveInvoice && (
              <div className="reserve-invoice">
                <h2>You’ll receive a reserve invoice soon</h2>
                <p>
                  We saved{' '}
                  {onboardingBag.stepState.values?.basic_information.name}{' '}
                  details as a draft. You’ll be able to invite them to Remote
                  after you complete the reserve payment.
                </p>
                <div>
                  <button type="submit">Go to dashboard</button>

                  <br />

                  <a href="https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment">
                    What is a reserve payment
                  </a>
                </div>
              </div>
            )}

          {onboardingBag.creditRiskStatus !== 'deposit_required' &&
            showInviteSuccessful && (
              <div className="invite-successful">
                <h2>You’re all set!</h2>
                <p>
                  {onboardingBag.stepState.values?.basic_information.name} at{' '}
                  {
                    onboardingBag.stepState.values?.basic_information
                      .personal_email
                  }{' '}
                  has been invited to Remote. We’ll let you know once they
                  complete their onboarding process
                </p>
                <div>
                  <button type="submit">Go to dashboard</button>
                </div>
              </div>
            )}

          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Back
            </BackButton>
            <OnboardingInvite
              className="submit-button"
              onSuccess={() => {
                if (onboardingBag.creditRiskStatus === 'deposit_required') {
                  setShowReserveInvoice(true);
                  return;
                } else {
                  setShowInviteSuccessful(true);
                }

                console.log(
                  'after inviting or creating a reserve navigate to whatever place you want',
                );
              }}
              onError={(error: Error) => setApiError(error.message)}
              type="submit"
            >
              {onboardingBag.creditRiskStatus === 'deposit_required'
                ? 'Continue'
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
  countryCode?: string;
  companyId: string;
  type: 'employee' | 'contractor';
  employmentId: string;
};

const OnboardingWithProps = ({
  companyId,
  type,
  employmentId,
}: OnboardingFormData) => (
  <RemoteFlows auth={fetchToken}>
    <OnboardingFlow
      companyId={companyId}
      type={type}
      render={OnBoardingRender}
      employmentId={employmentId}
    />
  </RemoteFlows>
);

export const OnboardingForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
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

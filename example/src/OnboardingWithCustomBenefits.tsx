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
            components={{
              radio: ({ field, fieldData }) => {
                const selectedValue = field.value;

                type OptionWithMeta = {
                  value: string;
                  label: string;
                  description?: string;
                  meta?: { display_cost?: string };
                };

                return (
                  <div className="benefit-cards-container">
                    {(fieldData.options as OptionWithMeta[] | undefined)?.map(
                      (option) => {
                        const isSelected = selectedValue === option.value;
                        const meta = option.meta || {};
                        return (
                          <label
                            key={option.value}
                            className={`benefit-card${isSelected ? ' benefit-card--selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={option.value}
                              checked={isSelected}
                              onChange={field.onChange}
                              style={{ display: 'none' }}
                            />
                            <div
                              className="benefit-card__label"
                              title={option.label}
                            >
                              {option.label}
                            </div>
                            <div className="benefit-card__summary">
                              {option.description || 'Plan summary'}
                            </div>
                            <div className="benefit-card__cost">
                              {meta.display_cost || ''}
                            </div>
                            <button
                              type="button"
                              className={`benefit-card__button${isSelected ? ' benefit-card__button--selected' : ''}`}
                              tabIndex={-1}
                            >
                              {isSelected
                                ? 'Plan Selected!'
                                : 'Select This Plan'}
                            </button>
                            {isSelected && (
                              <span className="benefit-card__selected-check">
                                ✓ Plan Selected!
                              </span>
                            )}
                          </label>
                        );
                      },
                    )}
                  </div>
                );
              },
            }}
            onSubmit={(payload: BenefitsFormPayload) =>
              console.log('payload', payload)
            }
            onError={(error: Error) => setApiError(error.message)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          {apiError && <p className="error">{apiError}</p>}
          <div className="onboarding-benefits__buttons">
            <BackButton>Previous Step</BackButton>
            <SubmitButton disabled={onboardingBag.isSubmitting}>
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
            <BackButton>Previous Step</BackButton>
            <OnboardingInvite>Invite Employee</OnboardingInvite>
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

export const OnboardingWithCustomBenefits = () => {
  return (
    <RemoteFlows auth={fetchToken}>
      <OnboardingFlow
        countryCode="PRT"
        type="employee"
        render={MultiStepForm}
        employmentId="0b20b5a1-9840-452c-8bdc-bf8aec4e71d0"
      />
    </RemoteFlows>
  );
};

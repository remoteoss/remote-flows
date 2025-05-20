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
            onError={(error: Error) => console.log('error', error)}
          />
          <SubmitButton disabled={onboardingBag.isSubmitting}>
            Next Step
          </SubmitButton>
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
            onError={(error: Error) => console.log('error', error)}
          />
          <BackButton>Back</BackButton>
          <SubmitButton disabled={onboardingBag.isSubmitting}>
            Next Step
          </SubmitButton>
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
            onError={(error: Error) => console.log('error', error)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          <BackButton>Back</BackButton>
          <SubmitButton disabled={onboardingBag.isSubmitting}>
            Next Step
          </SubmitButton>
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
          <BackButton>Back</BackButton>
          <OnboardingInvite>Invite Employee</OnboardingInvite>
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

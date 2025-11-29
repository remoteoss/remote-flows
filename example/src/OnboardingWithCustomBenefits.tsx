import {
  OnboardingFlow,
  OnboardingRenderProps,
  SuccessResponse,
  BenefitsFormPayload,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  EmploymentResponse,
  ContractDetailsFormPayload,
  NormalizedFieldError,
} from '@remoteoss/remote-flows';
import { defaultComponents } from '@remoteoss/remote-flows/default-components';
import { useState } from 'react';
import { ReviewOnboardingStep } from './ReviewOnboardingStep';
import { OnboardingAlertStatuses } from './OnboardingAlertStatuses';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

const MultiStepForm = ({ onboardingBag, components }: MultiStepFormProps) => {
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({
    apiError: '',
    fieldErrors: [],
  });
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
  } = components;

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <OnboardingAlertStatuses
            creditRiskStatus={onboardingBag.creditRiskStatus}
          />
          <BasicInformationStep
            onSubmit={(payload: BasicInformationFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentCreationResponse) =>
              console.log('data', data)
            }
            onError={({
              error,
              fieldErrors,
            }: {
              error: Error;
              fieldErrors: NormalizedFieldError[];
            }) => {
              setErrors({ apiError: error.message, fieldErrors });
            }}
          />
          <AlertError errors={errors} />
          <div className='buttons-container'>
            <SubmitButton
              className='submit-button'
              disabled={onboardingBag.isSubmitting}
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Create Employment & Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'contract_details':
      return (
        <>
          <OnboardingAlertStatuses
            creditRiskStatus={onboardingBag.creditRiskStatus}
          />
          <ContractDetailsStep
            onSubmit={(payload: ContractDetailsFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentResponse) => console.log('data', data)}
            onError={({
              error,
              fieldErrors,
            }: {
              error: Error;
              fieldErrors: NormalizedFieldError[];
            }) => setErrors({ apiError: error.message, fieldErrors })}
          />
          <AlertError errors={errors} />
          <div className='buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );

    case 'benefits':
      return (
        <div className='benefits-container'>
          <BenefitsStep
            components={{
              ...defaultComponents,
              radio: ({ field, fieldData }) => {
                const selectedValue = field.value;

                type OptionWithMeta = {
                  value: string;
                  label: string;
                  description?: string;
                  meta?: { display_cost?: string };
                };

                return (
                  <div className='benefit-cards-container'>
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
                              type='radio'
                              name={field.name}
                              value={option.value}
                              checked={isSelected}
                              onChange={field.onChange}
                              style={{ display: 'none' }}
                            />
                            <div
                              className='benefit-card__label'
                              title={option.label}
                            >
                              {option.label}
                            </div>
                            <div className='benefit-card__summary'>
                              {option.description || 'Plan summary'}
                            </div>
                            <div className='benefit-card__cost'>
                              {meta.display_cost || ''}
                            </div>
                            <button
                              type='button'
                              className={`benefit-card__button${isSelected ? ' benefit-card__button--selected' : ''}`}
                              tabIndex={-1}
                            >
                              {isSelected
                                ? 'Plan Selected!'
                                : 'Select This Plan'}
                            </button>
                            {isSelected && (
                              <span className='benefit-card__selected-check'>
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
            onError={({
              error,
              fieldErrors,
            }: {
              error: Error;
              fieldErrors: NormalizedFieldError[];
            }) => setErrors({ apiError: error.message, fieldErrors })}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          <AlertError errors={errors} />
          <div className='buttons-container'>
            <BackButton className='back-button'>Previous Step</BackButton>
            <SubmitButton
              className='submit-button'
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    case 'review':
      return (
        <ReviewOnboardingStep
          onboardingBag={onboardingBag}
          components={components}
          errors={errors}
          setErrors={setErrors}
        />
      );
  }
};

type OnboardingWithCustomBenefitsProps = {
  companyId: string;
  type: 'employee' | 'contractor';
  employmentId: string;
  countryCode: string;
};

const OnboardingWithCustomBenefits = ({
  type,
  companyId,
  employmentId,
  countryCode,
}: OnboardingWithCustomBenefitsProps) => {
  return (
    <RemoteFlows>
      <OnboardingFlow
        companyId={companyId}
        countryCode={countryCode}
        type={type}
        render={MultiStepForm}
        employmentId={employmentId}
        skipSteps={['select_country']}
      />
    </RemoteFlows>
  );
};

type OnboardingFormData = {
  companyId: string;
  type: 'employee' | 'contractor';
  employmentId: string;
  countryCode: string;
};

export const OnboardingCustomBenefitsForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyId: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8', // use your own company ID
    type: 'employee',
    countryCode: 'PRT',
    employmentId: '',
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingWithCustomBenefits {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
      <div className='onboarding-form-group'>
        <label htmlFor='companyId' className='onboarding-form-label'>
          Company ID:
        </label>
        <input
          id='companyId'
          type='text'
          value={formData.companyId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, companyId: e.target.value }))
          }
          required
          placeholder='e.g. Your Company ID'
          className='onboarding-form-input'
        />
      </div>

      <div className='onboarding-form-group'>
        <label htmlFor='countryCode' className='onboarding-form-label'>
          Country Code:
        </label>
        <input
          id='countryCode'
          type='text'
          value={formData.countryCode}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, countryCode: e.target.value }))
          }
          required
          placeholder='e.g. PRT'
          className='onboarding-form-input'
        />
      </div>

      <div className='onboarding-form-group'>
        <label htmlFor='type' className='onboarding-form-label'>
          Type:
        </label>
        <select
          id='type'
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: e.target.value as 'employee' | 'contractor',
            }))
          }
          required
          className='onboarding-form-select'
        >
          <option value='employee'>Employee</option>
          <option value='contractor'>Contractor</option>
        </select>
      </div>

      <div className='onboarding-form-group'>
        <label htmlFor='employmentId' className='onboarding-form-label'>
          Employment ID:
        </label>
        <input
          id='employmentId'
          type='text'
          value={formData.employmentId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, employmentId: e.target.value }))
          }
          placeholder='Enter employment ID'
          className='onboarding-form-input'
        />
      </div>

      <button type='submit' className='onboarding-form-button'>
        Start Onboarding
      </button>
    </form>
  );
};

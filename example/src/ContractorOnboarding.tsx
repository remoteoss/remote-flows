import {
  ContractorOnboardingRenderProps,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  SelectCountrySuccess,
  SelectCountryFormPayload,
  NormalizedFieldError,
  ContractorOnboardingFlow,
} from '@remoteoss/remote-flows';
import React, { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';

const STEPS = ['Select Country', 'Basic Information', 'Contract Details'];

type MultiStepFormProps = {
  contractorOnboardingBag: ContractorOnboardingRenderProps['contractorOnboardingBag'];
  components: ContractorOnboardingRenderProps['components'];
};

const MultiStepForm = ({
  components,
  contractorOnboardingBag,
}: MultiStepFormProps) => {
  const { BasicInformationStep, SubmitButton, BackButton, SelectCountryStep } =
    components;
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({
    apiError: '',
    fieldErrors: [],
  });

  switch (contractorOnboardingBag.stepState.currentStep.name) {
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
            onError={({
              error,
              fieldErrors,
            }: {
              error: Error;
              fieldErrors: NormalizedFieldError[];
            }) => setErrors({ apiError: error.message, fieldErrors })}
          />
          <div className='buttons-container'>
            <SubmitButton
              className='submit-button'
              disabled={contractorOnboardingBag.isSubmitting}
              variant='outline'
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    /*  case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={(payload: BasicInformationFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentCreationResponse) =>
              console.log('data', data)
            }
            onError={({ error, fieldErrors }) =>
              setErrors({ apiError: error.message, fieldErrors })
            }
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
              disabled={contractorOnboardingBag.isSubmitting}
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Create Employment & Continue
            </SubmitButton>
          </div>
        </>
      ); */
  }
};

const OnBoardingRender = ({
  contractorOnboardingBag,
  components,
}: MultiStepFormProps) => {
  const currentStepIndex = contractorOnboardingBag.stepState.currentStep.index;

  const stepTitle = STEPS[currentStepIndex];

  if (contractorOnboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className='steps-navigation'>
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

      <div className='card' style={{ marginBottom: '20px' }}>
        <h1 className='heading'>{stepTitle}</h1>
        <MultiStepForm
          contractorOnboardingBag={contractorOnboardingBag}
          components={components}
        />
      </div>
    </>
  );
};

type OnboardingFormData = {
  countryCode?: string;
  companyId: string;
  type: 'employee' | 'contractor';
  employmentId: string;
  externalId?: string;
};

const OnboardingWithProps = ({
  companyId,
  type,
  employmentId,
  externalId,
}: OnboardingFormData) => (
  <RemoteFlows>
    <ContractorOnboardingFlow
      companyId={companyId}
      type={type}
      render={OnBoardingRender}
      employmentId={employmentId}
      externalId={externalId}
    />
  </RemoteFlows>
);

export const ContractorOnboardingForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    type: 'contractor',
    employmentId: import.meta.env.VITE_EMPLOYMENT_ID || '', // use your own employment ID
    companyId:
      import.meta.env.VITE_COMPANY_ID || 'c3c22940-e118-425c-9e31-f2fd4d43c6d8', // use your own company ID
    externalId: '',
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
      <div className='onboarding-form-group'>
        <label htmlFor='externalId' className='onboarding-form-label'>
          External ID:
        </label>
        <input
          id='externalId'
          type='text'
          value={formData.externalId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, externalId: e.target.value }))
          }
          placeholder='Enter External ID'
          className='onboarding-form-input'
        />
      </div>
      <button type='submit' className='onboarding-form-button'>
        Start Onboarding
      </button>
    </form>
  );
};

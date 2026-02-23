import {
  CompanyBasicInfoSuccess,
  NormalizedFieldError,
  CreateCompanyFlow,
  CreateCompanyRenderProps,
  CompanyAddressDetailsSuccess,
} from '@remoteoss/remote-flows';
import { Card } from '@remoteoss/remote-flows/internals';
import React, { useState, useCallback } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';
import './css/contractor-onboarding.css';

const STEPS = ['Company Basic Information', 'Address Details'] as const;

type MultiStepFormProps = {
  createCompanyBag: CreateCompanyRenderProps['createCompanyBag'];
  components: CreateCompanyRenderProps['components'];
  onComplete?: () => void;
};

type FormErrors = {
  apiError: string;
  fieldErrors: NormalizedFieldError[];
};

/**
 * Multi-step form component that renders the appropriate step based on the current step state
 */
const MultiStepForm = ({
  components,
  createCompanyBag,
  onComplete,
}: MultiStepFormProps) => {
  const { SubmitButton, CompanyBasicInformationStep, AddressDetailsStep } =
    components;
  const [errors, setErrors] = useState<FormErrors>({
    apiError: '',
    fieldErrors: [],
  });

  const handleError = useCallback(
    ({
      error,
      fieldErrors,
    }: {
      error: Error;
      fieldErrors: NormalizedFieldError[];
    }) => {
      setErrors({ apiError: error.message, fieldErrors });
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setErrors({ apiError: '', fieldErrors: [] });
  }, []);

  const handleBack = useCallback(() => {
    createCompanyBag.back();
    clearErrors();
  }, [createCompanyBag, clearErrors]);

  switch (createCompanyBag.stepState.currentStep.name) {
    case 'company_basic_information':
      return (
        <div className='contractor-onboarding-form-layout'>
          <CompanyBasicInformationStep
            onSuccess={(response: CompanyBasicInfoSuccess) => {
              console.log(response);
            }}
            onError={handleError}
          />
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <SubmitButton className='submit-button' variant='outline'>
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    case 'address_details':
      return (
        <div className='contractor-onboarding-form-layout'>
          <AddressDetailsStep
            onSuccess={(response: CompanyAddressDetailsSuccess) => {
              console.log(response);
              onComplete?.();
            }}
            onError={handleError}
          />
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <button type='button' className='back-button' onClick={handleBack}>
              Back
            </button>
            <SubmitButton className='submit-button' variant='outline'>
              Complete
            </SubmitButton>
          </div>
        </div>
      );
    default:
      return null;
  }
};

/**
 * Main render component for the CreateCompany flow
 * Displays step navigation and handles loading states
 */
const CreateCompanyRender = ({
  createCompanyBag,
  components,
  onComplete,
}: CreateCompanyRenderProps & { onComplete?: () => void }) => {
  const currentStepIndex = createCompanyBag.stepState.currentStep.index;

  return (
    <>
      <div className='steps-contractor-onboarding-navigation'>
        <ul>
          {STEPS.map((step, index) => (
            <li
              key={step}
              className={`step-contractor-onboarding-item ${index === currentStepIndex ? 'active' : ''}`}
            >
              {index + 1}. {step}
            </li>
          ))}
        </ul>
      </div>

      {createCompanyBag.isLoading ? (
        <div className='contractor-onboarding-form-layout'>
          <p>Loading...</p>
        </div>
      ) : (
        <MultiStepForm
          createCompanyBag={createCompanyBag}
          components={components}
          onComplete={onComplete}
        />
      )}
    </>
  );
};

/**
 * Header component for the CreateCompany flow
 */
const Header = () => {
  return (
    <div className='contractor-onboarding-header'>
      <h1>Create Company</h1>
      <p>Create a new company and complete the address details.</p>
    </div>
  );
};

type CreateCompanyFormData = {
  countryCode?: string;
};

type CreateCompanyWithPropsData = CreateCompanyFormData & {
  onComplete?: () => void;
};

/**
 * CreateCompany component with props
 * Wraps the flow with RemoteFlows provider and necessary configuration
 */
export const CreateCompanyWithProps = ({
  countryCode,
  onComplete,
}: CreateCompanyWithPropsData) => {
  return (
    <div className='contractor-onboarding-container'>
      <RemoteFlows
        authType='company-manager'
        proxy={{ url: window.location.origin }}
      >
        <div className='contractor-onboarding-content'>
          <Header />
          <Card className='px-0 py-0'>
            <CreateCompanyFlow
              countryCode={countryCode}
              render={(props) => (
                <CreateCompanyRender {...props} onComplete={onComplete} />
              )}
              options={{}}
            />
          </Card>
        </div>
      </RemoteFlows>
    </div>
  );
};

/**
 * Main CreateCompany form component
 * Handles the initial form submission to start the company creation flow
 */
export const CreateCompanyForm = () => {
  const [formData] = useState<CreateCompanyFormData>({});
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  }, []);

  const handleComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  if (showOnboarding) {
    return <CreateCompanyWithProps {...formData} onComplete={handleComplete} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
      <button type='submit' className='onboarding-form-button'>
        Create company
      </button>
    </form>
  );
};

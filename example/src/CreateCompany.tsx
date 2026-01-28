import {
  SelectCountrySuccess,
  SelectCountryFormPayload,
  NormalizedFieldError,
  CreateCompanyFlow,
  CreateCompanyRenderProps,
  JSFCustomComponentProps,
} from '@remoteoss/remote-flows';
import {
  Card,
  Tabs,
  TabsTrigger,
  TabsList,
} from '@remoteoss/remote-flows/internals';
import React, { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import './css/main.css';
import './css/contractor-onboarding.css';

const Switcher = (props: JSFCustomComponentProps) => {
  return (
    <Tabs
      defaultValue={props.options?.[0].value}
      onValueChange={(value) => {
        props.setValue(value);
      }}
    >
      <TabsList>
        {props.options?.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

const STEPS = [
  'Select Country',
  'Review',
];

type MultiStepFormProps = {
  createCompanyBag: CreateCompanyRenderProps['createCompanyBag'];
  components: CreateCompanyRenderProps['components'];
};

const MultiStepForm = ({
  components,
  createCompanyBag,
}: MultiStepFormProps) => {
  const {
    SubmitButton,
    BackButton,
    SelectCountryStep,
  } = components;
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({
    apiError: '',
    fieldErrors: [],
  });

  switch (createCompanyBag.stepState.currentStep.name) {
    case 'select_country':
      console.log("SELECTING CONUTRY")
      console.log("components")
      console.log(components)
      return (
        <div className='contractor-onboarding-form-layout'>
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
          <div className='contractor-onboarding-buttons-container'>
            <SubmitButton className='submit-button' variant='outline'>
              Continue
            </SubmitButton>
          </div>
        </div>
      );
        case 'review': {
      return (
        <div className='contractor-onboarding-form-layout'>
        </div>
      );
    }
  }
};

const CreateCompanyRender = ({
  createCompanyBag,
  components,
}: MultiStepFormProps) => {
  const currentStepIndex = createCompanyBag.stepState.currentStep.index;

  return (
    <>
      <div className='steps-contractor-onboarding-navigation'>
        <ul>
          {STEPS.map((step, index) => (
            <li
              key={index}
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
        />
      )}
    </>
  );
};

const Header = () => {
  return (
    <div className='contractor-onboarding-header'>
      <h1>Contractor Onboarding</h1>
      <p>Adding a new contractor is simple and fast.</p>
    </div>
  );
};

type CreateCompanyFormData = {
  countryCode?: string;
};

export const CreateCompanyWithProps = ({
}: CreateCompanyFormData) => {
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
              render={CreateCompanyRender}
              options={{
              }}
            />
          </Card>
        </div>
      </RemoteFlows>
    </div>
  );
};

export const CreateCompanyForm = () => {
  const [formData] = useState<CreateCompanyFormData>({
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <CreateCompanyWithProps {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
      <button type='submit' className='onboarding-form-button'>
        Create company
      </button>
    </form>
  );
};

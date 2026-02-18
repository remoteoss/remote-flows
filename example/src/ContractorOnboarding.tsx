import {
  ContractorOnboardingRenderProps,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  SelectCountrySuccess,
  SelectCountryFormPayload,
  NormalizedFieldError,
  ContractorOnboardingFlow,
  PricingPlanFormPayload,
  PricingPlanResponse,
  ContractorOnboardingContractDetailsFormPayload,
  ContractorOnboardingContractDetailsResponse,
  ContractPreviewResponse,
  ContractPreviewFormPayload,
  JSFCustomComponentProps,
  PricingPlanComponentProps,
  PricingPlanDataProps,
  corProductIdentifier,
} from '@remoteoss/remote-flows';
import {
  Card,
  Tabs,
  TabsTrigger,
  TabsList,
} from '@remoteoss/remote-flows/internals';
import Flag from 'react-flagpack';
import React, { useState } from 'react';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import { ReviewContractorOnboardingStep } from './ReviewContractorOnboardingStep';
import { PricingPlanCard } from './components/PricingPlanCard';
import { EngagingContractorsModal } from './components/PricingPlanModals';
import './css/main.css';
import './css/contractor-onboarding.css';

const PricingPlanCards = ({
  field,
  fieldData,
  fieldState,
}: PricingPlanComponentProps) => {
  const hasError = !!fieldState.error;
  return (
    <div className='grid grid-cols-3 gap-2'>
      {fieldData.options?.map((option) => (
        <PricingPlanCard
          key={option.value}
          title={option.label}
          description={option.description}
          features={option.meta?.features as string[]}
          price={option.meta?.price}
          value={option.value}
          selected={field.value === option.value}
          disabled={option.disabled}
          onSelect={(value: string) => {
            field.onChange(value);
          }}
        />
      ))}
      {hasError && <p className='error-message'>{fieldState.error?.message}</p>}
    </div>
  );
};

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

type MultiStepFormProps = {
  contractorOnboardingBag: ContractorOnboardingRenderProps['contractorOnboardingBag'];
  components: ContractorOnboardingRenderProps['components'];
};

const MultiStepForm = ({
  components,
  contractorOnboardingBag,
}: MultiStepFormProps) => {
  const {
    BasicInformationStep,
    SubmitButton,
    BackButton,
    SelectCountryStep,
    PricingPlanStep,
    EligibilityQuestionnaireStep,
    ChooseAlternativePlanStep,
    ContractDetailsStep,
    ContractPreviewStep,
    ContractReviewButton,
  } = components;
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
    case 'basic_information':
      return (
        <div className='contractor-onboarding-form-layout'>
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
          <div className='contractor-onboarding-buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Back
            </BackButton>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );

    case 'contract_details':
      return (
        <div className='contractor-onboarding-form-layout'>
          <ContractDetailsStep
            onSubmit={(
              payload: ContractorOnboardingContractDetailsFormPayload,
            ) => console.log('payload', payload)}
            onSuccess={(
              response: ContractorOnboardingContractDetailsResponse,
            ) => console.log('response', response)}
            onError={({ error, fieldErrors }) => {
              setErrors({ apiError: error.message, fieldErrors });
            }}
          />
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Back
            </BackButton>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );

    case 'contract_preview':
      return (
        <div className='contractor-onboarding-form-layout'>
          <ContractPreviewStep
            onSubmit={(payload: ContractPreviewFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(response: ContractPreviewResponse) =>
              console.log('response', response)
            }
            onError={({ error, fieldErrors }) => {
              setErrors({ apiError: error.message, fieldErrors });
            }}
          />
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Back
            </BackButton>
            <ContractReviewButton
              render={({ reviewCompleted }) =>
                reviewCompleted ? 'Continue' : 'Review'
              }
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            />
          </div>
        </div>
      );

    case 'pricing_plan':
      return (
        <div className='pricing-plan-form-layout'>
          <div className='flex flex-col gap-2 text-center mb-6'>
            <h1 className='text-2xl font-bold text-[#000000]'>Payment terms</h1>
            <p className='text-sm text-[#71717A]'>
              Choose the plan that best fits your needs.
            </p>
            <EngagingContractorsModal />
          </div>
          <div className='mb-6'>
            <PricingPlanStep
              components={{
                radio: ({ field, fieldData, fieldState }) => {
                  return (
                    <PricingPlanCards
                      fieldData={fieldData as PricingPlanDataProps}
                      fieldState={fieldState}
                      field={field}
                    />
                  );
                },
              }}
              onSubmit={(payload: PricingPlanFormPayload) =>
                console.log('payload', payload)
              }
              onSuccess={(response: PricingPlanResponse) =>
                console.log('response', response)
              }
              onError={({ error, fieldErrors }) =>
                setErrors({ apiError: error.message, fieldErrors })
              }
            />
          </div>
          <AlertError errors={errors} />
          {contractorOnboardingBag.fieldValues?.subscription &&
            contractorOnboardingBag.fieldValues?.subscription ===
              corProductIdentifier && (
              <p
                className='text-sm text-[#71717A] mx-auto text-center'
                style={{ maxWidth: '350px' }}
              >
                You'll complete a short questionnaire to check that you can use
                Contractor of Record for this hire. This is to confirm that you
                will not be treating them as an employee.
              </p>
            )}
          <div className='contractor-onboarding-buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Back
            </BackButton>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );

    case 'eligibility_questionnaire':
      return (
        <div className='contractor-onboarding-form-layout'>
          <EligibilityQuestionnaireStep
            onSubmit={(payload) => console.log('payload', payload)}
            onSuccess={(response) => console.log('response', response)}
            onError={({ error, fieldErrors }) =>
              setErrors({ apiError: error.message, fieldErrors })
            }
          />
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Back
            </BackButton>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );

    case 'choose_alternative_plan':
      return (
        <div className='pricing-plan-form-layout'>
          <div className='flex flex-col gap-2 text-center mb-6'>
            <h1 className='text-2xl font-bold text-[#000000]'>
              Choose Your Plan
            </h1>
            <p className='text-sm text-[#71717A]'>
              This individual is not eligible for Contractor of Record. The
              engagement terms imply an employer-employee relationship. We
              suggest the plans below and recommend a legal review before
              deciding. For any questions, contact help@remote.com.
            </p>
          </div>
          <div className='mb-6'>
            <ChooseAlternativePlanStep
              components={{
                radio: ({ field, fieldData, fieldState }) => {
                  return (
                    <PricingPlanCards
                      fieldData={fieldData as PricingPlanDataProps}
                      fieldState={fieldState}
                      field={field}
                    />
                  );
                },
              }}
              onSubmit={(payload) => console.log('payload', payload)}
              onSuccess={(response) => console.log('response', response)}
              onError={({ error, fieldErrors }) =>
                setErrors({ apiError: error.message, fieldErrors })
              }
            />
          </div>
          <AlertError errors={errors} />
          <div className='contractor-onboarding-buttons-container'>
            <SubmitButton
              className='submit-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );

    case 'review': {
      return (
        <div className='contractor-onboarding-form-layout'>
          <ReviewContractorOnboardingStep
            onboardingBag={contractorOnboardingBag}
            components={components}
            errors={errors}
            setErrors={setErrors}
          />
        </div>
      );
    }
  }
};

const OnBoardingRender = ({
  contractorOnboardingBag,
  components,
}: MultiStepFormProps) => {
  const currentStepIndex = contractorOnboardingBag.stepState.currentStep.index;

  return (
    <>
      {contractorOnboardingBag.defaultLegalEntity && (
        <div className='contractor-onboarding-default-legal-entity'>
          <div className='text-sm text-[#27272A] flex items-center justify-center gap-2 uppercase mb-2 font-medium'>
            <Flag
              size='s'
              code={
                contractorOnboardingBag.defaultLegalEntity
                  .country_code as string
              }
            />
            {contractorOnboardingBag.defaultLegalEntity.name}
          </div>
        </div>
      )}
      <Header />
      <Card className='px-0 py-0'>
        <div className='steps-contractor-onboarding-navigation'>
          <ul>
            {contractorOnboardingBag.steps.map((step) => (
              <li
                key={step.name}
                className={`step-contractor-onboarding-item ${step.index === currentStepIndex ? 'active' : ''}`}
              >
                {step.index + 1}. {step.label}
              </li>
            ))}
          </ul>
        </div>

        {contractorOnboardingBag.isLoading ? (
          <div className='contractor-onboarding-form-layout'>
            <p>Loading...</p>
          </div>
        ) : (
          <MultiStepForm
            contractorOnboardingBag={contractorOnboardingBag}
            components={components}
          />
        )}
      </Card>
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

type ContractorOnboardingFormData = {
  countryCode?: string;
  employmentId?: string;
  externalId?: string;
};

export const ContractorOnboardingWithProps = ({
  employmentId,
  externalId,
}: ContractorOnboardingFormData) => {
  return (
    <div className='contractor-onboarding-container'>
      <RemoteFlows
        authType='company-manager'
        proxy={{ url: window.location.origin }}
      >
        <div className='contractor-onboarding-content'>
          <ContractorOnboardingFlow
            render={OnBoardingRender}
            employmentId={employmentId}
            externalId={externalId}
            options={{
              jsfModify: {
                contract_details: {
                  fields: {
                    'payment_terms.payment_terms_type': {
                      'x-jsf-presentation': {
                        Component: (props: JSFCustomComponentProps) => (
                          <Switcher {...props} />
                        ),
                      },
                    },
                  },
                },
              },
            }}
          />
        </div>
      </RemoteFlows>
    </div>
  );
};

export const ContractorOnboardingForm = () => {
  const [formData, setFormData] = useState<ContractorOnboardingFormData>({
    employmentId:
      import.meta.env.VITE_CONTRACTOR_MANAGEMENT_EMPLOYMENT_ID || '', // use your own employment ID
    externalId: '',
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <ContractorOnboardingWithProps {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
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

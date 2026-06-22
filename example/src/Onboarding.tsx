import {
  OnboardingFlow,
  OnboardingRenderProps,
  SuccessResponse,
  BenefitsFormPayload,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  EmploymentResponse,
  ContractDetailsFormPayload,
  SelectCountrySuccess,
  SelectCountryFormPayload,
  NormalizedFieldError,
  EngagementAgreementDetailsFormPayload,
  ZendeskTriggerButton,
  zendeskArticles,
} from '@remoteoss/remote-flows';
import React, { useState } from 'react';
import {
  Card,
  FullScreenDialog,
  FullScreenDialogContent,
  Button,
} from '@remoteoss/remote-flows/internals';
import { EmploymentAgreementInfoModal } from './EmploymentAgreementInfoModal';
import { ReviewOnboardingStep } from './ReviewOnboardingStep';
import { OnboardingAlertStatuses } from './OnboardingAlertStatuses';
import { RemoteFlows } from './RemoteFlows';
import { AlertError } from './AlertError';
import { transformHtmlToComponents } from './utils/transformHtml';
import { sanitizeHtml } from '@remoteoss/remote-flows/internals';
import { downloadFile } from './utils';
import './css/main.css';
import { components } from './Components';

const BenefitsAboutSection = ({
  description,
  url,
}: {
  description?: string;
  url?: string;
}) => {
  if (!description) {
    return null;
  }

  return (
    <Card className='space-y-4 p-6 mb-4'>
      <h2 className='text-xl font-semibold text-gray-900'>About</h2>
      <div
        className='prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed space-y-4'
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
      {url && (
        <p className='text-xs text-gray-700 leading-relaxed space-y-4'>
          Want more details on benefits?{' '}
          <a
            href={url}
            className='inline-block text-blue-600 hover:text-blue-700 hover:underline text-xs mt-2'
            target='_blank'
            rel='noopener noreferrer'
          >
            Check our guide
          </a>
        </p>
      )}
    </Card>
  );
};
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
    <div className='rmt-invitation-section'>
      <h2 className='rmt-invitation-title'>{title}</h2>
      <p className='rmt-invitation-description'>{description}</p>
      {children}
    </div>
  );
};

type MultiStepFormProps = {
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  components: OnboardingRenderProps['components'];
};

const MultiStepForm = ({ components, onboardingBag }: MultiStepFormProps) => {
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
    SelectCountryStep,
    EngagementAgreementDetailsStep,
    PreviewEmploymentAgreementStep,
  } = components;
  const [errors, setErrors] = useState<{
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }>({
    apiError: '',
    fieldErrors: [],
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
            onError={({
              error,
              fieldErrors,
            }: {
              error: Error;
              fieldErrors: NormalizedFieldError[];
            }) => setErrors({ apiError: error.message, fieldErrors })}
          />
          <div className='buttons-container'>
            <SubmitButton className='submit-button' variant='outline'>
              Continue
            </SubmitButton>
          </div>
        </>
      );
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
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Create Employment & Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'engagement_agreement_details':
      return (
        <>
          <EngagementAgreementDetailsStep
            onSubmit={(payload: EngagementAgreementDetailsFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
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
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Continue
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
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );

    case 'benefits': {
      // Example: Access schema-level presentation metadata
      const benefitsPresentation = onboardingBag.meta.presentation;

      return (
        <div className='benefits-container'>
          <BenefitsAboutSection
            description={benefitsPresentation?.description as string}
            url={benefitsPresentation?.url as string}
          />

          <BenefitsStep
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
            <BackButton
              className='back-button'
              onClick={() => setErrors({ apiError: '', fieldErrors: [] })}
            >
              Previous Step
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
    }
    case 'employment_agreement_preview': {
      const pdfContent = onboardingBag.employmentAgreementPreview?.content;
      const pdfUrl = pdfContent
        ? `${pdfContent as unknown as string}#view=FitV&toolbar=0`
        : undefined;

      const handleDownload = () => {
        if (pdfContent) {
          downloadFile(
            pdfContent as unknown as string,
            'employment-agreement.pdf',
          );
        }
      };

      return (
        <>
          <PreviewEmploymentAgreementStep />
          <div className='space-y-4'>
            <Button
              onClick={() => {
                setShowPreviewModal(true);
                setIsPdfLoading(true);
              }}
              className='w-full'
              variant='outline'
              disabled={!pdfContent}
            >
              Preview employment agreement
            </Button>
          </div>
          <FullScreenDialog
            open={showPreviewModal}
            onOpenChange={(open: boolean) => {
              setShowPreviewModal(open);
              if (!open) {
                setIsPdfLoading(true);
              }
            }}
          >
            <FullScreenDialogContent>
              {/* Header */}
              <div className='flex items-center justify-between px-6 py-4 border-b bg-white'>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowPreviewModal(false)}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M19 12H5M12 19l-7-7 7-7' />
                    </svg>
                  </Button>
                  <h2 className='text-lg font-semibold'>
                    Employment Agreement Preview
                  </h2>
                </div>

                {/* Right side buttons */}
                <div className='flex items-center gap-2'>
                  {/* About this preview button */}
                  <Button
                    onClick={() => setShowInfoModal(true)}
                    variant='ghost'
                    size='sm'
                    className='text-blue-600 hover:text-blue-700'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='mr-1'
                    >
                      <circle cx='12' cy='12' r='10' />
                      <path d='M12 16v-4' />
                      <path d='M12 8h.01' />
                    </svg>
                    About this preview
                  </Button>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    disabled={!pdfContent}
                    variant='outline'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='mr-2'
                    >
                      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                      <polyline points='7 10 12 15 17 10' />
                      <line x1='12' y1='15' x2='12' y2='3' />
                    </svg>
                    Download
                  </Button>
                </div>
              </div>

              {/* Full screen PDF viewer */}
              <div className='flex-1 relative bg-gray-50 overflow-hidden'>
                {isPdfLoading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-white z-10'>
                    <div className='text-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2'></div>
                      <p className='text-sm text-gray-600'>
                        Loading document...
                      </p>
                    </div>
                  </div>
                )}
                {pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className='w-full h-full border-0'
                    title='Employment Agreement Preview'
                    onLoad={() => setIsPdfLoading(false)}
                  />
                )}
              </div>
            </FullScreenDialogContent>
          </FullScreenDialog>

          {/* Info Modal */}
          <EmploymentAgreementInfoModal
            open={showInfoModal}
            onOpenChange={setShowInfoModal}
          />

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
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    }
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

/* const STEPS = [
  'Select Country',
  'Basic Information',
  'Contract Details',
  'Benefits',
  'Review & Invite',
];
 */

const getStepTitle = (
  step: OnboardingRenderProps['onboardingBag']['steps'][number],
  selectedCountryCode: string | null,
) => {
  if (
    selectedCountryCode === 'DEU' &&
    step.name === 'engagement_agreement_details'
  ) {
    return 'Labor leasing in Germany';
  }
  return step.label;
};

const getStepDescription = (
  step: OnboardingRenderProps['onboardingBag']['steps'][number],
  selectedCountryCode: string | null,
) => {
  if (
    selectedCountryCode === 'DEU' &&
    step.name === 'engagement_agreement_details'
  ) {
    return (
      <>
        Provide some details about your <strong>current workforce</strong> to
        make sure this employee is hired compliantly according to Germany’s AÜG
        labor leasing model.
        <ZendeskTriggerButton zendeskId={zendeskArticles.germanyLaborLeasing}>
          Learn more
        </ZendeskTriggerButton>
      </>
    );
  }
  return '';
};

const OnBoardingRender = ({
  onboardingBag,
  components,
}: MultiStepFormProps) => {
  const currentStepIndex = onboardingBag.stepState.currentStep.index;

  // When using dynamic_steps feature, you need to filter and use step.index for comparison
  // Otherwise, you can use the steps array directly with sequential indices
  //const stepTitle = STEPS[currentStepIndex];
  const stepTitle = getStepTitle(
    onboardingBag.steps[currentStepIndex],
    onboardingBag.selectedCountry?.code ?? null,
  );

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
  }

  const stepDescription = getStepDescription(
    onboardingBag.steps[currentStepIndex],
    onboardingBag.selectedCountry?.code ?? null,
  );

  return (
    <>
      <div className='steps-navigation'>
        <ul>
          {/* {STEPS.map((step, index) => (
            <li
              key={index}
              className={`step-item ${index === currentStepIndex ? 'active' : ''}`}
            >
              {step}
            </li>
          ))} */}
          {onboardingBag.steps
            .filter((step) => step.visible)
            .map((step, index) => (
              <li
                key={step.name}
                className={`step-item ${step.index === currentStepIndex ? 'active' : ''}`}
              >
                {index + 1}.{' '}
                {getStepTitle(
                  step,
                  onboardingBag.selectedCountry?.code ?? null,
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className='card' style={{ marginBottom: '20px' }}>
        <h1 className='heading' data-testid='onboarding-step-title'>
          {stepTitle}
        </h1>

        {stepDescription && (
          <p className='text-sm text-[#71717A]'>{stepDescription}</p>
        )}
        <MultiStepForm onboardingBag={onboardingBag} components={components} />
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
  <RemoteFlows
    proxy={{ url: window.location.origin }}
    transformHtmlToComponents={transformHtmlToComponents}
    components={components}
  >
    <OnboardingFlow
      companyId={companyId}
      type={type}
      render={OnBoardingRender}
      employmentId={employmentId}
      externalId={externalId}
      options={{
        features: ['onboarding_reserves', 'dynamic_steps', 'ea_preview'],
        jsonSchemaVersion: {
          employment_basic_information: 3,
        },
        jsonSchemaVersionByCountry: {
          ARE: {
            // United Arab Emirates
            contract_details: 3,
          },
          DEU: {
            // Germany
            contract_details: 4,
          },
          BLR: {
            // Belarus
            contract_details: 2,
          },
          CHN: {
            // China
            contract_details: 3,
          },
          CHE: {
            // Switzerland
            contract_details: 2,
          },
          CZE: {
            // Czech Republic
            contract_details: 2,
          },
          GBR: {
            // United Kingdom
            contract_details: 2,
          },
          HKG: {
            // Hong Kong
            contract_details: 2,
          },
          IND: {
            // India
            contract_details: 2,
          },
          ISL: {
            // Iceland
            contract_details: 2,
          },
          JAM: {
            // Jamaica
            contract_details: 2,
          },
          KEN: {
            // Kenya
            contract_details: 2,
          },
          LBN: {
            // Lebanon
            contract_details: 2,
          },
          MEX: {
            // Mexico
            contract_details: 2,
          },
          MUS: {
            // Mauritius
            contract_details: 2,
          },
          MYS: {
            // Malaysia
            contract_details: 2,
          },
          NGA: {
            // Nigeria
            contract_details: 2,
          },
          NLD: {
            // Netherlands
            contract_details: 2,
          },
          NOR: {
            // Norway
            contract_details: 2,
          },
          NZL: {
            // New Zealand
            contract_details: 2,
          },
          PAK: {
            // Pakistan
            contract_details: 2,
          },
          PRT: {
            // Portugal
            contract_details: 3,
          },
          SAU: {
            // Saudi Arabia
            contract_details: 2,
          },
          SGP: {
            // Singapore
            contract_details: 2,
          },
          SRB: {
            // Serbia
            contract_details: 2,
          },
          SWE: {
            // Sweden
            contract_details: 2,
          },
        },
      }}
    />
  </RemoteFlows>
);

export const OnboardingForm = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    type: 'employee',
    employmentId: import.meta.env.VITE_ONBOARDING_EMPLOYMENT_ID || '', // use your own employment ID
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
      <div data-field='companyId' className='onboarding-form-group'>
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
      <div data-field='type' className='onboarding-form-group'>
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
      <div data-field='employmentId' className='onboarding-form-group'>
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
      <div data-field='externalId' className='onboarding-form-group'>
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

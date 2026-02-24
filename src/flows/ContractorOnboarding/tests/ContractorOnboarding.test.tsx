import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { ContractorOnboardingFlow } from '@/src/flows/ContractorOnboarding/ContractorOnboarding';
import {
  mockBasicInformationSchema,
  mockContractorContractDetailsSchema,
  mockContractorEmploymentResponse,
  mockContractDocumentCreatedResponse,
  mockContractDocumentSignedResponse,
  mockContractDocumentPreviewResponse,
  inviteResponse,
  filesResponseWithoutIR35,
  filesResponseWithIR35,
  fileResponseWithIR35,
  contractDocumentsResponse,
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import {
  assertRadioValue,
  fillDatePickerByTestId,
  fillRadio,
  fillSelect,
  queryClient,
  TestProviders,
} from '@/src/tests/testHelpers';
import { ContractorOnboardingRenderProps } from '@/src/flows/ContractorOnboarding/types';
import { fireEvent } from '@testing-library/react';
import {
  fillBasicInformation,
  fillContractDetails,
  fillContractorSubscription,
  fillEligibilityQuestionnaire,
  fillSignature,
  generateUniqueEmploymentId,
} from '@/src/flows/ContractorOnboarding/tests/helpers';
import { employmentUpdatedResponse } from '@/src/flows/Onboarding/tests/fixtures';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import {
  mockContractorSubscriptionWithBlockedEligibilityResponse,
  mockContractorSubscriptionWithEligibilityResponse,
  mockCOROnlyResponse,
} from '@/src/common/api/fixtures/contractors-subscriptions';
import { eorProductIdentifier } from '@/src/flows/ContractorOnboarding/constants';
import { mockBlockedEligibilityQuestionnaireResponse } from '@/src/common/api/fixtures/eligibility-questionnaire';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

// Helper component to display employment data in tests
function Review({ values }: { values: Record<string, unknown> }) {
  return (
    <div className='onboarding-values'>
      {Object.entries(values).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <pre key={key}>
              {key}: {value.join(', ')}
            </pre>
          );
        }
        if (typeof value === 'object') {
          return (
            <pre key={key}>
              {key}: {JSON.stringify(value)}
            </pre>
          );
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return (
            <pre key={key}>
              {key}: {value}
            </pre>
          );
        }

        return null;
      })}
    </div>
  );
}

const CONTRACTOR_ONBOARDING_STEPS: Record<number, string> = {
  [0]: 'Select Country',
  [1]: 'Basic Information',
  [2]: 'Pricing Plan',
  [3]: 'Eligibility Questionnaire',
  [4]: 'Choose Alternative Plan',
  [5]: 'Contract Details',
  [6]: 'Contract Preview',
  [7]: 'Review',
};

function createMockRenderImplementation(
  FormComponent: $TSFixMe,
  stepsMap: Record<number, string> = CONTRACTOR_ONBOARDING_STEPS,
) {
  return ({
    contractorOnboardingBag,
    components,
  }: ContractorOnboardingRenderProps) => {
    const currentStepIndex =
      contractorOnboardingBag.stepState.currentStep.index;

    return (
      <>
        <h1>Step: {stepsMap[currentStepIndex]}</h1>
        <FormComponent
          contractorOnboardingBag={contractorOnboardingBag}
          components={components}
        />
      </>
    );
  };
}

describe('ContractorOnboardingFlow', () => {
  const MultiStepFormWithCountry = ({
    components,
    contractorOnboardingBag,
  }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      ContractPreviewStep,
      PricingPlanStep,
      SubmitButton,
      BackButton,
      OnboardingInvite,
      SelectCountryStep,
      ContractReviewButton,
      ChooseAlternativePlanStep,
    } = components;

    if (contractorOnboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (contractorOnboardingBag.stepState.currentStep.name) {
      case 'select_country':
        return (
          <>
            <SelectCountryStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <div className='buttons-container'>
              <SubmitButton className='submit-button'>Continue</SubmitButton>
            </div>
          </>
        );
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_details':
        return (
          <>
            <ContractDetailsStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_preview':
        return (
          <>
            <ContractPreviewStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <ContractReviewButton
              render={({ reviewCompleted }: { reviewCompleted: boolean }) =>
                reviewCompleted ? 'Continue' : 'Review'
              }
            />
          </>
        );
      case 'pricing_plan':
        return (
          <>
            <PricingPlanStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'choose_alternative_plan':
        return (
          <>
            <ChooseAlternativePlanStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'review':
        return (
          <div className='contractor-onboarding-review'>
            <h2 className='title'>Review</h2>
            <h2 className='title'>Basic Information</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values?.basic_information ||
                {}
              }
            />
            <h2 className='title'>Pricing Plan</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values
                  ?.pricing_plan_details || {}
              }
            />
            <h2 className='title'>Contract Details</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values?.contract_details || {}
              }
            />
            <BackButton>Back</BackButton>
            <OnboardingInvite
              render={() => 'Invite Contractor'}
              onSuccess={mockOnSuccess}
            />
          </div>
        );
    }

    return null;
  };

  const MultiStepFormWithoutCountry = ({
    components,
    contractorOnboardingBag,
  }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      ContractPreviewStep,
      PricingPlanStep,
      EligibilityQuestionnaireStep,
      SubmitButton,
      BackButton,
      OnboardingInvite,
      ContractReviewButton,
      ChooseAlternativePlanStep,
    } = components;

    if (contractorOnboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (contractorOnboardingBag.stepState.currentStep.name) {
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'pricing_plan':
        return (
          <>
            <PricingPlanStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'eligibility_questionnaire':
        return (
          <>
            <EligibilityQuestionnaireStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'choose_alternative_plan':
        return (
          <>
            <ChooseAlternativePlanStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_details':
        return (
          <>
            <ContractDetailsStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_preview':
        return (
          <>
            <ContractPreviewStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <ContractReviewButton
              render={({ reviewCompleted }: { reviewCompleted: boolean }) =>
                reviewCompleted ? 'Continue' : 'Review'
              }
            />
          </>
        );

      case 'review':
        return (
          <div className='contractor-onboarding-review'>
            <h2 className='title'>Review</h2>
            <h2 className='title'>Basic Information</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values?.basic_information ||
                {}
              }
            />
            <h2 className='title'>Pricing Plan</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values
                  ?.pricing_plan_details || {}
              }
            />
            <h2 className='title'>Contract Details</h2>
            <Review
              values={
                contractorOnboardingBag.stepState.values?.contract_details || {}
              }
            />
            <BackButton>Back</BackButton>
            <OnboardingInvite
              render={() => 'Invite Contractor'}
              onSuccess={mockOnSuccess}
            />
          </div>
        );
    }

    return null;
  };

  const mockRender = vi.fn(
    createMockRenderImplementation(MultiStepFormWithCountry),
  );

  const defaultProps = {
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockRender.mockReset();

    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id;

        if (!employmentId) {
          return HttpResponse.json(
            { error: 'Employment not found' },
            { status: 404 },
          );
        }

        return HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              id: employmentId,
            },
          },
        });
      }),
      http.get('*/v1/countries/*/contractor_basic_information*', () => {
        return HttpResponse.json(mockBasicInformationSchema);
      }),
      http.get('*/v1/countries/*/contractor-contract-details*', () => {
        return HttpResponse.json(mockContractorContractDetailsSchema);
      }),
      http.get('*/v1/contractors/employments/*/contract-documents/*', () => {
        return HttpResponse.json(mockContractDocumentPreviewResponse);
      }),
      http.post('*/v1/employments', () => {
        return HttpResponse.json(mockContractorEmploymentResponse);
      }),
      http.post('*/v1/contractors/employments/*/contract-documents', () => {
        return HttpResponse.json(mockContractDocumentCreatedResponse);
      }),
      http.post(
        '*/v1/contractors/employments/*/contract-documents/*/sign',
        () => {
          return HttpResponse.json(mockContractDocumentSignedResponse);
        },
      ),
      http.post('*/v1/employments/*/invite', () => {
        return HttpResponse.json(inviteResponse);
      }),
      http.patch('*/v1/employments/*', async () => {
        return HttpResponse.json(employmentUpdatedResponse);
      }),
      // Mock the files list endpoint
      http.get(`*/v1/employments/*/files`, ({ request }) => {
        const url = new URL(request.url);
        const subType = url.searchParams.get('sub_type');

        if (subType === 'ir_35') {
          return HttpResponse.json(filesResponseWithIR35);
        }
        return HttpResponse.json(filesResponseWithoutIR35);
      }),

      // Mock the individual file fetch endpoint
      http.get(`*/v1/files/*`, () => {
        return HttpResponse.json(fileResponseWithIR35);
      }),

      http.get('*/v1/employments/*/contract-documents', () => {
        return HttpResponse.json(contractDocumentsResponse);
      }),
    );
  });

  async function fillCountry(country: string) {
    await screen.findByText(/Step: Select Country/i);

    await fillSelect('Country', country);

    const nextButton = screen.getByText(/Continue/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Basic Information/i);
  }

  it('should skip rendering the select country step when skipSteps is provided', async () => {
    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);
  });

  it('should select a country and advance to the next step', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await fillCountry('PRT');
  });

  it('should set provisional_start_date in the statement of work when using the form for the first time', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('PRT');

    // setting same value that the mock receives
    await fillBasicInformation({
      provisionalStartDate: '2025-11-26',
    });

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    const serviceDurationInput = await screen.findByTestId(
      'service_duration.provisional_start_date',
    );
    // this value comes from the HTTP mocked call
    expect(serviceDurationInput).toHaveValue('2025-11-26');
  });

  it('should call POST /employments when country is changed and basic information is resubmitted', async () => {
    const postSpy = vi.fn();

    server.use(
      http.post('*/v1/employments', async ({ request }) => {
        const requestBody = await request.json();
        postSpy(requestBody);
        return HttpResponse.json(mockContractorEmploymentResponse);
      }),
    );

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await fillCountry('PRT');

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation({
      fullName: 'John Doe Portugal',
      personalEmail: 'john.portugal@example.com',
      workEmail: 'john.portugal@remote.com',
      jobTitle: 'Software Engineer',
    });

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);
    await fillContractorSubscription();

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
    expect(postSpy.mock.calls[0][0]).toMatchObject({
      country_code: 'PRT',
      type: 'contractor', // ✅ Verify contractor type
    });

    let backButton = screen.getByRole('button', { name: 'Back' });
    backButton.click();
    await screen.findByText(/Step: Pricing Plan/i);

    backButton = screen.getByRole('button', { name: 'Back' });
    backButton.click();
    await screen.findByText(/Step: Basic Information/i);

    await fillCountry('ESP');

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    // Verify second POST was called with Spain
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledTimes(2);
    });
    expect(postSpy.mock.calls[1][0]).toMatchObject({
      country_code: 'ESP',
      type: 'contractor',
    });
  });

  it('should call PATCH when resubmitting basic information', async () => {
    const patchSpy = vi.fn();

    server.use(
      http.patch('*/v1/employments/*', () => {
        patchSpy();
        return HttpResponse.json(employmentUpdatedResponse);
      }),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        {...defaultProps}
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledTimes(1);
    });

    await screen.findByText(/Step: Pricing Plan/i);
  });

  it('should create contract document when submitting contract details', async () => {
    const postContractDocumentSpy = vi.fn();

    server.use(
      http.post(
        '*/v1/contractors/employments/*/contract-documents',
        async ({ request }) => {
          const requestBody = await request.json();
          postContractDocumentSpy(requestBody);
          return HttpResponse.json(mockContractDocumentCreatedResponse);
        },
      ),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    // Verify contract document was created
    await waitFor(() => {
      expect(postContractDocumentSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should sign contract document when submitting contract preview', async () => {
    const signContractDocumentSpy = vi.fn();

    server.use(
      http.post(
        '*/v1/contractors/employments/*/contract-documents/*/sign',
        async ({ request }) => {
          const requestBody = await request.json();
          signContractDocumentSpy(requestBody);
          return HttpResponse.json(mockContractDocumentSignedResponse);
        },
      ),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillSignature();

    // Mock signature field would be here in real scenario
    nextButton = screen.getByText(/Continue/i);
    nextButton.click();

    // Verify contract was signed
    await waitFor(() => {
      expect(signContractDocumentSpy).toHaveBeenCalledTimes(1);
    });
  });

  it.each(['invited'])(
    'should automatically navigate to review step when employment status is %s and display employment data',
    async (status) => {
      const employmentId = generateUniqueEmploymentId();
      server.use(
        http.get(`*/v1/employments/${employmentId}`, () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: employmentId,
                status: status,
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          employmentId={employmentId}
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        {
          wrapper: TestProviders,
        },
      );

      // Should automatically go to review step
      await screen.findByText(/Step: Review/i);

      // Verify basic information data is displayed in the Review component
      expect(screen.getByText('name: Gabriel')).toBeInTheDocument();

      // Verify email is displayed
      expect(
        screen.getByText('email: john.doe@example.com'),
      ).toBeInTheDocument();

      // Verify job title is displayed
      expect(screen.getByText('job_title: pm')).toBeInTheDocument();
    },
  );

  it('should not show intermediate steps when automatically navigating to review (no flickering)', async () => {
    const renderSequence: Array<{ isLoading: boolean; step?: string }> = [];
    const employmentId = generateUniqueEmploymentId();
    server.use(
      http.get(`*/v1/employments/${employmentId}`, () => {
        return HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              id: employmentId,
              status: 'invited', // This should trigger auto-navigation to review
              contract_details: {
                service_duration: {
                  provisional_start_date: '2025-11-26',
                },
                payment_terms: {
                  compensation_currency_code: 'USD',
                  rate: 5000,
                  rate_unit: 'monthly',
                },
              },
            },
          },
        });
      }),
    );

    mockRender.mockImplementation(
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const currentStepName = CONTRACTOR_ONBOARDING_STEPS[currentStepIndex];

        // Track every step that gets rendered
        if (!contractorOnboardingBag.isLoading && currentStepName) {
          renderSequence.push({
            isLoading: contractorOnboardingBag.isLoading,
            step: contractorOnboardingBag.isLoading
              ? undefined
              : currentStepName,
          });
        }

        // Return the current step or loading state
        if (contractorOnboardingBag.isLoading) {
          return <div data-testid='spinner'>Loading...</div>;
        }

        return (
          <>
            <h1>Step: {currentStepName}</h1>
            <MultiStepFormWithoutCountry
              contractorOnboardingBag={contractorOnboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <ContractorOnboardingFlow
        employmentId={employmentId}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper: TestProviders,
      },
    );

    // Should go directly to review step
    await screen.findByText(/Step: Review/i);

    // Filter out just the non-loading renders to see what steps were actually shown
    const nonLoadingRenders = renderSequence
      .filter((render) => !render.isLoading)
      .map((render) => render.step);

    // Should only show Review step, never any intermediate steps
    expect(nonLoadingRenders).toEqual(['Review']);

    // Verify the sequence: should be loading states followed by Review only
    const hasIntermediateSteps = renderSequence.some(
      (render) => !render.isLoading && render.step !== 'Review',
    );

    expect(hasIntermediateSteps).toBe(false);
  });

  it('should send external_id when creating employment for the first time', async () => {
    const postSpy = vi.fn();
    const testExternalId = 'test-contractor-external-id-123';

    server.use(
      http.post('*/v1/employments', async ({ request }) => {
        const requestBody = await request.json();
        postSpy(requestBody);
        return HttpResponse.json(mockContractorEmploymentResponse);
      }),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
        externalId={testExternalId}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    // Verify POST was called with external_id
    expect(postSpy).toHaveBeenCalledTimes(1);
    const requestPayload = postSpy.mock.calls[0][0];

    expect(requestPayload).toMatchObject({
      basic_information: expect.any(Object),
      type: 'contractor',
      country_code: 'PRT',
      external_id: testExternalId,
    });
  });

  it('should handle 422 validation errors with field errors when creating employment', async () => {
    server.use(
      http.post('*/v1/employments', () => {
        return HttpResponse.json(
          {
            errors: {
              email: ['has already been taken'],
            },
          },
          { status: 422 },
        );
      }),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    // Wait for the error to be called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // Verify we stay on the same step (don't advance)
    await screen.findByText(/Step: Basic Information/i);
  });

  it("should invite the contractor when the user clicks on the 'Invite Contractor' button", async () => {
    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);
    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillSignature();

    nextButton = screen.getByText(/Continue/i);
    nextButton.click();

    await screen.findByText(/Step: Review/i);

    const inviteContractorButton = screen.getByText(/Invite Contractor/i);
    expect(inviteContractorButton).toBeInTheDocument();

    fireEvent.click(inviteContractorButton);

    // Wait for success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        data: inviteResponse,
        employmentStatus: 'invited',
      });
    });
  });

  it('should override field labels using jsfModify options', async () => {
    const customLabel = 'Custom Contractor Field Label';

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            basic_information: {
              fields: {
                name: {
                  title: customLabel,
                },
              },
            },
          },
        }}
      />,
      {
        wrapper: TestProviders,
      },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitFor(() => {
      const labelElement = screen.getByLabelText(customLabel);
      expect(labelElement).toBeInTheDocument();
    });
  });

  it('should display description message when service_duration.provisional_start_date differs from employment provisional_start_date', async () => {
    const employmentId = generateUniqueEmploymentId();

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        employmentId={employmentId}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper: TestProviders,
      },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);
    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify the field is pre-filled with the value from the mock (2025-11-26)
    const serviceStartDateInput = await screen.findByTestId(
      'service_duration.provisional_start_date',
    );
    expect(serviceStartDateInput).toHaveValue('2025-11-26');

    // Change the date to a different value
    await fillDatePickerByTestId(
      '2025-12-01',
      'service_duration.provisional_start_date',
    );

    // Verify the description message appears
    await waitFor(() => {
      const description = screen.getByText(
        /This date does not match the date you provided in the Basic Information step - 2025-11-26 - and will override it only when both parties have signed the contract/i,
      );
      expect(description).toBeInTheDocument();
    });
  });

  it('should customize multiple contract preview fields simultaneously using jsfModify options', async () => {
    const customHeaderTitle = 'Sign the Agreement';
    const customStatementTitle = 'Please review the document';
    const customSignatureTitle = 'Digital Signature';

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            contract_preview: {
              fields: {
                contract_preview_header: {
                  title: customHeaderTitle,
                },
                contract_preview_statement: {
                  title: customStatementTitle,
                },
                signature: {
                  title: customSignatureTitle,
                },
              },
            },
          },
        }}
      />,
      {
        wrapper: TestProviders,
      },
    );

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);
    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    // Verify all custom titles are displayed
    await waitFor(() => {
      expect(screen.getByText(customHeaderTitle)).toBeInTheDocument();
      expect(screen.getByText(customStatementTitle)).toBeInTheDocument();
    });

    await fillSignature(undefined, customSignatureTitle);

    // After completing the review, signature field should be visible with custom title
    await waitFor(() => {
      expect(screen.getByLabelText(customSignatureTitle)).toBeInTheDocument();
    });
  });

  it('should display standard CSA disclaimer in contract details step when subscription is standard', async () => {
    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    await fillContractorSubscription();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      const elements = screen.getAllByText(/Contractor Services Agreement/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should pre-select Contractor Management Plus when employment has contractor_type plus', async () => {
    const employmentId = generateUniqueEmploymentId();

    server.use(
      http.get(`*/v1/employments/${employmentId}`, () => {
        return HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              id: employmentId,
              contractor_type: 'plus',
            },
          },
        });
      }),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        employmentId={employmentId}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    // Verify that Contractor Management Plus is pre-selected
    await waitFor(() => {
      const plusRadio = screen.getByRole('radio', {
        name: /Contractor Management Plus/i,
      });
      expect(plusRadio).toBeChecked();
    });
  });

  describe('Saudi Arabia edge case', () => {
    it('should correctly retrieve saudi nationality status from employment.contract_details.nationality', async () => {
      const employmentId = generateUniqueEmploymentId();

      server.use(
        http.get(`*/v1/employments/${employmentId}`, () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: employmentId,
                country: {
                  code: 'SAU',
                  name: 'Saudi Arabia',
                },
                contract_details: {
                  nationality: 'national',
                },
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          employmentId={employmentId}
          countryCode='SAU'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await assertRadioValue(
        'Is your contractor a Saudi Arabia national',
        'Yes',
      );
    });
  });

  describe('UK edge case', () => {
    it('should show file upload field when ir35 status is inside or outside', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      // Select 'inside' IR35 status using fillSelect helper
      await fillSelect('ir35', 'inside');

      // Verify file upload field appears
      await waitFor(() => {
        const fileUploadField = screen.getByLabelText(/Upload SDS/i);
        expect(fileUploadField).toBeInTheDocument();
      });
    });

    it('should call createContractorContractDocumentMutationAsync and uploadFileMutationAsync with correct payload when submitting with ir35', async () => {
      const postSpy = vi.fn();
      const contractDocumentSpy = vi.fn();
      const uploadSpy = vi.fn();

      server.use(
        http.post('*/v1/employments', async ({ request }) => {
          const requestBody = await request.json();
          postSpy(requestBody);
          return HttpResponse.json(mockContractorEmploymentResponse);
        }),
        http.post(
          '*/v1/contractors/employments/*/contract-documents',
          async ({ request }) => {
            const requestBody = await request.json();
            contractDocumentSpy(requestBody);
            return HttpResponse.json(mockContractDocumentCreatedResponse);
          },
        ),
        http.post('*/v1/documents', async () => {
          uploadSpy();
          return HttpResponse.json({
            data: {
              file: {
                id: 'ad8a15a5-88a5-4fb6-9225-2c4ec3e9a809',
                name: 'Juan Carlos de Espana - Laurence Debray.pdf',
                type: 'other',
                inserted_at: '2026-01-16T15:33:28Z',
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      // Fill basic information with IR35
      await fillBasicInformation();

      // Select IR35 status
      const ir35Select = screen.getByLabelText(/IR35 Status/i);
      fireEvent.change(ir35Select, { target: { value: 'inside' } });

      // Upload file
      const file = new File(['test content'], 'test-sds.pdf', {
        type: 'application/pdf',
      });
      const fileInput = screen.getByLabelText(/Upload SDS/i);
      fireEvent.change(fileInput, { target: { files: [file] } });

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await waitFor(() => {
        expect(uploadSpy).toHaveBeenCalled();
        expect(contractDocumentSpy).toHaveBeenCalled();
        expect(contractDocumentSpy.mock.calls[0][0]).toMatchObject({
          contract_document: {
            ir_35: 'inside',
          },
        });
      });

      await screen.findByText(/Step: Pricing Plan/i);
    });

    it('should correctly retrieve ir35 data from employment.contract_details.ir_35', async () => {
      const employmentId = generateUniqueEmploymentId();

      server.use(
        http.get(`*/v1/employments/${employmentId}`, () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: employmentId,
                country: {
                  code: 'GBR',
                  name: 'United Kingdom',
                },
                contract_details: {
                  ir_35: 'inside',
                },
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          employmentId={employmentId}
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      // Verify IR35 field is pre-filled with the value from employment
      await waitFor(() => {
        const ir35Select = screen.getByLabelText(
          /IR35 Status/i,
        ) as HTMLSelectElement;
        expect(ir35Select).toBeInTheDocument();
        expect(ir35Select.value).toBe('inside');
      });
    });

    it('should not show file upload field when ir35 status is exempt', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      // Select 'exempt' IR35 status
      const ir35Select = screen.getByLabelText(/IR35 Status/i);
      fireEvent.change(ir35Select, { target: { value: 'exempt' } });

      // Verify file upload field does NOT appear
      await waitFor(() => {
        const fileUploadField = screen.queryByLabelText(/Upload SDS/i);
        expect(fileUploadField).not.toBeInTheDocument();
      });
    });

    it('should correctly retrieve and display ir35 file from employment when editing', async () => {
      const employmentId = 'e54e2ab8-291b-4406-9aa0-6e720bdefbbb';
      const fileName = 'test-sds.pdf';

      // Mock the employment response
      server.use(
        http.get(`*/v1/employments/${employmentId}`, () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: employmentId,
                country: {
                  code: 'GBR',
                  name: 'United Kingdom',
                },
                contract_details: {
                  ir_35: 'inside',
                },
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          employmentId={employmentId}
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      // Verify IR35 field is pre-filled
      await waitFor(() => {
        const ir35Select = screen.getByLabelText(
          /IR35 Status/i,
        ) as HTMLSelectElement;
        expect(ir35Select.value).toBe('inside');
      });

      // Verify file upload field shows the existing file
      await waitFor(() => {
        const fileDisplay = screen.getByText(new RegExp(fileName, 'i'));
        expect(fileDisplay).toBeInTheDocument();
      });
    });

    it('should not call uploadFileMutationAsync when ir35 status is exempt', async () => {
      const postSpy = vi.fn();
      const contractDocumentSpy = vi.fn();
      const uploadSpy = vi.fn();

      server.use(
        http.post('*/v1/employments', async ({ request }) => {
          const requestBody = await request.json();
          postSpy(requestBody);
          return HttpResponse.json(mockContractorEmploymentResponse);
        }),
        http.post(
          '*/v1/contractors/employments/*/contract-documents',
          async ({ request }) => {
            const requestBody = await request.json();
            contractDocumentSpy(requestBody);
            return HttpResponse.json(mockContractDocumentCreatedResponse);
          },
        ),
        http.post('*/v1/documents', async () => {
          uploadSpy();
          return HttpResponse.json({
            data: {
              file: {
                id: 'ad8a15a5-88a5-4fb6-9225-2c4ec3e9a809',
                name: 'test-file.pdf',
                type: 'other',
                inserted_at: '2026-01-16T15:33:28Z',
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='GBR'
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      // Fill basic information
      await fillBasicInformation();

      // Select IR35 status as 'exempt' (no file upload required)
      const ir35Select = screen.getByLabelText(/IR35 Status/i);
      fireEvent.change(ir35Select, { target: { value: 'exempt' } });

      // Verify file upload field does NOT appear
      await waitFor(() => {
        const fileUploadField = screen.queryByLabelText(/Upload SDS/i);
        expect(fileUploadField).not.toBeInTheDocument();
      });

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await waitFor(() => {
        // Verify contract document was created with exempt status
        expect(contractDocumentSpy).toHaveBeenCalled();

        // Verify file upload was NOT called
        expect(uploadSpy).not.toHaveBeenCalled();
      });

      await screen.findByText(/Step: Pricing Plan/i);
    });
  });

  describe('COR Eligibility Questionnaire', () => {
    it('should show eligibility questionnaire step when COR is selected', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          skipSteps={['select_country']}
          countryCode='PRT'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await fillContractorSubscription('Contractor of Record');

      nextButton = screen.getByText(/Next Step/i);

      nextButton.click();

      await screen.findByText(/Step: Eligibility Questionnaire/i);
    });

    it('should submit eligibility form and advance to contract details', async () => {
      const eligibilitySpy = vi.fn();

      server.use(
        http.post(
          '*/v1/contractors/eligibility-questionnaire',
          async ({ request }) => {
            const requestBody = await request.json();
            eligibilitySpy(requestBody);
            return HttpResponse.json(mockBaseResponse);
          },
        ),
        http.post(
          '*/v1/contractors/employments/*/contractor-cor-subscription',
          async () => {
            return HttpResponse.json({ data: { status: 'ok' } });
          },
        ),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          skipSteps={['select_country']}
          countryCode='PRT'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await fillContractorSubscription('Contractor of Record');

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Eligibility Questionnaire/i);

      await fillEligibilityQuestionnaire();

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await waitFor(() => {
        expect(eligibilitySpy).toHaveBeenCalled();
        expect(eligibilitySpy).toHaveBeenCalledWith({
          employment_slug: mockContractorEmploymentResponse.data.employment.id,
          responses: {
            control_the_way_contractors_work: 'no',
            previously_hired_contractors_as_employees: 'no',
            treating_contractors_as_employees: 'no',
          },
          type: 'contractor_of_record',
        });
      });

      await screen.findByText(/Step: Contract Details/i);
    });

    it('should pre-fill eligibility form when data exists from backend', async () => {
      server.use(
        http.get(
          '*/v1/contractors/employments/*/contractor-subscriptions',
          async () => {
            return HttpResponse.json(
              mockContractorSubscriptionWithEligibilityResponse,
            );
          },
        ),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Contract Details/i);
    });

    it('should call DELETE when changing from COR to different plan', async () => {
      const deleteSpy = vi.fn();

      server.use(
        http.get(
          '*/v1/contractors/employments/*/contractor-subscriptions',
          async () => {
            return HttpResponse.json(
              mockContractorSubscriptionWithEligibilityResponse,
            );
          },
        ),
        http.delete(
          '*/v1/contractors/employments/*/contractor-cor-subscription',
          async () => {
            deleteSpy();
            return HttpResponse.json({ data: { status: 'ok' } });
          },
        ),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await fillContractorSubscription('Contractor Management Plus');

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalled();
      });

      await screen.findByText(/Step: Contract Details/i);

      expect(
        screen.queryByText(/Step: Eligibility Questionnaire/i),
      ).not.toBeInTheDocument();
    });

    it('should auto-select Contractor Standard and disable other plans when eligibility is blocked', async () => {
      server.use(
        http.get(
          '*/v1/contractors/employments/*/contractor-subscriptions',
          async () => {
            return HttpResponse.json(
              mockContractorSubscriptionWithBlockedEligibilityResponse,
            );
          },
        ),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      // Or check all three states explicitly
      const cmRadio = screen.getByRole('radio', {
        name: /^Contractor Management$/,
      });
      const cmPlusRadio = screen.getByRole('radio', {
        name: /^Contractor Management Plus$/,
      });
      const corRadio = screen.getByRole('radio', {
        name: /^Contractor of Record$/,
      });

      expect(cmRadio).toBeChecked();
      expect(cmPlusRadio).toBeDisabled();
      expect(corRadio).toBeDisabled();
    });

    it('should show choose_alternative_plan step when eligibility questionnaire is blocked and click EOR plan', async () => {
      server.use(
        http.post('*/v1/contractors/eligibility-questionnaire', async () => {
          return HttpResponse.json(mockBlockedEligibilityQuestionnaireResponse);
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await fillContractorSubscription('Contractor of Record');

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Eligibility Questionnaire/i);

      await fillEligibilityQuestionnaire();

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Choose Alternative Plan/i);

      await fillRadio('Choose a plan', 'Employer of Record');

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(4);
        expect(mockOnSuccess.mock.calls[3][0]).toEqual({
          subscription: eorProductIdentifier,
        });
      });
    });
  });

  it('should show contract_details step when eligibility questionnaire is blocked and Contractor Management plan is selected', async () => {
    server.use(
      http.post('*/v1/contractors/eligibility-questionnaire', async () => {
        return HttpResponse.json(mockBlockedEligibilityQuestionnaireResponse);
      }),
    );

    mockRender.mockImplementation(
      createMockRenderImplementation(MultiStepFormWithoutCountry),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        employmentId='test-employment-id'
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    await fillContractorSubscription('Contractor of Record');

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Eligibility Questionnaire/i);

    await fillEligibilityQuestionnaire();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Choose Alternative Plan/i);

    await fillRadio('Choose a plan', 'Contractor Management');

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    // Assert that we navigate to contract_details step
    await screen.findByText(/Step: Contract Details/i);

    // Optionally verify form fields are present
    await waitFor(() => {
      expect(
        screen.getByTestId('service_duration.provisional_start_date'),
      ).toBeInTheDocument();
    });
  });

  describe('excludeProducts', () => {
    it('should hide EOR option when excludeProducts includes "eor"', async () => {
      server.use(
        http.post('*/v1/contractors/eligibility-questionnaire', async () => {
          return HttpResponse.json(mockBlockedEligibilityQuestionnaireResponse);
        }),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          options={{ excludeProducts: ['eor'] }}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      let nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await fillContractorSubscription('Contractor of Record');

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Eligibility Questionnaire/i);

      await fillEligibilityQuestionnaire();

      nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Choose Alternative Plan/i);

      const eorOption = screen.queryByRole('radio', {
        name: /Employer of Record/i,
      });
      expect(eorOption).not.toBeInTheDocument();

      const cmOption = screen.getByRole('radio', {
        name: /Contractor Management$/,
      });
      expect(cmOption).toBeInTheDocument();
    });

    it('should hide COR option when excludeProducts includes "cor" in pricing plan', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          options={{ excludeProducts: ['cor'] }}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      const corOption = screen.queryByRole('radio', {
        name: /^Contractor of Record$/,
      });
      expect(corOption).not.toBeInTheDocument();

      const cmOption = screen.getByRole('radio', {
        name: /^Contractor Management$/,
      });
      expect(cmOption).toBeInTheDocument();
    });

    it('should hide multiple products when excludeProducts includes multiple values', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          options={{ excludeProducts: ['cor', 'cm+'] }}
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      const corOption = screen.queryByRole('radio', {
        name: /^Contractor of Record$/,
      });
      expect(corOption).not.toBeInTheDocument();

      const cmPlusOption = screen.queryByRole('radio', {
        name: /Contractor Management Plus/i,
      });
      expect(cmPlusOption).not.toBeInTheDocument();

      const cmOption = screen.getByRole('radio', {
        name: /^Contractor Management$/,
      });
      expect(cmOption).toBeInTheDocument();
    });

    it('should show all products when excludeProducts is not provided', async () => {
      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          countryCode='PRT'
          skipSteps={['select_country']}
          employmentId='test-employment-id'
          {...defaultProps}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await fillBasicInformation();

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      const corOption = screen.getByRole('radio', {
        name: /^Contractor of Record$/,
      });
      expect(corOption).toBeInTheDocument();

      const cmPlusOption = screen.getByRole('radio', {
        name: /Contractor Management Plus/i,
      });
      expect(cmPlusOption).toBeInTheDocument();

      const cmOption = screen.getByRole('radio', {
        name: /^Contractor Management$/,
      });
      expect(cmOption).toBeInTheDocument();

      const eorOption = screen.queryByRole('radio', {
        name: /Employer of Record/i,
      });
      expect(eorOption).not.toBeInTheDocument();
    });

    it('should show Employer of Record option when only COR subscription is available', async () => {
      server.use(
        http.get(
          '*/v1/contractors/employments/*/contractor-subscriptions',
          () => {
            return HttpResponse.json(mockCOROnlyResponse);
          },
        ),
      );

      mockRender.mockImplementation(
        createMockRenderImplementation(MultiStepFormWithoutCountry),
      );

      render(
        <ContractorOnboardingFlow
          {...defaultProps}
          countryCode='PRT'
          skipSteps={['select_country']}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await fillBasicInformation();

      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      await screen.findByText(/Step: Pricing Plan/i);

      await waitFor(() => {
        const eorOption = screen.getByLabelText(/Employer of Record/i);
        expect(eorOption).toBeInTheDocument();
      });
    });
  });
});

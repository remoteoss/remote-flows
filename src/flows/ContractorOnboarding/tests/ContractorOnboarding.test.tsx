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
  mockContractorSubscriptionResponse,
  mockManageSubscriptionResponse,
  mockContractDocumentPreviewResponse,
  inviteResponse,
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import {
  fillDatePickerByTestId,
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
  fillSignature,
  generateUniqueEmploymentId,
} from '@/src/flows/ContractorOnboarding/tests/helpers';
import { employmentUpdatedResponse } from '@/src/flows/Onboarding/tests/fixtures';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

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
      case 'review':
        return (
          <div className='contractor-onboarding-review'>
            <h2 className='title'>Review</h2>
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
      SubmitButton,
      BackButton,
      OnboardingInvite,
      ContractReviewButton,
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
      case 'review':
        return (
          <div className='contractor-onboarding-review'>
            <h2 className='title'>Review</h2>
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
    ({
      contractorOnboardingBag,
      components,
    }: ContractorOnboardingRenderProps) => {
      const currentStepIndex =
        contractorOnboardingBag.stepState.currentStep.index;

      const steps: Record<number, string> = {
        [0]: 'Select Country',
        [1]: 'Basic Information',
        [2]: 'Pricing Plan',
        [3]: 'Contract Details',
        [4]: 'Contract Preview',
        [5]: 'Review',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepFormWithCountry
            contractorOnboardingBag={contractorOnboardingBag}
            components={components}
          />
        </>
      );
    },
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
      http.get('*/v1/countries', () => {
        return HttpResponse.json({
          data: [
            {
              code: 'PRT',
              name: 'Portugal',
              eor_onboarding: true,
            },
            {
              code: 'ESP',
              name: 'Spain',
              eor_onboarding: true,
            },
          ],
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
      http.get(
        '*/v1/contractors/employments/*/contractor-subscriptions',
        () => {
          return HttpResponse.json(mockContractorSubscriptionResponse);
        },
      ),
      http.post(
        '*/v1/contractors/employments/*/contractor-plus-subscription',
        () => {
          return HttpResponse.json(mockManageSubscriptionResponse);
        },
      ),
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

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
    await fillCountry('Portugal');
  });

  it('should set provisional_start_date to today when using the form for the first time', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    await screen.findByText(/Step: Basic Information/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const provisionalStartDateInput = await screen.findByTestId(
      'provisional_start_date',
    );
    const today = new Date().toISOString().split('T')[0];
    expect(provisionalStartDateInput).toHaveValue(today);
  });

  it('should set provisional_start_date in the statement of work when using the form for the first time', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

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

    await fillCountry('Portugal');

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

    await fillCountry('Spain');

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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
      expect(patchSpy).toHaveBeenCalled();
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
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
    'should automatically navigate to review step when employment status is %s',
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
        ({
          contractorOnboardingBag,
          components,
        }: ContractorOnboardingRenderProps) => {
          const currentStepIndex =
            contractorOnboardingBag.stepState.currentStep.index;

          const steps: Record<number, string> = {
            [0]: 'Basic Information',
            [1]: 'Pricing Plan',
            [2]: 'Contract Details',
            [3]: 'Contract Preview',
            [4]: 'Review',
          };

          return (
            <>
              <h1>Step: {steps[currentStepIndex]}</h1>
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

      // Should automatically go to review step
      await screen.findByText(/Step: Review/i);
    },
  );

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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        {...defaultProps}
        countryCode='PRT'
        skipSteps={['select_country']}
        externalId={testExternalId}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);

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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);

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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        if (contractorOnboardingBag.isLoading) {
          return <div data-testid='spinner'>Loading...</div>;
        }

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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

    // Verify that the custom label is displayed
    const labelElement = screen.getByLabelText(customLabel);
    expect(labelElement).toBeInTheDocument();
  });

  it('should display description message when service_duration.provisional_start_date differs from employment provisional_start_date', async () => {
    const employmentId = generateUniqueEmploymentId();

    mockRender.mockImplementation(
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        if (contractorOnboardingBag.isLoading) {
          return <div data-testid='spinner'>Loading...</div>;
        }

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
        countryCode='PRT'
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper: TestProviders },
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    // Verify that Contractor Management Plus is pre-selected
    await waitFor(() => {
      const plusRadio = screen.getByRole('radio', {
        name: /Contractor Management Plus/i,
      });
      expect(plusRadio).toBeChecked();
    });
  });

  it('should load United Kingdom and verify ir35 field appears in basic information step', async () => {
    server.use(
      http.get('*/v1/countries', () => {
        return HttpResponse.json({
          data: [
            {
              code: 'GBR',
              name: 'United Kingdom',
              eor_onboarding: true,
            },
            {
              code: 'PRT',
              name: 'Portugal',
              eor_onboarding: true,
            },
          ],
        });
      }),
    );

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('United Kingdom');

    await screen.findByText(/Step: Basic Information/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    // Verify IR35 field is present
    await waitFor(() => {
      const ir35Field = screen.getByLabelText(/IR35 Status/i);
      expect(ir35Field).toBeInTheDocument();
    });
  });

  it('should show file upload field when ir35 status is inside or outside', async () => {
    mockRender.mockImplementation(
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
    await fillSelect('IR35 Status', 'Inside IR35 (deemed employee)');

    // Verify file upload field appears
    await waitFor(
      () => {
        const fileUploadField = screen.getByLabelText(/Upload SDS/i);
        expect(fileUploadField).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should call createContractorContractDocumentMutationAsync and uploadFileMutationAsync with correct payload when submitting with ir35', async () => {
    const postSpy = vi.fn();
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
          uploadSpy(requestBody);
          return HttpResponse.json(mockContractDocumentCreatedResponse);
        },
      ),
      http.post('*/v1/files/upload', async () => {
        return HttpResponse.json({
          data: {
            file: {
              id: 'test-file-id-123',
              url: 'https://example.com/file.pdf',
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

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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

    await screen.findByText(/Step: Pricing Plan/i);

    // Verify contract document mutation was called with ir35 data
    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalled();
      expect(uploadSpy.mock.calls[0][0]).toMatchObject({
        contract_document: {
          ir_35: 'inside',
        },
      });
    });
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
      ({
        contractorOnboardingBag,
        components,
      }: ContractorOnboardingRenderProps) => {
        const currentStepIndex =
          contractorOnboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Pricing Plan',
          [2]: 'Contract Details',
          [3]: 'Contract Preview',
          [4]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
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
});

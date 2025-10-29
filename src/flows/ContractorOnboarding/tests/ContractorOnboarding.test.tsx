import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi, afterEach } from 'vitest';
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
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import { fillSelect } from '@/src/tests/testHelpers';
import { ContractorOnboardingRenderProps } from '@/src/flows/ContractorOnboarding/types';
import { fireEvent } from '@testing-library/react';
import {
  fillBasicInformation,
  fillContractDetails,
  fillSignature,
  generateUniqueEmploymentId,
} from '@/src/flows/ContractorOnboarding/tests/helpers';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

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
              <SubmitButton
                className='submit-button'
                disabled={contractorOnboardingBag.isSubmitting}
              >
                Continue
              </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <SubmitButton disabled={contractorOnboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
        [2]: 'Contract Details',
        [3]: 'Contract Preview',
        [4]: 'Pricing Plan',
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
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);
  });

  it('should select a country and advance to the next step', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, { wrapper });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await fillCountry('Portugal');
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

    render(<ContractorOnboardingFlow {...defaultProps} />, { wrapper });

    await fillCountry('Portugal');

    await fillBasicInformation({
      fullName: 'John Doe Portugal',
      personalEmail: 'john.portugal@example.com',
      workEmail: 'john.portugal@remote.com',
      jobTitle: 'Software Engineer',
    });

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
    expect(postSpy.mock.calls[0][0]).toMatchObject({
      country_code: 'PRT',
      type: 'contractor', // ✅ Verify contractor type
    });

    let backButton = screen.getByRole('button', { name: 'Back' });
    backButton.click();
    await screen.findByText(/Step: Basic Information/i);

    backButton = screen.getByRole('button', { name: 'Back' });
    backButton.click();
    await screen.findByText(/Step: Select Country/i);

    await fillCountry('Spain');

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify second POST was called with Spain
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledTimes(2);
    });
    expect(postSpy.mock.calls[1][0]).toMatchObject({
      country_code: 'ESP',
      type: 'contractor',
    });
  });

  it('should NOT call PATCH when resubmitting basic information (contractors cannot be updated)', async () => {
    const patchSpy = vi.fn();

    server.use(
      http.patch('*/v1/employments/*', () => {
        patchSpy();
        return HttpResponse.json({});
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify PATCH was NOT called (contractors can't be updated)
    expect(patchSpy).not.toHaveBeenCalled();
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    await fillSignature();

    // Mock signature field would be here in real scenario
    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

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
            [1]: 'Contract Details',
            [2]: 'Contract Preview',
            [3]: 'Pricing Plan',
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
          wrapper,
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await fillContractDetails();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Preview/i);

    await fillSignature();

    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Pricing Plan/i);

    nextButton = screen.getByText(/Next Step/i);
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
          [1]: 'Contract Details',
          [2]: 'Contract Preview',
          [3]: 'Pricing Plan',
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
        wrapper,
      },
    );

    await screen.findByText(/Step: Basic Information/i);

    // Verify that the custom label is displayed
    const labelElement = screen.getByLabelText(customLabel);
    expect(labelElement).toBeInTheDocument();
  });
});

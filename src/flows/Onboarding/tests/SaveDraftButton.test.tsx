import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchema,
  benefitOffersResponse,
  benefitOffersSchema,
  companyResponse,
  contractDetailsSchema,
  employmentCreatedResponse,
  employmentResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { fillBasicInformation } from '@/src/flows/Onboarding/tests/helpers';
import {
  OnboardingFlowProps,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/types';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { defaultComponents } from '@/src/tests/defaultComponents';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import { vi } from 'vitest';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={defaultComponents}>
      {children}
    </FormFieldsProvider>
  </QueryClientProvider>
);

const mockSuccess = vi.fn();
const mockError = vi.fn();

const mockRender = vi.fn(
  ({ onboardingBag, components }: OnboardingRenderProps) => {
    const currentStepIndex = onboardingBag.stepState.currentStep.index;

    const {
      SaveDraftButton,
      BasicInformationStep,
      ContractDetailsStep,
      BenefitsStep,
      SubmitButton,
    } = components;

    const steps: Record<number, string> = {
      [0]: 'Basic Information',
      [1]: 'Contract Details',
      [2]: 'Benefits',
      [3]: 'Review',
    };

    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    // Render the appropriate step component based on current step
    switch (onboardingBag.stepState.currentStep.name) {
      case 'basic_information':
        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <BasicInformationStep
              onSubmit={vi.fn()}
              onSuccess={vi.fn()}
              onError={vi.fn()}
            />
            <SubmitButton>Next Step</SubmitButton>
            <SaveDraftButton onSuccess={mockSuccess} onError={mockError}>
              Save Draft
            </SaveDraftButton>
          </>
        );
      case 'contract_details':
        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <ContractDetailsStep
              onSubmit={vi.fn()}
              onSuccess={vi.fn()}
              onError={vi.fn()}
            />
            <SubmitButton>Next Step</SubmitButton>
            <SaveDraftButton onSuccess={mockSuccess} onError={mockError}>
              Save Draft
            </SaveDraftButton>
          </>
        );
      case 'benefits':
        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <BenefitsStep
              onSubmit={vi.fn()}
              onSuccess={vi.fn()}
              onError={vi.fn()}
            />
            <SaveDraftButton onSuccess={mockSuccess} onError={mockError}>
              Save Draft
            </SaveDraftButton>
          </>
        );
      case 'review':
        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
          </>
        );

      default:
        return null;
    }
  },
);

const defaultProps = {
  companyId: '1234',
  countryCode: 'PRT',
  options: {},
  render: mockRender,
  skipSteps: ['select_country'] as OnboardingFlowProps['skipSteps'],
};

describe('SaveDraftButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
    queryClient.clear();
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json(companyResponse);
      }),
      http.get('*/v1/countries', () => {
        return HttpResponse.json({
          data: [
            {
              code: 'PRT',
              name: 'Portugal',
            },
            {
              code: 'ESP',
              name: 'Spain',
            },
          ],
        });
      }),
      http.get('*/v1/countries/PRT/employment_basic_information*', () => {
        return HttpResponse.json(basicInformationSchema);
      }),
      http.get('*/v1/countries/PRT/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchema);
      }),
      http.get('*/v1/employments/:id', ({ params }) => {
        // Create a response with the actual employment ID from the request
        const employmentId = params?.id;
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: employmentId,
            },
          },
        });
      }),
      http.get('*/v1/employments/*/benefit-offers/schema', () => {
        return HttpResponse.json(benefitOffersSchema);
      }),
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(benefitOffersResponse);
      }),
      http.post('*/v1/employments', () => {
        return HttpResponse.json(employmentCreatedResponse);
      }),
      http.post('*/v1/employments/*/contract-eligibility', () => {
        return HttpResponse.json({ data: { status: 'ok' } });
      }),
      http.patch('*/v1/employments/*', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
      http.put('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );
  });

  it('should render the SaveDraftButton component with default text', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/);

    const button = await screen.findByText(/Save Draft/i);
    expect(button).toBeInTheDocument();
  });

  it('should trigger the form validation when save draft is clicked', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(5);
    });
  });

  it('should call onSuccess when save draft is successful for basic information step', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i); // This should work now

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });
  });

  it('should not advance to next step when save draft is clicked', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
    });

    expect(screen.getByText(/Step: Basic Information/i)).toBeInTheDocument();
  });

  it('should call onError when save draft fails', async () => {
    server.use(
      http.post('*/v1/employments', () => {
        return HttpResponse.json(
          { error: 'Failed to save draft' },
          { status: 400 },
        );
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  it('should call onError with correct error structure when save draft fails with 422', async () => {
    server.use(
      http.post('*/v1/employments', () => {
        return HttpResponse.json(
          {
            message: 'Validation failed',
            errors: {
              provisional_start_date: ['cannot be in a holiday'],
            },
          },
          { status: 422 },
        );
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith({
        error: new Error('Validation failed'),
        rawError: {
          message: 'Validation failed',
          errors: {
            provisional_start_date: ['cannot be in a holiday'],
          },
        },
        fieldErrors: [
          {
            field: 'provisional_start_date',
            messages: ['cannot be in a holiday'],
            userFriendlyLabel: 'Provisional start date',
          },
        ],
      });
    });
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it('should disable button when disabled prop is passed', async () => {
    mockRender.mockImplementationOnce(({ components }) => {
      const { SaveDraftButton } = components;
      return (
        <SaveDraftButton
          disabled={true}
          onSuccess={mockSuccess}
          onError={mockError}
        >
          Save Draft
        </SaveDraftButton>
      );
    });

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Save Draft/i);
    expect(button).toBeDisabled();
  });

  it('should disable button when onboardingBag.isSubmitting is true', async () => {
    server.use(
      http.post('*/v1/employments', () => {
        // Return a delayed response to keep the mutation pending
        return new Promise(() => {}); // Never resolves to keep pending
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    // Navigate to contract details step
    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    expect(saveDraftButton).toBeInTheDocument();

    fireEvent.click(saveDraftButton);

    // Wait a bit and check if button becomes disabled
    await waitFor(() => {
      expect(saveDraftButton).toBeDisabled();
    });
  });

  it('should show custom children text when provided', async () => {
    mockRender.mockImplementationOnce(({ components }) => {
      const { SaveDraftButton } = components;
      return (
        <SaveDraftButton
          className='custom-class'
          onSuccess={mockSuccess}
          onError={mockError}
        >
          Custom Save Text
        </SaveDraftButton>
      );
    });

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Custom Save Text/i);
    expect(button).toHaveTextContent('Custom Save Text');
    expect(button).toHaveClass('custom-class');
  });

  describe('custom button component support', () => {
    const MockCustomButton = vi.fn(
      ({ children, onClick, disabled, ...props }) => (
        <button onClick={onClick} disabled={disabled} {...props}>
          {children}
        </button>
      ),
    );

    beforeEach(() => {
      MockCustomButton.mockClear();
    });

    const customWrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider
          components={{ ...defaultComponents, button: MockCustomButton }}
        >
          {children}
        </FormFieldsProvider>
      </QueryClientProvider>
    );

    it('should use custom button when provided via FormFieldsProvider', async () => {
      mockRender.mockImplementation(({ components }) => {
        const { SaveDraftButton } = components;
        return (
          <SaveDraftButton
            onSuccess={mockSuccess}
            onError={mockError}
            disabled={true}
            className='test-class'
          >
            Save Draft
          </SaveDraftButton>
        );
      });

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByText(/Save Draft/i);
      expect(customButton).toBeInTheDocument();

      // Verify custom button received correct props
      expect(MockCustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          className: 'test-class',
          disabled: true,
          onClick: expect.any(Function),
          children: 'Save Draft',
        }),
        {},
      );
    });

    it('should handle onClick correctly with custom button', async () => {
      mockRender.mockImplementationOnce(({ components }) => {
        const { SaveDraftButton } = components;
        return (
          <SaveDraftButton onSuccess={mockSuccess} onError={mockError}>
            Save Draft
          </SaveDraftButton>
        );
      });

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      await screen.findByText(/Step: Basic Information/i);

      await fillBasicInformation();

      const customButton = await screen.findByText(/Save Draft/i);
      fireEvent.click(customButton);

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalled();
      });
    });

    it('should disable custom button during mutation loading', async () => {
      server.use(
        http.post('*/v1/employments', () => {
          // Return a delayed response to keep the mutation pending
          return new Promise(() => {}); // Never resolves to keep pending
        }),
      );

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      await screen.findByText(/Step: Basic Information/i);

      await fillBasicInformation();

      const customButton = await screen.findByText(/Save Draft/i);
      expect(customButton).not.toBeDisabled(); // Initially not disabled

      fireEvent.click(customButton);

      // Wait for the button to become disabled due to pending mutation
      await waitFor(() => {
        expect(MockCustomButton).toHaveBeenCalledWith(
          expect.objectContaining({
            disabled: true,
          }),
          {},
        );
      });
    });
  });
});

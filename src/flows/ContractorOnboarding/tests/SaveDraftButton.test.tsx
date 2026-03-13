import { ContractorOnboardingFlow } from '@/src/flows/ContractorOnboarding/ContractorOnboarding';
import {
  mockContractorEmploymentResponse,
  mockContractorContractDetailsSchema,
  inviteResponse,
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import {
  fillBasicInformation,
  generateUniqueEmploymentId,
} from '@/src/flows/ContractorOnboarding/tests/helpers';
import {
  ContractorOnboardingFlowProps,
  ContractorOnboardingRenderProps,
} from '@/src/flows/ContractorOnboarding/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import { companyResponse } from '@/src/flows/Onboarding/tests/fixtures';
import { mockCOROnlyResponse } from '@/src/common/api/fixtures/contractors-subscriptions';

const mockSuccess = vi.fn();
const mockError = vi.fn();

const mockRender = vi.fn(
  ({
    contractorOnboardingBag,
    components,
  }: ContractorOnboardingRenderProps) => {
    const currentStepIndex =
      contractorOnboardingBag.stepState.currentStep.index;

    const {
      SaveDraftButton,
      BasicInformationStep,
      SelectCountryStep,
      SubmitButton,
    } = components;

    const steps: Record<number, string> = {
      [0]: 'Select Country',
      [1]: 'Basic Information',
      [2]: 'Pricing Plan',
      [3]: 'Eligibility Questionnaire',
      [4]: 'Contract Details',
      [5]: 'Contract Preview',
      [6]: 'Review',
    };

    if (contractorOnboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (contractorOnboardingBag.stepState.currentStep.name) {
      case 'select_country':
        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <SelectCountryStep
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
      default:
        return null;
    }
  },
);

const defaultProps = {
  countryCode: 'PRT',
  options: {},
  render: mockRender,
  skipSteps: ['select_country'] as ContractorOnboardingFlowProps['skipSteps'],
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
      http.get('*/v1/countries/PRT/employment_basic_information*', () => {
        return HttpResponse.json(mockBaseResponse);
      }),
      http.get('*/v1/countries/PRT/contract_details*', () => {
        return HttpResponse.json(mockContractorContractDetailsSchema);
      }),
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id;
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
      http.post('*/v1/employments', () => {
        return HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              id: generateUniqueEmploymentId(),
            },
          },
        });
      }),
      http.patch('*/v1/employments/*', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
      http.post('*/v1/employments/*/invite', () => {
        return HttpResponse.json(inviteResponse);
      }),
      http.get('*/v1/contractors/subscriptions', () => {
        return HttpResponse.json(mockCOROnlyResponse);
      }),
      http.post('*/v1/contractors/subscriptions', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );
  });

  it('should render the SaveDraftButton component with default text', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await screen.findByText(/Step: Basic Information/);

    const button = await screen.findByText(/Save Draft/i);
    expect(button).toBeInTheDocument();
  });

  it('should trigger the form validation when save draft is clicked', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await screen.findByText(/Step: Basic Information/i);

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(5);
    });
  });

  it('should call onSuccess when save draft is successful for basic information step', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });
  });

  it('should not advance to next step when save draft is clicked', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
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

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

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

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

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
    mockRender.mockImplementation(({ components }) => {
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

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    const button = await screen.findByText(/Save Draft/i);
    expect(button).toBeDisabled();
  });

  it('should disable button when contractorOnboardingBag.isSubmitting is true', async () => {
    server.use(
      http.post('*/v1/employments', () => {
        return new Promise(() => {});
      }),
    );

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation();

    const saveDraftButton = screen.getByText(/Save Draft/i);
    expect(saveDraftButton).toBeInTheDocument();

    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(saveDraftButton).toBeDisabled();
    });
  });

  it('should show custom children text when provided', async () => {
    mockRender.mockImplementation(({ components }) => {
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

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

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
      <TestProviders components={{ button: MockCustomButton }}>
        {children}
      </TestProviders>
    );

    it('should use custom button when provided via FormFieldsProvider', async () => {
      mockRender.mockImplementationOnce(({ components }) => {
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

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByText(/Save Draft/i);
      expect(customButton).toBeInTheDocument();

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

      render(<ContractorOnboardingFlow {...defaultProps} />, {
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
          return new Promise(() => {});
        }),
      );

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      await screen.findByText(/Step: Basic Information/i);

      await fillBasicInformation();

      const customButton = await screen.findByText(/Save Draft/i);
      expect(customButton).not.toBeDisabled();

      fireEvent.click(customButton);

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

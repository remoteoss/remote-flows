import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import { mockContractorBasicInformationSchema } from '@/src/common/api/fixtures/contractors';
import { ContractorOnboardingFlow } from '@/src/flows/ContractorOnboarding/ContractorOnboarding';
import {
  contractDocumentsResponse,
  fileResponseWithIR35,
  filesResponseWithIR35,
  filesResponseWithoutIR35,
  mockContractDocumentCreatedResponse,
  mockContractDocumentPreviewResponse,
  mockContractDocumentSignedResponse,
  mockContractorContractDetailsSchema,
  mockContractorEmploymentResponse,
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import { ContractorOnboardingRenderProps } from '@/src/flows/ContractorOnboarding/types';
import { employmentUpdatedResponse } from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';

const CONTRACTOR_ONBOARDING_STEPS: Record<number, string> = {
  [0]: 'Select Country',
  [1]: 'Basic Information',
  [2]: 'Pricing Plan',
  [3]: 'Eligibility Questionnaire',
  [4]: 'Contract Details',
  [5]: 'Contract Preview',
  [6]: 'Review',
};

const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockSubmit = vi.fn();

const mockRender = vi.fn(
  ({
    contractorOnboardingBag,
    components,
  }: ContractorOnboardingRenderProps) => {
    const currentStepIndex =
      contractorOnboardingBag.stepState.currentStep.index;

    const { OnboardingInvite } = components;

    if (contractorOnboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    return (
      <>
        <h1>Step: {CONTRACTOR_ONBOARDING_STEPS[currentStepIndex]}</h1>
        <OnboardingInvite
          data-testid='onboarding-invite'
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ status }) =>
            status === 'create_reserve' ? 'Create Reserve' : 'Invite Contractor'
          }
        />
      </>
    );
  },
);

const defaultProps = {
  employmentId: '12345',
  countryCode: 'PRT',
  options: {},
  render: mockRender,
};

describe('ContractorOnboarding - OnboardingInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
    queryClient.clear();

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
      http.get('*/v1/countries/*/employment_basic_information*', () => {
        return HttpResponse.json(mockContractorBasicInformationSchema);
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
        return HttpResponse.json(mockBaseResponse);
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

  it('should render the OnboardingInvite component with "Invite Contractor" text', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Select Country/);

    const button = await screen.findByText(/Invite Contractor/i);
    expect(button).toBeInTheDocument();
  });

  it('should call onSubmit and onSuccess when invite is successful', async () => {
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await screen.findByText(/Step: Select Country/);

    const button = screen.getByText(/Invite Contractor/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
    expect(mockSuccess).toHaveBeenCalledWith({
      data: { data: { status: 'ok' } },
      employmentStatus: 'invited',
    });
    expect(mockError).not.toHaveBeenCalled();
  });

  it('should call onError when invite fails', async () => {
    server.use(
      http.post('*/v1/employments/:employmentId/invite', () => {
        return HttpResponse.json(
          { error: 'Failed to invite contractor' },
          { status: 400 },
        );
      }),
    );

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await screen.findByText(/Step: Select Country/);

    const button = screen.getByText(/Invite Contractor/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
    expect(mockError).toHaveBeenCalled();
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it('should call onError with correct error structure when invite fails with 409', async () => {
    server.use(
      http.post('*/v1/employments/:employmentId/invite', () => {
        return HttpResponse.json(
          {
            message: "Can't invite contractor missing contract details",
          },
          { status: 409 },
        );
      }),
    );

    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await screen.findByText(/Step: Select Country/);

    const button = screen.getByText(/Invite Contractor/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
    expect(mockError).toHaveBeenCalledWith({
      error: new Error("Can't invite contractor missing contract details"),
      rawError: {
        message: "Can't invite contractor missing contract details",
      },
      fieldErrors: [],
    });
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it('should refetch employment after inviting the contractor', async () => {
    const getEmploymentSpy = vi.fn();

    server.use(
      http.get('*/v1/employments/:id', ({ request }) => {
        getEmploymentSpy(request.url);
        return HttpResponse.json(mockContractorEmploymentResponse);
      }),
    );
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });

    // CRITICAL: Wait for initial load to complete
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    // Verify initial employment fetch happened
    expect(getEmploymentSpy).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/Invite Contractor/i)).toBeInTheDocument();
    });

    // Find and click the button
    const button = screen.getByText(/Invite Contractor/i);
    fireEvent.click(button);
    // Wait for the invite to complete and verify refetch happened
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
    });

    // Verify employment was fetched again (refetch happened)
    await waitFor(() => {
      expect(getEmploymentSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should call createReserveInvoice, refetch employment, and change button label when COR is selected', async () => {
    const refetchEmploymentMock = vi.fn();
    const reserveInvoiceSpy = vi.fn();

    mockRender.mockImplementation(({ contractorOnboardingBag, components }) => {
      contractorOnboardingBag.refetchEmployment = refetchEmploymentMock;
      const { OnboardingInvite } = components;
      return (
        <OnboardingInvite
          data-testid='onboarding-invite'
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ status }) =>
            status === 'create_reserve' ? 'Create Reserve' : 'Invite Contractor'
          }
        />
      );
    });
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              contractor_type: 'cor',
              status: 'created',
            },
          },
        });
      }),
      http.post('*/v1/risk-reserve', () => {
        reserveInvoiceSpy();
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );
    render(<ContractorOnboardingFlow {...defaultProps} />, {
      wrapper: TestProviders,
    });
    // Button should show "Create Reserve" for COR
    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    await waitFor(() => {
      // Should call reserve invoice endpoint
      expect(reserveInvoiceSpy).toHaveBeenCalled();
      // Should refetch employment
      expect(refetchEmploymentMock).toHaveBeenCalled();
      // Should call onSuccess with created_awaiting_reserve status
      expect(mockSuccess).toHaveBeenCalledWith({
        data: { data: { status: 'ok' } },
        employmentStatus: 'created_awaiting_reserve',
      });
    });
  });

  describe('button behavior', () => {
    it('should disable button when disabled prop is passed', async () => {
      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid='onboarding-invite'
            disabled={true}
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Invite Contractor'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      const button = await screen.findByTestId('onboarding-invite');
      expect(button).toBeDisabled();
    });

    it('should disable button when employmentInviteMutation is pending', async () => {
      server.use(
        http.post('*/v1/employments/:employmentId/invite', () => {
          // Return a delayed response to keep the mutation pending
          return new Promise(() => {}); // Never resolves to keep pending
        }),
      );

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      await screen.findByText(/Step: Select Country/);

      const button = await screen.findByText(/Invite Contractor/i);
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      // Wait a bit and check if button becomes disabled
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable button when createReserveInvoiceMutation is pending', async () => {
      server.use(
        http.get('*/v1/employments/:id', ({ params }) => {
          const employmentId = params?.id;
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: employmentId,
                contractor_type: 'cor',
              },
            },
          });
        }),
        http.post('*/v1/risk-reserve', () => {
          // Return a delayed response to keep the mutation pending
          return new Promise(() => {}); // Never resolves to keep pending
        }),
      );

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      await screen.findByText(/Step: Select Country/);

      const button = await screen.findByText(/Create Reserve/i);
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      // Wait a bit and check if button becomes disabled
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable button when employment status is "invited"', async () => {
      server.use(
        http.get('*/v1/employments/:id', ({ params }) => {
          const employmentId = params?.id;
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                status: 'invited',
                id: employmentId,
              },
            },
          });
        }),
      );

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      const button = await screen.findByText(/Invite Contractor/i);
      expect(button).toBeDisabled();
    });

    it('should disable button when employment status is "created_awaiting_reserve"', async () => {
      server.use(
        http.get('*/v1/employments/:id', ({ params }) => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                id: params.id,
                contractor_type: 'cor',
                status: 'created_awaiting_reserve',
              },
            },
          });
        }),
      );

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      await screen.findByText(/Step: Review/i);
      const button = await screen.findByText(/Invite Contractor/i);
      expect(button).toBeDisabled();
    });

    it('should use default Button when no custom button provided', async () => {
      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid='onboarding-invite'
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Default Button'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      const button = await screen.findByTestId('onboarding-invite');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Default Button');
    });

    it('should disable button when employment status is "invited"', async () => {
      server.use(
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                status: 'invited',
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid='onboarding-invite'
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Invite Contractor'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      const button = await screen.findByTestId('onboarding-invite');

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable button when employment status is "created_awaiting_reserve"', async () => {
      server.use(
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...mockContractorEmploymentResponse,
            data: {
              ...mockContractorEmploymentResponse.data,
              employment: {
                ...mockContractorEmploymentResponse.data.employment,
                status: 'created_awaiting_reserve',
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid='onboarding-invite'
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Invite Contractor'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      const button = await screen.findByTestId('onboarding-invite');

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('render prop functionality', () => {
    it('should call render prop with status "invited"', async () => {
      const mockRenderProp = vi.fn(() => 'Custom Contractor Button');

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid='onboarding-invite'
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={mockRenderProp}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: TestProviders,
      });

      await screen.findByText('Custom Contractor Button');
      expect(mockRenderProp).toHaveBeenCalledWith({
        status: 'invite',
      });
    });
  });

  describe('custom button component support', () => {
    const MockCustomButton = vi.fn(
      ({ children, onClick, disabled, ...props }) => (
        <button
          onClick={onClick}
          disabled={disabled}
          data-testid='custom-button'
          {...props}
        >
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
      const mockRenderProp = vi.fn(() => 'Custom Button Label');

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            disabled={false}
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={mockRenderProp}
            className='test-class'
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      expect(customButton).toBeInTheDocument();
      expect(customButton).toHaveTextContent('Custom Button Label');

      await waitFor(() => {
        expect(MockCustomButton).toHaveBeenCalledWith(
          expect.objectContaining({
            className: 'test-class',
            disabled: false,
            onClick: expect.any(Function),
            children: 'Custom Button Label',
          }),
          {},
        );
      });
    });

    it('should apply disabled state correctly to custom button', async () => {
      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            disabled={true}
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Disabled Button'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      expect(customButton).toBeDisabled();

      expect(MockCustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
        }),
        {},
      );
    });

    it('should disable custom button during mutation loading', async () => {
      server.use(
        http.post('*/v1/employments/:employmentId/invite', () => {
          // Return a delayed response to keep the mutation pending
          return new Promise(() => {}); // Never resolves to keep pending
        }),
      );

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Loading Button'}
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      await waitFor(() => {
        expect(customButton).not.toBeDisabled();
      });

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

    it('should handle onClick correctly with custom button', async () => {
      const mockOnClick = vi.fn();

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onClick={mockOnClick}
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={({ status }) =>
              status === 'invite' ? 'Invite Contractor' : 'Create Reserve'
            }
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');

      await waitFor(() => {
        expect(customButton).not.toBeDisabled();
      });

      fireEvent.click(customButton);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalled();
        expect(mockSubmit).toHaveBeenCalled();
      });
    });

    it('should pass through all props to custom button', async () => {
      const mockRenderProp = vi.fn(() => 'Custom Props Button');

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            disabled={false}
            render={mockRenderProp}
            variant='outline'
            size='lg'
            intent='secondary'
            data-analytics='invite-contractor-button'
            style={{ color: 'red' }}
            type='button'
            id='custom-id'
            data-testid='custom-button'
          />
        );
      });

      render(<ContractorOnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      await screen.findByTestId('custom-button');

      await waitFor(() => {
        expect(MockCustomButton).toHaveBeenCalledWith(
          expect.objectContaining({
            disabled: false,
          }),
          expect.anything(),
        );
      });

      expect(MockCustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          'data-testid': 'custom-button',
          variant: 'outline',
          size: 'lg',
          intent: 'secondary',
          'data-analytics': 'invite-contractor-button',
          style: { color: 'red' },
          type: 'button',
          id: 'custom-id',
          disabled: false,
          onClick: expect.any(Function),
          children: 'Custom Props Button',
        }),
        {},
      );
    });
  });
});

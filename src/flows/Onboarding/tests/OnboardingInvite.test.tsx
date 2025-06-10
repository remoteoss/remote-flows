import {
  OnboardingFlow,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchema,
  benefitOffersResponse,
  benefitOffersSchema,
  companyResponse,
  contractDetailsSchema,
  employmentResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import { vi } from 'vitest';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockSubmit = vi.fn();

const mockRender = vi.fn(
  ({ onboardingBag, components }: OnboardingRenderProps) => {
    const currentStepIndex = onboardingBag.stepState.currentStep.index;

    const { OnboardingInvite } = components;

    const steps: Record<number, string> = {
      [0]: 'Select Country',
      [1]: 'Basic Information',
      [2]: 'Contract Details',
      [3]: 'Benefits',
      [4]: 'Review',
    };

    if (onboardingBag.isLoading) {
      return <div data-testid="spinner">Loading...</div>;
    }

    return (
      <>
        <h1>Step: {steps[currentStepIndex]}</h1>
        <OnboardingInvite
          data-testid="onboarding-invite"
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ employmentStatus }) =>
            employmentStatus === 'created_awaiting_reserve'
              ? 'Create Reserve'
              : 'Invite Employee'
          }
        />
      </>
    );
  },
);

const defaultProps = {
  companyId: '1234',
  employmentId: '1234',
  countryCode: 'PRT',
  options: {},
  render: mockRender,
};

describe('OnboardingInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      http.get('*/v1/countries/*/employment_basic_information*', () => {
        return HttpResponse.json(basicInformationSchema);
      }),

      http.get('*/v1/countries/*/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchema);
      }),

      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employmentResponse);
      }),

      http.get('*/v1/employments/*/benefit-offers/schema', () => {
        return HttpResponse.json(benefitOffersSchema);
      }),

      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(benefitOffersResponse);
      }),
      http.post('*/v1/employments/:employmentId/invite', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
      http.post('*/v1/employments/:employmentId/reserve-invoice', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
      http.post('*/v1/risk-reserve', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the OnboardingInvite component with default "Invite Employee" text', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Select Country/);

    const button = await screen.findByText(/Invite Employee/i);
    expect(button).toBeInTheDocument();
  });

  it('should render "Create Reserve" button when creditRiskStatus is deposit_required', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Select Country/);

    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();
  });

  it('should call onSubmit and onSuccess when invite is successful', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    const button = screen.getByText(/Invite Employee/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockSuccess).toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });
  });

  it('should call onError when invite fails', async () => {
    server.use(
      http.post('*/v1/employments/:employmentId/invite', () => {
        return HttpResponse.json(
          { error: 'Failed to invite employee' },
          { status: 400 },
        );
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const button = screen.getByText(/Invite Employee/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  it('should call onError when creating reserve invoice fails', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
      http.post('*/v1/risk-reserve', () => {
        return HttpResponse.json(
          { error: 'Failed to create reserve invoice' },
          { status: 400 },
        );
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Select Country/);

    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalled();
      expect(mockSuccess).not.toHaveBeenCalled();
    });
  });

  it('should refetch employment after creating a reserve invoice (deposit_required)', async () => {
    // Mock refetchEmployment
    const refetchEmploymentMock = vi.fn();
    mockRender.mockImplementationOnce(({ onboardingBag, components }) => {
      onboardingBag.refetchEmployment = refetchEmploymentMock;
      const { OnboardingInvite } = components;
      return (
        <OnboardingInvite
          data-testid="onboarding-invite"
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ employmentStatus }) =>
            employmentStatus === 'created_awaiting_reserve'
              ? 'Create Reserve'
              : 'Invite Employee'
          }
        />
      );
    });

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    const button = await screen.findByTestId('onboarding-invite');
    fireEvent.click(button);
    await waitFor(() => {
      expect(refetchEmploymentMock).toHaveBeenCalled();
    });
  });

  it('should refetch employment after inviting the user (not deposit_required)', async () => {
    // Mock refetchEmployment
    const refetchEmploymentMock = vi.fn();
    mockRender.mockImplementationOnce(({ onboardingBag, components }) => {
      onboardingBag.refetchEmployment = refetchEmploymentMock;
      const { OnboardingInvite } = components;
      return (
        <OnboardingInvite
          data-testid="onboarding-invite"
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ employmentStatus }) =>
            employmentStatus === 'created_awaiting_reserve'
              ? 'Create Reserve'
              : 'Invite Employee'
          }
        />
      );
    });

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_not_required',
            },
          },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    const button = await screen.findByTestId('onboarding-invite');
    fireEvent.click(button);
    await waitFor(() => {
      expect(refetchEmploymentMock).toHaveBeenCalled();
    });
  });

  it('should render "Invite Employee" when creditRiskStatus is deposit_required and employmentStatus is created_reserve_paid', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              status: 'created_reserve_paid',
            },
          },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Invite Employee/i);
    expect(button).toBeInTheDocument();
  });

  it('should not call risk-reserve endpoint when employmentStatus is created_reserve_paid', async () => {
    const reserveInvoiceSpy = vi.fn();
    const inviteSpy = vi.fn();

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              status: 'created_reserve_paid',
            },
          },
        });
      }),
      http.post('*/v1/employments/:employmentId/reserve-invoice', () => {
        reserveInvoiceSpy();
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
      http.post('*/v1/employments/:employmentId/invite', () => {
        inviteSpy();
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Invite Employee/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      // Should call invite endpoint
      expect(inviteSpy).toHaveBeenCalledTimes(1);
      // Should NOT call reserve invoice endpoint
      expect(reserveInvoiceSpy).not.toHaveBeenCalled();
    });

    expect(mockSuccess).toHaveBeenCalled();
  });

  it('should disable button when disabled prop is passed', async () => {
    mockRender.mockImplementationOnce(({ components }) => {
      const { OnboardingInvite } = components;
      return (
        <OnboardingInvite
          data-testid="onboarding-invite"
          disabled={true}
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
          render={({ employmentStatus }) =>
            employmentStatus === 'created_awaiting_reserve'
              ? 'Create Reserve'
              : 'Invite Employee'
          }
        />
      );
    });

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

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

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Invite Employee/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // Wait a bit and check if button becomes disabled
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('should disable button when useCreateReserveInvoiceMutation is pending', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
      http.post('*/v1/risk-reserve', () => {
        // Return a delayed response to keep the mutation pending
        return new Promise(() => {}); // Never resolves to keep pending
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // Wait a bit and check if button becomes disabled
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('should render "Invite Employee" when creditRiskStatus is deposit_required but employment status indicates deposit handling', async () => {
    // Test with various employment statuses that should show "Invite Employee" instead of "Create Reserve"
    const employmentStatuses = [
      'created_reserve_paid',
      'invited',
      'created_awaiting_reserve',
    ];

    for (const status of employmentStatuses) {
      mockRender.mockClear();

      server.use(
        http.get('*/v1/companies/:companyId', () => {
          return HttpResponse.json({
            ...companyResponse,
            data: {
              ...companyResponse.data,
              company: {
                ...companyResponse.data.company,
                default_legal_entity_credit_risk_status: 'deposit_required',
              },
            },
          });
        }),
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...employmentResponse,
            data: {
              ...employmentResponse.data,
              employment: {
                ...employmentResponse.data.employment,
                status,
              },
            },
          });
        }),
      );

      render(<OnboardingFlow {...defaultProps} />, { wrapper });

      const button = await screen.findByText(/Invite Employee/i);
      expect(button).toBeInTheDocument();

      // Ensure it's not showing "Create Reserve"
      expect(screen.queryByText(/Create Reserve/i)).not.toBeInTheDocument();

      // Clean up before next iteration
      queryClient.clear();
    }
  });

  it('should call onSuccess with "created_awaiting_reserve" status when creating a reserve invoice', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_required',
            },
          },
        });
      }),
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              status: 'created',
            },
          },
        });
      }),
      http.post('*/v1/employments/:employmentId/reserve-invoice', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith({
        data: { data: { status: 'ok' } },
        employmentStatus: 'created_awaiting_reserve',
      });
    });
  });

  it('should call onSuccess with "invited" status when inviting an employee', async () => {
    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          ...companyResponse,
          data: {
            ...companyResponse.data,
            company: {
              ...companyResponse.data.company,
              default_legal_entity_credit_risk_status: 'deposit_not_required',
            },
          },
        });
      }),
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              status: 'created',
            },
          },
        });
      }),
      http.post('*/v1/employments/:employmentId/invite', () => {
        return HttpResponse.json({
          data: { status: 'ok' },
        });
      }),
    );

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText(/Invite Employee/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith({
        data: { data: { status: 'ok' } },
        employmentStatus: 'invited',
      });
    });
  });

  describe('render prop functionality', () => {
    it('should call render prop with appropriate employmentStatus based on company credit risk status', async () => {
      // Test both "invited" and "created_awaiting_reserve" statuses in one test
      const mockRenderProp = vi.fn(({ employmentStatus }) =>
        employmentStatus === 'created_awaiting_reserve'
          ? 'Custom Reserve Button'
          : 'Custom Invite Button',
      );

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid="onboarding-invite"
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={mockRenderProp}
          />
        );
      });

      // First test with deposit_not_required
      server.use(
        http.get('*/v1/companies/:companyId', () => {
          return HttpResponse.json({
            ...companyResponse,
            data: {
              ...companyResponse.data,
              company: {
                ...companyResponse.data.company,
                default_legal_entity_credit_risk_status: 'deposit_not_required',
              },
            },
          });
        }),
      );

      const { unmount } = render(<OnboardingFlow {...defaultProps} />, {
        wrapper,
      });
      await screen.findByText('Custom Invite Button');
      expect(mockRenderProp).toHaveBeenCalledWith({
        employmentStatus: 'invited',
      });

      unmount();
      mockRenderProp.mockClear();

      // Then test with deposit_required
      server.use(
        http.get('*/v1/companies/:companyId', () => {
          return HttpResponse.json({
            ...companyResponse,
            data: {
              ...companyResponse.data,
              company: {
                ...companyResponse.data.company,
                default_legal_entity_credit_risk_status: 'deposit_required',
              },
            },
          });
        }),
      );

      render(<OnboardingFlow {...defaultProps} />, { wrapper });
      await screen.findByText('Custom Reserve Button');
      expect(mockRenderProp).toHaveBeenCalledWith({
        employmentStatus: 'created_awaiting_reserve',
      });
    });

    it('should call render prop with "invited" status when employment status hides deposit', async () => {
      const mockRenderProp = vi.fn(() => 'Hidden Deposit Button');

      mockRender.mockImplementationOnce(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid="onboarding-invite"
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={mockRenderProp}
          />
        );
      });

      server.use(
        http.get('*/v1/companies/:companyId', () => {
          return HttpResponse.json({
            ...companyResponse,
            data: {
              ...companyResponse.data,
              company: {
                ...companyResponse.data.company,
                default_legal_entity_credit_risk_status: 'deposit_required',
              },
            },
          });
        }),
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...employmentResponse,
            data: {
              ...employmentResponse.data,
              employment: {
                ...employmentResponse.data.employment,
                status: 'created_reserve_paid',
              },
            },
          });
        }),
      );

      render(<OnboardingFlow {...defaultProps} />, { wrapper });

      await screen.findByText('Hidden Deposit Button');
      expect(mockRenderProp).toHaveBeenCalledWith({
        employmentStatus: 'invited',
      });
    });
  });

  describe('custom button component support', () => {
    const MockCustomButton = vi.fn(
      ({ children, onClick, disabled, ...props }) => (
        <button
          onClick={onClick}
          disabled={disabled}
          data-testid="custom-button"
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
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={{ button: MockCustomButton }}>
          {children}
        </FormFieldsProvider>
      </QueryClientProvider>
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
            className="test-class"
          />
        );
      });

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      expect(customButton).toBeInTheDocument();
      expect(customButton).toHaveTextContent('Custom Button Label');

      // Verify custom button received correct props
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

    it('should apply disabled state correctly to custom button', async () => {
      mockRender.mockImplementationOnce(({ components }) => {
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

      render(<OnboardingFlow {...defaultProps} />, {
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

    it('should handle onClick correctly with custom button', async () => {
      const mockOnClick = vi.fn();

      mockRender.mockImplementationOnce(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onClick={mockOnClick}
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Clickable Button'}
          />
        );
      });

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      fireEvent.click(customButton);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalled();
        expect(mockSubmit).toHaveBeenCalled();
      });
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

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
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

    it('should work with reserve flow using custom button', async () => {
      const mockRenderProp = vi.fn(({ employmentStatus }) =>
        employmentStatus === 'created_awaiting_reserve'
          ? 'Custom Create Reserve'
          : 'Custom Invite Employee',
      );

      mockRender.mockImplementation(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={mockRenderProp}
          />
        );
      });

      server.use(
        http.get('*/v1/companies/:companyId', () => {
          return HttpResponse.json({
            ...companyResponse,
            data: {
              ...companyResponse.data,
              company: {
                ...companyResponse.data.company,
                default_legal_entity_credit_risk_status: 'deposit_required',
              },
            },
          });
        }),
      );

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      const customButton = await screen.findByTestId('custom-button');
      await waitFor(() => {
        expect(customButton).toHaveTextContent('Custom Create Reserve');
      });

      expect(mockRenderProp).toHaveBeenCalledWith({
        employmentStatus: 'created_awaiting_reserve',
      });
    });

    it('should fallback to default Button when no custom button provided', async () => {
      // Use default wrapper without custom button
      mockRender.mockImplementationOnce(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            data-testid="onboarding-invite"
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            render={() => 'Default Button'}
          />
        );
      });

      render(<OnboardingFlow {...defaultProps} />, { wrapper });

      const button = await screen.findByTestId('onboarding-invite');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Default Button');

      // Should not have called custom button
      expect(MockCustomButton).not.toHaveBeenCalled();
    });

    it('should pass through all props to custom button', async () => {
      mockRender.mockImplementationOnce(({ components }) => {
        const { OnboardingInvite } = components;
        return (
          <OnboardingInvite
            onSuccess={mockSuccess}
            onError={mockError}
            onSubmit={mockSubmit}
            disabled={false}
            render={() => 'Custom Props Button'}
            style={{ color: 'red' }}
            type="button"
            id="custom-id"
            data-testid="custom-button"
          />
        );
      });

      render(<OnboardingFlow {...defaultProps} />, {
        wrapper: customWrapper,
      });

      await screen.findByTestId('custom-button');

      expect(MockCustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          'data-testid': 'custom-button',
          style: { color: 'red' },
          type: 'button',
          id: 'custom-id',
          children: 'Custom Props Button',
        }),
        {},
      );
    });
  });
});

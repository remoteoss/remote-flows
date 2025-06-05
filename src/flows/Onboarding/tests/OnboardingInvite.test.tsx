import {
  OnboardingFlow,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/OnboardingFlow';
import {
  benefitOffersResponse,
  benefitOffersSchema,
  companyResponse,
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
import React, { PropsWithChildren } from 'react';
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
        />
      </>
    );
  },
);

const defaultProps = {
  companyId: '1234',
  employmentId: '1234',
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
              credit_risk_status: 'deposit_required',
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

  it('should call createReserveInvoice when creditRiskStatus is deposit_required', async () => {
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

    await screen.findByText(/Step: Select Country/);

    const button = await screen.findByText(/Create Reserve/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledTimes(1);
    });

    expect(mockError).not.toHaveBeenCalled();
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

  it('should render children when provided', async () => {
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

    mockRender.mockImplementationOnce(({ components }) => {
      const { OnboardingInvite } = components;
      return (
        <OnboardingInvite
          data-testid="onboarding-invite"
          onSuccess={mockSuccess}
          onError={mockError}
          onSubmit={mockSubmit}
        >
          Custom Button Text
        </OnboardingInvite>
      );
    });

    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    const button = await screen.findByText('Custom Button Text');
    expect(button).toBeInTheDocument();
  });
});

import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { ContractorContractCreationFlow } from '@/src/flows/ContractorContractCreation/ContractorContractCreationFlow';
import { ContractorContractCreationForm } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationForm';
import { ContractorContractCreationSubmitButton } from '@/src/flows/ContractorContractCreation/components/ContractorContractCreationSubmitButton';
import { mockContractorContractDetailsSchema, mockContractorEmploymentResponse } from '@/src/flows/ContractorOnboarding/tests/fixtures';
import {
  fillDatePickerByTestId,
  fillSelect,
  queryClient,
  TestProviders,
} from '@/src/tests/testHelpers';
import { ContractorContractCreationRenderProps } from '@/src/flows/ContractorContractCreation/types';
import { fireEvent } from '@testing-library/react';
import { RemoteFlowContext } from '@/src/context';
import { client as apiClient } from '@/src/client/client.gen';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import { mockContractorCurrencies } from '@/src/common/api/fixtures/contractors';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

function createMockRenderImplementation() {
  return ({ flowBag }: ContractorContractCreationRenderProps) => {
    if (flowBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    return (
      <>
        <h1>Create Contract</h1>
        <ContractorContractCreationForm
          defaultValues={flowBag.initialValues}
          onSubmit={async (payload, form) => {
            try {
              await mockOnSubmit(payload);
              const response = await flowBag.onSubmit(payload);
              await mockOnSuccess(response);
            } catch (error: $TSFixMe) {
              const structuredError = {
                error: error as Error,
                rawError: error as Record<string, unknown>,
                fieldErrors: [],
              };
              mockOnError(structuredError);
              form.setError('root', {
                message: (error as Error).message,
              });
            }
          }}
        />
        <ContractorContractCreationSubmitButton>
          Create Contract
        </ContractorContractCreationSubmitButton>
      </>
    );
  };
}

describe('ContractorContractCreationFlow', () => {
  const employmentId = 'emp_123';

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    // Mock employment data
    server.use(
      http.get(
        `*/v1/employments/${employmentId}`,
        () => {
          return HttpResponse.json(
            mockBaseResponse(mockContractorEmploymentResponse),
          );
        },
      ),
    );

    // Mock contract details schema
    server.use(
      http.get(
        '*/v1/countries/:country_code/contractor-contract-details',
        () => {
          return HttpResponse.json(
            mockBaseResponse({
              schema: mockContractorContractDetailsSchema,
            }),
          );
        },
      ),
    );

    // Mock contractor currencies
    server.use(
      http.get(
        `*/v1/contractors/employments/${employmentId}/contractor-currencies`,
        () => {
          return HttpResponse.json(mockBaseResponse(mockContractorCurrencies));
        },
      ),
    );
  });

  it('renders loading state initially', () => {
    render(
      <TestProviders>
        <RemoteFlowContext.Provider
          value={{
            client: apiClient,
            auth: () => Promise.resolve({ accessToken: 'token', expiresIn: 3600 }),
            environment: 'production',
          }}
        >
          <ContractorContractCreationFlow
            employmentId={employmentId}
            render={createMockRenderImplementation()}
          />
        </RemoteFlowContext.Provider>
      </TestProviders>,
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders contract creation form after loading', async () => {
    render(
      <TestProviders>
        <RemoteFlowContext.Provider
          value={{
            client: apiClient,
            auth: () => Promise.resolve({ accessToken: 'token', expiresIn: 3600 }),
            environment: 'production',
          }}
        >
          <ContractorContractCreationFlow
            employmentId={employmentId}
            render={createMockRenderImplementation()}
          />
        </RemoteFlowContext.Provider>
      </TestProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('Create Contract')).toBeInTheDocument();
    });
  });

  it('successfully creates contract document', async () => {
    const mockContractDocumentResponse = {
      contract_document: {
        id: 'contract_123',
        status: 'pending',
      },
    };

    server.use(
      http.post(
        `*/v1/contractors/employments/${employmentId}/contract-documents`,
        () => {
          return HttpResponse.json(
            mockBaseResponse(mockContractDocumentResponse),
          );
        },
      ),
    );

    render(
      <TestProviders>
        <RemoteFlowContext.Provider
          value={{
            client: apiClient,
            auth: () => Promise.resolve({ accessToken: 'token', expiresIn: 3600 }),
            environment: 'production',
          }}
        >
          <ContractorContractCreationFlow
            employmentId={employmentId}
            onSuccess={mockOnSuccess}
            render={createMockRenderImplementation()}
          />
        </RemoteFlowContext.Provider>
      </TestProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('Create Contract')).toBeInTheDocument();
    });

    // Fill in contract details
    await fillDatePickerByTestId('service_duration.provisional_start_date', new Date('2024-01-01'));
    
    const positionField = screen.getByLabelText('Position');
    fireEvent.change(positionField, { target: { value: 'Software Developer' } });

    const servicesField = screen.getByLabelText('Services and deliverables');
    fireEvent.change(servicesField, { target: { value: 'Software development services' } });

    // Submit form
    const submitButton = screen.getByText('Create Contract');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockContractDocumentResponse,
        }),
      );
    });
  });

  it('handles AI validation errors', async () => {
    const aiErrorResponse = {
      errors: {
        services_and_deliverables: {
          error: ['This may be misclassified'],
          source: 'remote_ai',
          skippable: true,
        },
      },
    };

    server.use(
      http.post(
        `*/v1/contractors/employments/${employmentId}/contract-documents`,
        () => {
          return HttpResponse.json(aiErrorResponse, { status: 422 });
        },
      ),
    );

    render(
      <TestProviders>
        <RemoteFlowContext.Provider
          value={{
            client: apiClient,
            auth: () => Promise.resolve({ accessToken: 'token', expiresIn: 3600 }),
            environment: 'production',
          }}
        >
          <ContractorContractCreationFlow
            employmentId={employmentId}
            onError={mockOnError}
            render={createMockRenderImplementation()}
          />
        </RemoteFlowContext.Provider>
      </TestProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('Create Contract')).toBeInTheDocument();
    });

    // Fill in contract details
    const servicesField = screen.getByLabelText('Services and deliverables');
    fireEvent.change(servicesField, { target: { value: 'Test services' } });

    // Submit form
    const submitButton = screen.getByText('Create Contract');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });
});

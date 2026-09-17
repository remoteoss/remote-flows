import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';
import { ContractDocumentForm } from '@/src/flows/ContractDocument/ContractDocumentForm';
import { ContractDocumentSubmitButton } from '@/src/flows/ContractDocument/ContractDocumentSubmitButton';
import {
  mockContractDocumentCreatedResponse,
  mockContractorContractDetailsSchema,
  mockContractorEmploymentResponse,
} from '@/src/flows/ContractorOnboarding/tests/fixtures';
import { fillContractDetails } from '@/src/flows/ContractorOnboarding/tests/helpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

const aiValidationErrorResponse = {
  errors: {
    services_and_deliverables: [
      {
        error: ['Possible misclassification risk'],
        source: 'REMOTE_AI',
        skippable: true,
      },
    ],
  },
  message: 'Unprocessable Entity',
};

function renderFlow() {
  return render(
    <ContractDocumentFlow
      employmentId='employment-grace'
      render={(bag) => {
        if (bag.isLoading) return <p>Loading…</p>;

        if (bag.stepState.currentStep.name === 'contract_preview') {
          return <p>Preview of {bag.contractDocumentId}</p>;
        }

        return (
          <>
            <ContractDocumentForm />
            <ContractDocumentSubmitButton>
              {bag.canSkipAiValidation ? 'Continue anyway' : 'Continue'}
            </ContractDocumentSubmitButton>
          </>
        );
      }}
    />,
    { wrapper: TestProviders },
  );
}

describe('ContractDocumentForm', () => {
  const createdDocuments: $TSFixMe[] = [];

  beforeEach(() => {
    queryClient.clear();
    createdDocuments.length = 0;

    server.use(
      http.get('*/v1/employments/:id', ({ params }) =>
        HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              id: params.id,
            },
          },
        }),
      ),
      http.get('*/v1/countries/*/contractor-contract-details*', () =>
        HttpResponse.json(mockContractorContractDetailsSchema),
      ),
    );
  });

  it('creates the contract document from the contract details and moves to the preview', async () => {
    server.use(
      http.post(
        '*/v1/contractors/employments/employment-grace/contract-documents',
        async ({ request }) => {
          createdDocuments.push(await request.json());
          return HttpResponse.json(mockContractDocumentCreatedResponse);
        },
      ),
    );

    renderFlow();
    await fillContractDetails();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText(
        `Preview of ${mockContractDocumentCreatedResponse.data.contract_document.id}`,
      ),
    ).toBeInTheDocument();
    expect(createdDocuments).toHaveLength(1);
    expect(createdDocuments[0].skip_ai_checks).toBe(false);
    expect(
      createdDocuments[0].contract_document.services_and_deliverables,
    ).toBe('Service and Deliverables project manager role');
  });

  it('shows the AI misclassification warning and retries with skip_ai_checks', async () => {
    server.use(
      http.post(
        '*/v1/contractors/employments/employment-grace/contract-documents',
        async ({ request }) => {
          createdDocuments.push(await request.json());
          if (createdDocuments.length === 1) {
            return HttpResponse.json(aiValidationErrorResponse, {
              status: 422,
            });
          }
          return HttpResponse.json(mockContractDocumentCreatedResponse);
        },
      ),
    );

    renderFlow();
    await fillContractDetails();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText(/Possible misclassification risk/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continue anyway' }));

    await waitFor(() => {
      expect(createdDocuments).toHaveLength(2);
    });
    expect(createdDocuments[1].skip_ai_checks).toBe(true);
    expect(createdDocuments[1].contract_document).not.toHaveProperty(
      'services_and_deliverables_ai_warning',
    );
    expect(
      await screen.findByText(
        `Preview of ${mockContractDocumentCreatedResponse.data.contract_document.id}`,
      ),
    ).toBeInTheDocument();
  });
});

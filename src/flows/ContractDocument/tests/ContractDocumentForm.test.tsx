import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import {
  mockContractDocumentResponse,
  mockContractDocumentsResponse,
} from '@/src/common/api/fixtures/contract-documents';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';
import { ContractDocumentForm } from '@/src/flows/ContractDocument/ContractDocumentForm';
import { ContractDocumentPreviewForm } from '@/src/flows/ContractDocument/ContractDocumentPreviewForm';
import { ContractDocumentReviewButton } from '@/src/flows/ContractDocument/ContractDocumentReviewButton';
import { ContractDocumentSubmitButton } from '@/src/flows/ContractDocument/ContractDocumentSubmitButton';
import {
  mockContractDocumentCreatedResponse,
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

function renderFlow(onStepRendered?: (step: string) => void) {
  return render(
    <ContractDocumentFlow
      employmentId='employment-grace'
      render={(bag) => {
        if (bag.isLoading) return <p>Loading…</p>;
        onStepRendered?.(bag.stepState.currentStep.name);

        if (bag.stepState.currentStep.name === 'contract_preview') {
          return (
            <>
              <p>Preview of {bag.contractDocumentId}</p>
              <ContractDocumentPreviewForm />
              <button type='button' onClick={bag.back}>
                Back
              </button>
              <ContractDocumentReviewButton
                render={({ reviewCompleted }) =>
                  reviewCompleted ? 'Review again' : 'Review contract'
                }
              />
            </>
          );
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

function mockEmployment(contractorType?: 'standard' | 'plus' | 'cor') {
  server.use(
    http.get('*/v1/employments/:id', ({ params }) =>
      HttpResponse.json({
        ...mockContractorEmploymentResponse,
        data: {
          ...mockContractorEmploymentResponse.data,
          employment: {
            ...mockContractorEmploymentResponse.data.employment,
            id: params.id,
            contractor_type: contractorType,
          },
        },
      }),
    ),
  );
}

describe('ContractDocumentForm', () => {
  const createdDocuments: $TSFixMe[] = [];

  beforeEach(() => {
    queryClient.clear();
    createdDocuments.length = 0;

    mockEmployment();
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
    expect(
      screen.getByText('Contractor Services Agreement'),
    ).toBeInTheDocument();

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

  it('restores the entered contract details when coming back from the preview', async () => {
    server.use(
      http.post(
        '*/v1/contractors/employments/employment-grace/contract-documents',
        () => HttpResponse.json(mockContractDocumentCreatedResponse),
      ),
    );

    renderFlow();
    await fillContractDetails({ serviceAndDeliverables: 'Design work' });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText(/Preview of/);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByLabelText(/Services and Deliverables/i),
    ).toHaveValue('Design work');
  });

  it('opens the created contract document for review and then asks for the signature', async () => {
    server.use(
      http.post(
        '*/v1/contractors/employments/employment-grace/contract-documents',
        () => HttpResponse.json(mockContractDocumentCreatedResponse),
      ),
    );

    renderFlow();
    await fillContractDetails();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText(/Preview of/);

    expect(screen.queryByLabelText(/Enter full name/i)).not.toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Review contract' }),
    );
    await screen.findByText('Contract Document');
    await userEvent.keyboard('{Escape}');

    expect(
      await screen.findByLabelText(/Enter full name/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Review again')).toBeInTheDocument();
  });

  it('opens straight on the preview of an existing contract document', async () => {
    const requested: string[] = [];
    server.use(
      http.get('*/v1/employments/:id/contract-documents', async () => {
        await delay(200);
        return HttpResponse.json(mockContractDocumentsResponse);
      }),
      http.get(
        '*/v1/contractors/employments/:employmentId/contract-documents/:id',
        ({ request }) => {
          requested.push(new URL(request.url).pathname);
          return HttpResponse.json(mockContractDocumentResponse);
        },
      ),
    );

    const renderedSteps: string[] = [];
    renderFlow((step) => renderedSteps.push(step));

    expect(
      await screen.findByText('Preview of contract-document-1'),
    ).toBeInTheDocument();
    expect(requested).toEqual([
      '/v1/contractors/employments/employment-grace/contract-documents/contract-document-1',
    ]);
    expect(renderedSteps).not.toContain('contract_details');
  });

  it('leaves out the Contractor Services Agreement disclaimer for a Contractor of Record', async () => {
    mockEmployment('cor');

    renderFlow();
    await screen.findByLabelText(/Services and Deliverables/i);

    expect(
      screen.queryByText('Contractor Services Agreement'),
    ).not.toBeInTheDocument();
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

import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';
import { mockContractDocumentsResponse } from '@/src/common/api/fixtures/contract-documents';
import { employmentDefaultResponse } from '@/src/flows/Onboarding/tests/fixtures';

function renderFlow(employmentId = 'employment-grace') {
  return render(
    <ContractDocumentFlow
      employmentId={employmentId}
      render={(bag) => {
        if (bag.isLoading) return <p>Loading…</p>;

        return (
          <>
            <h2>{bag.employment?.full_name}</h2>
            <p>{bag.isContractorOfRecord ? 'CoR' : 'Not CoR'}</p>
            <p>{bag.contractDocuments?.length} contract documents</p>
          </>
        );
      }}
    />,
    { wrapper: TestProviders },
  );
}

describe('ContractDocumentFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('loads the contractor and their contract documents for the given employmentId', async () => {
    const requested: string[] = [];
    server.use(
      http.get('*/v1/employments/:id', ({ params, request }) => {
        requested.push(new URL(request.url).pathname);
        return HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
              full_name: 'Grace Hopper',
            },
          },
        });
      }),
      http.get('*/v1/employments/:id/contract-documents', ({ request }) => {
        requested.push(new URL(request.url).pathname);
        return HttpResponse.json(mockContractDocumentsResponse);
      }),
    );

    renderFlow();

    expect(
      await screen.findByRole('heading', { name: 'Grace Hopper' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 contract documents')).toBeInTheDocument();
    expect(requested.sort()).toEqual([
      '/v1/employments/employment-grace',
      '/v1/employments/employment-grace/contract-documents',
    ]);
  });

  it('keeps reporting loading while employmentId is empty, without requesting anything', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    renderFlow('');
    await new Promise((resolve) => setTimeout(resolve, 100));

    server.events.removeListener('request:start', onRequest);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(requests).toEqual([]);
  });

  it('keeps reporting loading until the contract documents resolve', async () => {
    let releaseContractDocuments: () => void = () => {};
    const contractDocumentsRequested = new Promise<void>((resolve) => {
      releaseContractDocuments = resolve;
    });

    server.use(
      http.get('*/v1/employments/:id/contract-documents', async () => {
        await contractDocumentsRequested;
        return HttpResponse.json(mockContractDocumentsResponse);
      }),
    );

    renderFlow();

    await waitFor(() => {
      expect(
        queryClient.getQueryData(['employment', 'employment-grace']),
      ).toBeDefined();
    });
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    releaseContractDocuments();

    expect(await screen.findByText('1 contract documents')).toBeInTheDocument();
  });

  it('tells a Contractor of Record apart', async () => {
    server.use(
      http.get('*/v1/employments/:id', ({ params }) =>
        HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
              contractor_type: 'cor',
            },
          },
        }),
      ),
    );

    renderFlow();

    expect(await screen.findByText('CoR')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';

function renderFlow() {
  return render(
    <ContractDocumentFlow
      render={({ stepState }) => (
        <>
          <h2>Create contract document</h2>
          <p>{stepState.currentStep.name}</p>
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

describe('ContractDocumentFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders the render prop on the contract details step', () => {
    renderFlow();

    expect(
      screen.getByRole('heading', { name: 'Create contract document' }),
    ).toBeInTheDocument();
    expect(screen.getByText('contract_details')).toBeInTheDocument();
  });

  it('makes no network request', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    renderFlow();
    await new Promise((resolve) => setTimeout(resolve, 100));

    server.events.removeListener('request:start', onRequest);
    expect(requests).toEqual([]);
  });

  it('hands the bag to components rendered inside the flow', () => {
    function StepName() {
      const { contractDocumentBag } = useContractDocumentContext();
      return <p>Inside: {contractDocumentBag.stepState.currentStep.name}</p>;
    }

    render(<ContractDocumentFlow render={() => <StepName />} />, {
      wrapper: TestProviders,
    });

    expect(screen.getByText('Inside: contract_details')).toBeInTheDocument();
  });

  it('throws when the context is used outside the flow', () => {
    function Outside() {
      useContractDocumentContext();
      return null;
    }

    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Outside />, { wrapper: TestProviders })).toThrow(
      'useContractDocumentContext must be used within a ContractDocumentFlow',
    );

    vi.restoreAllMocks();
  });
});

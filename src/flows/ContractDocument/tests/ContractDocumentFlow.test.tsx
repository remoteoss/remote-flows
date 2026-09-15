import { fireEvent, render, screen } from '@testing-library/react';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';

function renderFlow() {
  return render(
    <ContractDocumentFlow
      render={({ stepState, steps, back, next }) => (
        <>
          <p>Current: {stepState.currentStep.name}</p>
          <ol>
            {steps.map((step) => (
              <li key={step.name}>{step.label}</li>
            ))}
          </ol>
          <button type='button' onClick={back}>
            Back
          </button>
          <button type='button' onClick={next}>
            Next
          </button>
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

  it('starts on contract details and lists both steps', () => {
    renderFlow();

    expect(screen.getByText('Current: contract_details')).toBeInTheDocument();
    expect(screen.getByText('Contract Details')).toBeInTheDocument();
    expect(screen.getByText('Contract Preview')).toBeInTheDocument();
  });

  it('navigates forward to contract preview and back again', () => {
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Current: contract_preview')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Current: contract_preview')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Current: contract_details')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Current: contract_details')).toBeInTheDocument();
  });

  it('makes no network request', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
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

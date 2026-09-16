import { render, screen } from '@testing-library/react';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ContractDocumentFlow } from '@/src/flows/ContractDocument/ContractDocumentFlow';

describe('ContractDocumentFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders the render prop on the contract details step', () => {
    render(
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

    expect(
      screen.getByRole('heading', { name: 'Create contract document' }),
    ).toBeInTheDocument();
    expect(screen.getByText('contract_details')).toBeInTheDocument();
  });
});

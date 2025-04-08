import { ContractAmendmentFlow } from '@remoteoss/remote-flows';

export const ContractAmendmentDemo = () => {
  return (
    <ContractAmendmentFlow
      countryCode="PRT"
      employmentId="87b7f5c9-6b9a-4bcb-b23d-b359a47b6a33"
      render={({ contractAmendmentBag }) => {
        return (
          <div>
            <h1>Contract Amendment</h1>
            <pre>{JSON.stringify(contractAmendmentBag, null, 2)}</pre>
          </div>
        );
      }}
    />
  );
};

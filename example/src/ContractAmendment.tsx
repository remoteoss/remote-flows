import { ContractAmendmentFlow, RemoteFlows, ContractAmendmentForm, ContractAmendmentSubmit } from '@remoteoss/remote-flows';

export const ContractAmendmentDemo = () => {
  const fetchToken = () => {
    return fetch('/api/token')
      .then((res) => res.json())
      .then((data) => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      }))
      .catch((error) => {
        console.error({ error });
        throw error;
      });
  };
  return (
    <RemoteFlows auth={() => fetchToken()}>
      <ContractAmendmentFlow
        countryCode="PRT"
        employmentId="87b7f5c9-6b9a-4bcb-b23d-b359a47b6a33"
        render={({ contractAmendmentBag }) => {
          if(contractAmendmentBag.isLoading) {
            return <p>Loading...</p>;
          }
          
          return (
            <>
            <ContractAmendmentForm />
            <ContractAmendmentSubmit />
            </>
          );
        }}
      />
    </RemoteFlows>
  );
};

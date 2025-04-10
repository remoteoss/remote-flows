import {
  TerminationFlow,
  RemoteFlows,
  TerminationForm,
  TerminationSubmit,
} from '@remoteoss/remote-flows';
import './App.css';

export const Termination = () => {
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
      <div className="cost-calculator__container">
        <TerminationFlow
          render={({ terminationBag }) => {
            if (terminationBag.isLoading) {
              return <div>Loading...</div>;
            }

            return (
              <>
                <TerminationForm />
                <TerminationSubmit>Send termination</TerminationSubmit>
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
};

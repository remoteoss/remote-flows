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
          employmentId="7df92706-59ef-44a1-91f6-a275b9149994"
          user={{ name: 'ze' }}
          render={({ terminationBag }) => {
            if (terminationBag.isLoading) {
              return <div>Loading...</div>;
            }

            return (
              <>
                <TerminationForm
                  username="ze"
                  onSubmit={(payload) => console.log('payload', payload)}
                  onError={(error) => console.log('error', error)}
                  onSuccess={(data) => console.log('data', data)}
                />
                <TerminationSubmit>Send termination</TerminationSubmit>
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
};

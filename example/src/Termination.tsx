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
      <TerminationFlow
        render={() => {
          return (
            <>
              <TerminationForm />
              <TerminationSubmit>Send termination</TerminationSubmit>
            </>
          );
        }}
      />
    </RemoteFlows>
  );
};

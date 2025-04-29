import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
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
          render={({ terminationBag, components }) => {
            if (terminationBag.isLoading) {
              return <div>Loading...</div>;
            }

            const { Form, SubmitButton, TimeOff } = components;

            return (
              <>
                <TimeOff
                  render={({ timeoff, employment }) => {
                    const username = employment.data?.data.employment
                      ?.basic_information?.name as string;
                    const days = timeoff?.data?.data?.total_count || 0;

                    // if days is 0 or > 1 'days' else 'day
                    const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
                    return (
                      <>
                        <p>
                          We have recorded {days} {daysLiteral} of paid time off
                          for {username}
                        </p>
                        <a href="#">See {username}'s timeoff breakdown</a>
                      </>
                    );
                  }}
                />
                <Form
                  username="ze"
                  onSubmit={(payload) => console.log('payload', payload)}
                  onError={(error) => console.log('error', error)}
                  onSuccess={(data) => console.log('data', data)}
                />
                <SubmitButton>Send termination</SubmitButton>
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
};

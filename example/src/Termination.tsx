import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import './App.css';

function PersonalEmailDescription({ onClick }: { onClick: () => void }) {
  return (
    <p>
      <strong>Personal email</strong> is used to send the termination letter to
      the employee. It is not mandatory, but it is recommended to add it.
      <br />
      <br />
      <strong>Note:</strong> If you do not have a personal email, you can use
      the company email. The employee will receive the termination letter in
      their company email.
      <a href="#" target="_blank">
        more here
      </a>
    </p>
  );
}

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
          options={{
            jsfModify: {
              fields: {
                personal_email: {
                  description: () => (
                    <PersonalEmailDescription
                      onClick={() => console.log('click anchor')}
                    />
                  ),
                },
              },
            },
          }}
          render={({ terminationBag, components }) => {
            if (terminationBag.isLoading) {
              return <div>Loading...</div>;
            }

            const { Form, SubmitButton, Back } = components;

            const currentStepIndex = terminationBag.stepState.currentStep.index;

            return (
              <>
                <Form
                  username="ze"
                  onSubmit={(payload) => console.log('payload', payload)}
                  onError={(error) => console.log('error', error)}
                  onSuccess={(data) => console.log('data', data)}
                />
                {currentStepIndex > 0 && <Back>Back</Back>}
                {currentStepIndex <=
                  terminationBag.stepState.totalSteps - 1 && (
                  <SubmitButton>
                    {currentStepIndex < terminationBag.stepState.totalSteps - 1
                      ? 'Next Step'
                      : 'Send termination'}
                  </SubmitButton>
                )}
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
};

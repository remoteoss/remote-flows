import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import './App.css';

const STEPS = [
  'Employee Communication',
  'Termination Details',
  'Paid Time Off',
  'Additional Information',
];

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
                confidential: {
                  'x-jsf-presentation': {
                    statement: null, // this removes potential fixed statements that come from the confidential field
                  },
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

            const stepTitle = STEPS[currentStepIndex];

            return (
              <>
                <div className="steps-navigation">
                  <ul>
                    {STEPS.map((step, index) => (
                      <li
                        key={index}
                        className={`step-item ${index === currentStepIndex ? 'active' : ''}`}
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="alert">
                  <p>
                    Please do not inform the employee of their termination until
                    we review your request for legal risks. When we approve your
                    request, you can inform the employee and we'll take it from
                    there.
                  </p>
                </div>
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h1 className="heading-green">{stepTitle}</h1>
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
                      {currentStepIndex <
                      terminationBag.stepState.totalSteps - 1
                        ? 'Next Step'
                        : 'Send termination'}
                    </SubmitButton>
                  )}
                </div>
              </>
            );
          }}
        />
      </div>
    </RemoteFlows>
  );
};

import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import { TerminationDialog } from './TerminationDialog';
import { useState } from 'react';
import './App.css';

const TerminationReasonDetailsDescription = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <>
    Make sure you choose an accurate termination reason to avoid unfair or
    unlawful dismissal claims.{' '}
    <a onClick={onClick}>Learn more termination details</a>
  </>
);

const STEPS = [
  'Employee Communication',
  'Termination Details',
  'Paid Time Off',
  'Additional Information',
];

export const Termination = () => {
  const [open, setOpen] = useState(false);
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
              // fields for the termination flow are defined here https://github.com/remoteoss/remote-flows/blob/main/src/flows/Termination/json-schemas/jsonSchema.ts#L108
              fields: {
                confidential: {
                  'x-jsf-presentation': {
                    statement: null, // this removes potential fixed statements that come from the confidential field
                  },
                },
                termination_reason: {
                  description: () => (
                    <TerminationReasonDetailsDescription
                      onClick={() => setOpen(true)}
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

            const { Form, SubmitButton, Back, TimeOff } = components;

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
                {currentStepIndex === 0 && (
                  <div className="alert">
                    <p>
                      Please do not inform the employee of their termination
                      until we review your request for legal risks. When we
                      approve your request, you can inform the employee and
                      we'll take it from there.
                    </p>
                  </div>
                )}
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h1 className="heading">{stepTitle}</h1>
                  {terminationBag.stepState.currentStep.name ===
                    'paid_time_off' && (
                    <TimeOff
                      render={({ employment, timeoff }) => {
                        const username = employment?.data?.employment
                          ?.basic_information?.name as string;
                        const days = timeoff?.data?.total_count || 0;

                        // if days is 0 or > 1 'days' else 'day
                        const daysLiteral =
                          days > 1 || days === 0 ? 'days' : 'day';
                        return (
                          <>
                            <p>
                              We have recorded {days} {daysLiteral} of paid time
                              off for {username}
                            </p>
                            <a href="#">See {username}'s timeoff breakdown</a>
                          </>
                        );
                      }}
                    />
                  )}
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
        <TerminationDialog open={open} setOpen={setOpen} />
      </div>
    </RemoteFlows>
  );
};

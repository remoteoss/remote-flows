import { TerminationFlow } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import { TerminationDialog } from './TerminationDialog';
import { RemoteFlows } from './RemoteFlows';
import { components } from './Components';
import './css/main.css';

const STEPS = [
  'Employee Communication',
  'Termination Details',
  'Paid Time Off',
  'Additional Information',
];

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

type MultiStepFormProps = {
  terminationBag: TerminationRenderProps['terminationBag'];
  components: TerminationRenderProps['components'];
  onSubmitStep: (
    payload: TerminationFormValues,
    step: string,
  ) => void | Promise<void>;
  onSubmitForm: (payload: TerminationFormValues) => void | Promise<void>;
  onError: (error: Error) => void;
  onSuccess: (response: OffboardingResponse) => void;
};

const MultiStepForm = ({
  terminationBag,
  components,
  onSubmitStep,
  onSubmitForm,
  onError,
  onSuccess,
}: MultiStepFormProps) => {
  const {
    EmployeeComunicationStep,
    TerminationDetailsStep,
    PaidTimeOffStep,
    AdditionalDetailsStep,
    SubmitButton,
    Back,
    TimeOff,
  } = components;
  switch (terminationBag.stepState.currentStep.name) {
    case 'employee_communication':
      return (
        <>
          <div className="alert">
            <p>
              Please do not inform the employee of their termination until we
              review your request for legal risks. When we approve your request,
              you can inform the employee and we'll take it from there.
            </p>
          </div>
          <EmployeeComunicationStep
            onSubmit={(payload) =>
              onSubmitStep(payload, 'employee_communication')
            }
          />
          <SubmitButton className="submit-button">Next Step</SubmitButton>
        </>
      );
    case 'termination_details':
      return (
        <>
          <TerminationDetailsStep
            onSubmit={(payload) => onSubmitStep(payload, 'termination_details')}
          />
          <div className="buttons-container">
            <Back className="back-button">Back</Back>
            <SubmitButton className="submit-button">Next Step</SubmitButton>
          </div>
        </>
      );
    case 'paid_time_off':
      return (
        <>
          <TimeOff
            render={({ employment, timeoff }) => {
              const username = employment?.data?.employment?.basic_information
                ?.name as string;
              const days = timeoff?.data?.total_count || 0;

              // if days is 0 or > 1 'days' else 'day
              const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
              return (
                <>
                  <p>
                    We have recorded {days} {daysLiteral} of paid time off for{' '}
                    {username}
                  </p>
                  <a href="#">See {username}'s timeoff breakdown</a>
                </>
              );
            }}
          />
          <PaidTimeOffStep
            onSubmit={(payload) => onSubmitStep(payload, 'paid_time_off')}
          />
          <div className="buttons-container">
            <Back className="back-button">Back</Back>
            <SubmitButton className="submit-button">Next Step</SubmitButton>
          </div>
        </>
      );

    case 'additional_information':
      return (
        <>
          <AdditionalDetailsStep
            requesterName="ze"
            onSubmit={(payload) => onSubmitForm(payload)}
            onSuccess={onSuccess}
            onError={onError}
          />
          <div className="buttons-container">
            <Back>Back</Back>
            <SubmitButton className="submit-button">Submit</SubmitButton>
          </div>
        </>
      );
  }
};

const TerminationForm = ({
  terminationBag,
  components,
}: TerminationRenderProps) => {
  const currentStepIndex = terminationBag.stepState.currentStep.index;

  const stepTitle = STEPS[currentStepIndex];

  if (terminationBag.isLoading) {
    return <div>Loading termination...</div>;
  }

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
      <div className="card" style={{ marginBottom: '20px' }}>
        <h1 className="heading">{stepTitle}</h1>
        <MultiStepForm
          terminationBag={terminationBag}
          components={components}
          onSubmitStep={(payload, step) =>
            console.log('onSubmitStep', payload, step)
          }
          onSubmitForm={(payload) => console.log('onSubmitForm', payload)}
          onError={(error) => console.log('onError', error)}
          onSuccess={(response) => console.log('onSuccess', response)}
        />
      </div>
    </>
  );
};

export const Termination = () => {
  const [open, setOpen] = useState(false);
  const EMPLOYMENT_ID = '7df92706-59ef-44a1-91f6-a275b9149994'; // Replace with your actual employment ID
  return (
    <RemoteFlows>
      <TerminationFlow
        employmentId={EMPLOYMENT_ID}
        render={TerminationForm}
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
      />
      <TerminationDialog open={open} setOpen={setOpen} />
    </RemoteFlows>
  );
};

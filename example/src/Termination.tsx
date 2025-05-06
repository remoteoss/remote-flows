import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
  CreateOffboardingParams,
} from '@remoteoss/remote-flows';
import './App.css';
import { useState } from 'react';
import { TerminationDialog } from './TerminationDialog';

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

type SwitchFormProps = {
  terminationBag: TerminationRenderProps['terminationBag'];
  components: TerminationRenderProps['components'];
  onSubmitStep: (payload: TerminationFormValues, step: string) => Promise<void>;
  onSubmitForm: (payload: CreateOffboardingParams) => Promise<void>;
  onError: (error: Error) => void;
  onSuccess: (response: OffboardingResponse) => void;
};

const SwitchForm = ({
  terminationBag,
  components,
  onSubmitStep,
  onSubmitForm,
  onError,
  onSuccess,
}: SwitchFormProps) => {
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
          <SubmitButton>Next Step</SubmitButton>
        </>
      );
    case 'termination_details':
      return (
        <>
          <TerminationDetailsStep
            onSubmit={(payload) => onSubmitStep(payload, 'termination_details')}
          />
          <Back>Back</Back>
          <SubmitButton>Next Step</SubmitButton>
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
          <Back>Back</Back>
          <SubmitButton>Next Step</SubmitButton>
        </>
      );

    case 'additional_information':
      return (
        <>
          <AdditionalDetailsStep
            username="ze"
            onSubmit={(payload) => onSubmitForm(payload)}
            onSuccess={onSuccess}
            onError={onError}
          />
          <Back>Back</Back>
          <SubmitButton>Submit</SubmitButton>
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

  const onSubmitStep = async (payload: TerminationFormValues, step: string) => {
    console.log('onSubmitStep', payload, step);
  };

  const onSubmitForm = async (payload: CreateOffboardingParams) => {
    console.log('onSubmitForm', payload);
  };

  const onSuccess = (response: OffboardingResponse) => {
    console.log('onSuccess', response);
  };

  const onError = (error: Error) => {
    console.error('onError', error);
  };

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
        <SwitchForm
          terminationBag={terminationBag}
          components={components}
          onSubmitStep={onSubmitStep}
          onSubmitForm={onSubmitForm}
          onError={onError}
          onSuccess={onSuccess}
        />
      </div>
    </>
  );
};

export const Termination = () => {
  const [open, setOpen] = useState(false);
  return (
    <RemoteFlows auth={fetchToken}>
      <div className="cost-calculator__container">
        <TerminationFlow
          employmentId="7df92706-59ef-44a1-91f6-a275b9149994"
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
      </div>
      <TerminationDialog open={open} setOpen={setOpen} />
    </RemoteFlows>
  );
};

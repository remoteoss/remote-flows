import { TerminationFlow, zendeskArticles } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
} from '@remoteoss/remote-flows';
import { TerminationReasonsDialog } from './TerminationReasonsDialog';
import { RemoteFlows } from './RemoteFlows';
import { ZendeskTriggerButton } from '@remoteoss/remote-flows/internals';
import { OffboardingRequestModal } from './OffboardingRequestModal';
import './css/main.css';
import { useState } from 'react';

const STEPS = [
  'Employee Communication',
  'Termination Details',
  'Paid Time Off',
  'Additional Information',
];

const TerminationReasonDetailsDescription = () => (
  <>
    Make sure you choose an accurate termination reason to avoid unfair or
    unlawful dismissal claims. <TerminationReasonsDialog />
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
          <EmployeeComunicationStep
            onSubmit={(payload) =>
              onSubmitStep(payload, 'employee_communication')
            }
          />
          <SubmitButton className='submit-button mt-3'>Next Step</SubmitButton>
        </>
      );
    case 'termination_details':
      return (
        <>
          <TerminationDetailsStep
            onSubmit={(payload) => onSubmitStep(payload, 'termination_details')}
          />
          <div className='buttons-container mt-3'>
            <Back className='back-button'>Back</Back>
            <SubmitButton className='submit-button'>Next Step</SubmitButton>
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
                  <a href='#'>See {username}'s timeoff breakdown</a>
                </>
              );
            }}
          />
          <PaidTimeOffStep
            onSubmit={(payload) => onSubmitStep(payload, 'paid_time_off')}
          />
          <div className='buttons-container mt-3'>
            <Back className='back-button'>Back</Back>
            <SubmitButton className='submit-button'>Next Step</SubmitButton>
          </div>
        </>
      );

    case 'additional_information':
      return (
        <>
          <AdditionalDetailsStep
            requesterName='ze'
            onSubmit={(payload) => onSubmitForm(payload)}
            onSuccess={onSuccess}
            onError={onError}
          />
          <div className='buttons-container'>
            <Back className='back-button'>Back</Back>
            <SubmitButton className='submit-button'>Submit</SubmitButton>
          </div>
        </>
      );
  }
};

const TerminationRender = ({
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
      <div className='steps-navigation'>
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
      <div className='card' style={{ marginBottom: '20px' }}>
        <h1 className='heading'>{stepTitle}</h1>
        <div className='mt-3 mb-3'>
          <ZendeskTriggerButton
            className='text-sm'
            zendeskId={zendeskArticles.terminationEmployeeCommunication}
          >
            Learn more about employee communication
          </ZendeskTriggerButton>
        </div>
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

export const TerminationWithProps = ({
  employmentId,
}: {
  employmentId: string;
}) => {
  const proxyURL = window.location.origin;
  return (
    <RemoteFlows proxy={{ url: proxyURL }}>
      <TerminationFlow
        employmentId={employmentId}
        render={TerminationRender}
        options={{
          jsfModify: {
            // fields for the termination flow are defined here https://github.com/remoteoss/remote-flows/blob/main/src/flows/Termination/json-schemas/jsonSchema.ts#L108
            fields: {
              termination_reason: {
                description: <TerminationReasonDetailsDescription />,
              },
            },
          },
        }}
      />
      <OffboardingRequestModal employee={{ name: 'Ken' }} />
    </RemoteFlows>
  );
};

export const TerminationForm = () => {
  const [formData, setFormData] = useState<{ employmentId: string }>({
    employmentId: '765e8c80-bd4c-4335-8e83-ac5de37652ea', // use your own employment ID
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <TerminationWithProps {...formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className='onboarding-form-container'>
      <div className='onboarding-form-group'>
        <label htmlFor='employmentId' className='onboarding-form-label'>
          Employment ID:
        </label>
        <input
          id='employmentId'
          type='text'
          value={formData.employmentId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, employmentId: e.target.value }))
          }
          placeholder='Enter employment ID'
          className='onboarding-form-input'
        />
      </div>
      <button type='submit' className='onboarding-form-button'>
        Start Termination
      </button>
    </form>
  );
};

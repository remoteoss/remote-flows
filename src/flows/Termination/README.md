# Termination Docs

Welcome to the Termination flow docs

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
- [Components API](#components-api)
  - [TerminationFlow](#terminationflow)
  - [EmployeeComunicationStep](#employeecomunicationstep)
  - [TerminationDetailsStep](#terminationdetailsstep)
  - [PaidTimeOffStep](#paidtimeoffstep)
  - [AdditionalDetailsStep](#additionaldetailsstep)
  - [SubmitButton](#submitbutton)
  - [BackButton](#backbutton)
  - [TimeOff](#timeoff)
    - [TimeOff render prop Properties](#timeoff-render-prop-properties)
- [Configuration Options](#configuration-options)
  - [options.jsfModify properties](#optionsjsfmodify-properties)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Full Example

```tsx
import { TerminationFlow, zendeskArticles } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
  PaidTimeOffFormValues,
  EmployeeCommunicationFormValues,
  TerminationDetailsFormValues,
} from '@remoteoss/remote-flows';
import { TerminationReasonsDialog } from './TerminationReasonsDialog';
import { RemoteFlows } from './RemoteFlows';
import { ZendeskTriggerButton } from '@remoteoss/remote-flows';
import { OffboardingRequestModal } from './OffboardingRequestModal';
import { useState } from 'react';
import './css/main.css';

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
    payload:
      | EmployeeCommunicationFormValues
      | TerminationDetailsFormValues
      | PaidTimeOffFormValues,
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
  } = components;
  switch (terminationBag.stepState.currentStep.name) {
    case 'employee_communication':
      return (
        <>
          <EmployeeComunicationStep
            onSubmit={(payload: EmployeeCommunicationFormValues) =>
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
            onSubmit={(payload: TerminationDetailsFormValues) =>
              onSubmitStep(payload, 'termination_details')
            }
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
          <PaidTimeOffStep
            onSubmit={(payload: PaidTimeOffFormValues) =>
              onSubmitStep(payload, 'paid_time_off')
            }
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
            onSubmit={(payload: TerminationFormValues) => onSubmitForm(payload)}
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
    <RemoteFlows proxy={{ url: proxyURL }} authType='company-manager'>
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
        initialValues={{
          confidential: 'no',
          customer_informed_employee: 'no',
          personal_email: 'john.doe@example.com',
          additional_comments:
            'Employee has been notified. Please process final paycheck and benefits termination.',
          proposed_termination_date: new Date().toISOString(),
          reason_description:
            'Performance did not meet expectations despite multiple coaching sessions and performance improvement plan.',
          risk_assessment_reasons: [
            'sick_leave',
            'member_of_union_or_works_council',
          ],
          termination_reason: 'performance',
          will_challenge_termination: 'no',
          agrees_to_pto_amount: 'yes',
        }}
      />
      <OffboardingRequestModal employee={{ name: 'Ken' }} />
    </RemoteFlows>
  );
};
```

## Components API

### TerminationFlow

The `TerminationFlow` component lets you render different components like `EmployeeComunicationStep`, `TerminationDetailsStep`, `PaidTimeOffStep`, `AdditionalDetailsStep`, `SubmitButton`, `Back`

The component accepts the next props

| Prop           | Type                                                                                          | Required | Description                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `employmentId` | string                                                                                        | Yes      | The employment id from the employee that you want to offboard                                                            |
|                |
| `render`       | `({termination:  ReturnType<typeof useTermination>, components: {Form, SubmitButton, Back}})` | Yes      | render prop function with the params passed by the useTermination hook and the components available to use for this flow |
| `options`      | `{jsfModify: JSFModify}`                                                                      | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                  |

### EmployeeComunicationStep

It renders the employee communication step and its respective fields.

| Prop       | Type                                                 | Required | Description                                                       |
| ---------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: EmployeeCommunicationFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### TerminationDetailsStep

It renders the termination details step and its respective fields.

| Prop       | Type                                              | Required | Description                                                       |
| ---------- | ------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: TerminationDetailsFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### PaidTimeOffStep

It renders the paid timeoff step and its respective fields.

| Prop       | Type                                       | Required | Description                                                       |
| ---------- | ------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: PaidTimeOffFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### AdditionalDetailsStep

It renders the additional details step and its respective fields.

| Prop        | Type                                       | Required | Description                                                              |
| ----------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `onSubmit`  | `(payload: TerminationFormValues) => void` | No       | Callback with the form values. Runs before submitting the form to Remote |
| `onSuccess` | `(response: OffboardingResponse) => void`  | No       | Callback with the successful termination data                            |
| `onError`   | `(error: Error) => void`                   | No       | Error handling callback                                                  |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### BackButton

It renders the back button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

## Configuration options

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

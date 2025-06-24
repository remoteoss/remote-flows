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
import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import type {
  TerminationRenderProps,
  TerminationFormValues,
  OffboardingResponse,
} from '@remoteoss/remote-flows';
import './css/main.css';
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
            requesterName="ze"
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
  return (
    <RemoteFlows auth={fetchToken}>
      <div className="termination_container">
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
```

## Components API

### TerminationFlow

The `TerminationFlow` component lets you render different components like `EmployeeComunicationStep`, `TerminationDetailsStep`, `PaidTimeOffStep`, `AdditionalDetailsStep`, `SubmitButton`, `Back`, `TimeOff`

The component accepts the next props

| Prop           | Type                                                                                                   | Required | Description                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `employmentId` | string                                                                                                 | Yes      | The employment id from the employee that you want to offboard                                                            |
|                |
| `render`       | `({termination:  ReturnType<typeof useTermination>, components: {Form, SubmitButton, Back, TimeOff}})` | Yes      | render prop function with the params passed by the useTermination hook and the components available to use for this flow |
| `options`      | `{jsfModify: JSFModify}`                                                                               | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                  |

### EmployeeComunicationStep

It renders the employee communication step and its respective fields.

| Prop       | Type                                       | Required | Description                                                       |
| ---------- | ------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: TerminationFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### TerminationDetailsStep

It renders the termination details step and its respective fields.

| Prop       | Type                                       | Required | Description                                                       |
| ---------- | ------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: TerminationFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### PaidTimeOffStep

It renders the paid timeoff step and its respective fields.

| Prop       | Type                                       | Required | Description                                                       |
| ---------- | ------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `onSubmit` | `(payload: TerminationFormValues) => void` | No       | Callback with the form values. Runs before going to the next step |

### AdditionalDetailsStep

It renders the additional details step and its respective fields.

| Prop            | Type                                       | Required | Description                                                                                                                              |
| --------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `requesterName` | `string`                                   | Yes      | Replaces the {{requesterName}} placeholder for the acknowledge field in the last step, should be the person who requests the termination |
| `onSubmit`      | `(payload: TerminationFormValues) => void` | No       | Callback with the form values. Runs before submitting the form to Remote                                                                 |
| `onSuccess`     | `(response: OffboardingResponse) => void`  | No       | Callback with the successful termination data                                                                                            |
| `onError`       | `(error: Error) => void`                   | No       | Error handling callback                                                                                                                  |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### BackButton

It renders the back button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### Timeoff

Component that retrieves the employment and the timeoff of the employee. It uses a render prop that lets you to render the UI elements

```tsx
<TimeOff
  render={({ timeoff, employment }) => {
    const username = employment?.data.employment?.basic_information
      ?.name as string;
    const days = timeoff?.data?.total_count || 0;

    // if days is 0 or > 1 'days' else 'day
    const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
    return (
      <>
        <p>
          We have recorded {days} {daysLiteral} of paid time off for {username}
        </p>
        <a href="#">See {username}'s timeoff breakdown</a>
      </>
    );
  }}
/>
```

#### Timeoff render prop Properties

| Property     | Type                                 | Description                   |
| ------------ | ------------------------------------ | ----------------------------- |
| `timeoff`    | `ListTimeoffResponse \| undefined`   | returns the timeoff result    |
| `employment` | `EmploymentShowResponse\| undefined` | returns the employment result |

## Configuration options

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

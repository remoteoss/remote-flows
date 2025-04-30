# Termination Docs

Welcome to the Termination flow docs

# Table of Contents

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Full Example

```tsx
import { TerminationFlow, RemoteFlows } from '@remoteoss/remote-flows';
import { TerminationDialog } from './TerminationDialog'; // bring your own dialog to hook into the form
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
      <div className="termination_container">
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
```

## Components API

### TerminationFlow

The `TerminationFlow` component lets you render different components like `Form`, `SubmitButton`, `Back`, `TimeOff`

The component accepts the next props

| Prop           | Type                                                                                                   | Required | Description                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `employmentId` | string                                                                                                 | Yes      | The employment id from the employee that you want to offboard                                                            |
|                |
| `render`       | `({termination:  ReturnType<typeof useTermination>, components: {Form, SubmitButton, Back, TimeOff}})` | Yes      | render prop function with the params passed by the useTermination hook and the components available to use for this flow |
| `options`      | `{jsfModify: JSFModify}`                                                                               | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                  |

### Form

It renders the form and the fields of the termination flow

| Prop        | Type                                             | Required | Description                                                                                                        |
| ----------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `username`  | `string`                                         | Yes      | Replaces the {{username}} placeholder for the acknowledge field in the last step, should be the requester username |
| `onSubmit`  | `(payload: TerminationFormValues) => void`       | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote                       |
| `onSuccess` | `(response: PostCreateOffboardingError) => void` | No       | Callback with the successful termination data                                                                      |
| `onError`   | `(error: Error) => void`                         | No       | Error handling callback                                                                                            |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### BackButton

It renders the back button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### Timeoff

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

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

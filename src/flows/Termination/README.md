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
      <a onClick={onClick}>more here</a>
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
      <div className="termination__container">
        <TerminationFlow
          employmentId="7df92706-59ef-44a1-91f6-a275b9149994"
          options={{
            jsfModify: {
              fields: {
                personal_email: {
                  description: () => (
                    // this lets you modify description from the fields and inject any React component in case you want to open modals
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

It renders the back button for the form supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### Timeoff

Component that retrieves the employment and the timeoff of the employee. It uses a render prop that lets you to render the UI elements

```tsx
<TimeOff
  render={({ timeoff, employment }) => {
    const username = employment.data?.data.employment?.basic_information
      ?.name as string;
    const days = timeoff?.data?.data?.total_count || 0;

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

| Property     | Type                                                        | Description                                                     |
| ------------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `timeoff`    | `UseQueryResult<ListTimeoffResponse \| undefined, Error>`   | returns a useQuery result with the properties of the timeoff    |
| `employment` | `UseQueryResult<EmploymentShowResponse\| undefined, Error>` | returns a useQuery result with the properties of the employment |

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

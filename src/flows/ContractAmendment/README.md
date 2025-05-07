# Contract Amendment Docs

Welcome to the Contract Amendment flow docs

# Table of Contents

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Full Example

```tsx
import { ContractAmendmentFlow, RemoteFlows } from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

const STEPS = ['Contract Amendment Details', 'Confirmation'];

export const ContractAmendment = () => {
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
      <div className="contract-amendment_container">
        <ContractAmendmentFlow
          employmentId="7df92706-59ef-44a1-91f6-a275b9149994"
          countryCode="US"
          options={{
            jsfModify: {
              fields: {
                // Customize form fields here
              },
            },
          }}
          render={({ contractAmendmentBag, components }) => {
            if (contractAmendmentBag.isLoading) {
              return <div>Loading...</div>;
            }

            const { Form, SubmitButton, BackButton, ConfirmationForm } =
              components;
            const currentStepIndex =
              contractAmendmentBag.stepState.currentStep.index;
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
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h1 className="heading">{stepTitle}</h1>
                  {currentStepIndex === 0 ? (
                    <Form
                      onSubmit={(payload) => console.log('payload', payload)}
                      onError={(error) => console.log('error', error)}
                      onSuccess={(data) => console.log('data', data)}
                    />
                  ) : (
                    <ConfirmationForm />
                  )}
                  {currentStepIndex > 0 && <BackButton>Back</BackButton>}
                  {currentStepIndex <=
                    contractAmendmentBag.stepState.totalSteps - 1 && (
                    <SubmitButton>
                      {currentStepIndex <
                      contractAmendmentBag.stepState.totalSteps - 1
                        ? 'Next Step'
                        : 'Submit Amendment'}
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
```

## Components API

### ContractAmendmentFlow

The `ContractAmendmentFlow` component lets you render different components like `Form`, `SubmitButton`, `BackButton`, and `ConfirmationForm`

The component accepts the following props:

| Prop           | Type                                                                                                                                | Required | Description                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `employmentId` | string                                                                                                                              | Yes      | The employment id of the employee whose contract you want to amend                                                             |
| `countryCode`  | string                                                                                                                              | Yes      | The country code where the employment is based                                                                                 |
| `render`       | `({contractAmendmentBag: ReturnType<typeof useContractAmendment>, components: {Form, SubmitButton, BackButton, ConfirmationForm}})` | Yes      | render prop function with the params passed by the useContractAmendment hook and the components available to use for this flow |
| `options`      | `{jsfModify: JSFModify}`                                                                                                            | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                        |

### Form

It renders the form and the fields of the contract amendment flow

| Prop        | Type                                             | Required | Description                                                                                  |
| ----------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `onSubmit`  | `(payload: ContractAmendmentFormValues) => void` | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess` | `(response: ContractAmendmentResponse) => void`  | No       | Callback with the successful amendment data                                                  |
| `onError`   | `(error: Error) => void`                         | No       | Error handling callback                                                                      |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the ContractAmendmentFlow component to ensure proper functionality.

### BackButton

It renders the back button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the ContractAmendmentFlow component to ensure proper functionality.

### ConfirmationForm

Component that displays the confirmation step of the contract amendment process. It shows a summary of the changes being made to the contract.

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

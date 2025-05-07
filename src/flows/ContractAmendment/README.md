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
import {
  ContractAmendmentAutomatableResponse,
  ContractAmendmentFlow,
  RemoteFlows,
  ContractAmendmentRenderProps,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function AmendmentFlow({
  contractAmendmentBag,
  components,
}: ContractAmendmentRenderProps) {
  const { Form, SubmitButton, ConfirmationForm, BackButton } = components;

  const [automatable, setAutomatable] = useState<
    ContractAmendmentAutomatableResponse | undefined
  >();
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(data: ContractAmendmentAutomatableResponse) {
    setAutomatable(data);
  }

  if (contractAmendmentBag.isLoading) {
    return <div>Loading employment...</div>;
  }

  switch (contractAmendmentBag.stepState.currentStep.name) {
    case 'form':
      return (
        <div className="amendment_form">
          <Form
            onSuccess={handleSuccess}
            onError={(err) => {
              if (
                'message' in err &&
                err.message === 'no_changes_detected_contract_details'
              ) {
                setError(err.message);
              }
            }}
          />
          {error && (
            <div className="amendment_form__error">
              <p className="amendment_form__error__title">
                Contract detail change required
              </p>
              <p>
                You haven't changed any contract detail value yet. Please change
                at least one value in order to be able to proceed with the
                request.
              </p>
            </div>
          )}
          <SubmitButton
            className="amendment_form__buttons__submit"
            disabled={contractAmendmentBag.isSubmitting}
          >
            Go to preview and confirm changes
          </SubmitButton>
        </div>
      );
    case 'confirmation_form':
      return (
        <div className="confirmation_form">
          <ConfirmationForm />
          <div>
            {Object.entries(
              contractAmendmentBag.stepState.values?.form || {},
            ).map(([key, value]) => {
              const initialValue = contractAmendmentBag.initialValues[key];
              if (initialValue !== value) {
                const label = contractAmendmentBag.fields.find(
                  (field) => field.name === key,
                )?.label as string;
                return (
                  <div className="confirmation_form__item" key={key}>
                    <p>{label}:</p>
                    {initialValue ? (
                      <div className="confirmation_form__item__value">
                        <span className="confirmation_form__item__value__initial">
                          {initialValue}
                        </span>
                        <span>&rarr;</span>
                        <span>{value as string}</span>
                      </div>
                    ) : (
                      <div className="confirmation_form__item__value">
                        <span>{value as string}</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
          {automatable?.data?.automatable ? (
            <div>{automatable?.data?.message}</div>
          ) : null}
          <div className="confirmation_form__buttons">
            <SubmitButton
              disabled={contractAmendmentBag.isSubmitting}
              className="confirmation_form__buttons__submit"
            >
              Submit amendment request
            </SubmitButton>
            <BackButton className="confirmation_form__buttons__back">
              Back
            </BackButton>
          </div>
        </div>
      );
  }
}

export function ContractAmendment() {
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
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <ContractAmendmentFlow
          countryCode="PRT"
          employmentId="1c555e8d-3119-4a25-b1a2-8afc3516a106"
          render={AmendmentFlow}
        />
      </div>
    </RemoteFlows>
  );
}
```

## Components API

### ContractAmendmentFlow

The `ContractAmendmentFlow` component lets you render different components like `Form`, `SubmitButton`, `BackButton`, and `ConfirmationForm`

The component accepts the following props:

| Prop                | Type                                                                                                                                | Required | Description                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `employmentId`      | string                                                                                                                              | Yes      | The employment id of the employee whose contract you want to amend                                                             |
| `countryCode`       | string                                                                                                                              | Yes      | The country code where the employment is based                                                                                 |
| `render`            | `({contractAmendmentBag: ReturnType<typeof useContractAmendment>, components: {Form, SubmitButton, BackButton, ConfirmationForm}})` | Yes      | render prop function with the params passed by the useContractAmendment hook and the components available to use for this flow |
| `options`           | `{jsfModify: JSFModify}`                                                                                                            | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                        |
| `jsonSchemaVersion` | `{contract_amendments: number}`                                                                                                     | No       | Allows to point to a certain version of the contract amendment json schema form                                                |

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

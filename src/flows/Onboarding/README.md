# Onboarding Docs

Welcome to the Onboarding flow docs

# Table of Contents

- [Getting Started](#getting-started)
  - [Full Example](#full-example)
  - [Without Select Country Step](#without-select-country-step)
  - [With Custom Benefits](#with-custom-benefits)
- [Components API](#components-api)
  - [OnboardingFlow](#onboardingflow)
    - [Props](#props)
    - [options.jsfModify properties](#optionsjsfmodify-properties)
  - [SelectCountryStep](#selectcountrystep)
  - [BasicInformationStep](#basicinformationstep)
  - [ContractDetailsStep](#contractdetailsstep)
  - [BenefitsStep](#benefitsstep)
  - [SubmitButton](#submitbutton)
  - [BackButton](#backbutton)
  - [OnboardingInvite](#onboardinginvite)
  - [ReviewStep](#reviewstep)
- [OnboardingBag Properties](#onboardingbag-properties)
- [Configuration Options](#configuration-options)
  - [options.jsfModify properties](#optionsjsfmodify-properties)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Full Example

```tsx
import {
  OnboardingFlow,
  RemoteFlows,
  OnboardingRenderProps,
  SuccessResponse,
  BenefitsFormPayload,
  BasicInformationFormPayload,
  EmploymentCreationResponse,
  EmploymentResponse,
  ContractDetailsFormPayload,
  SelectCountrySuccess,
  SelectCountryFormPayload,
} from '@remoteoss/remote-flows';
import React, { useState } from 'react';
import './css/main.css';

// Mock ReviewStep component - see full implementation at:
// https://github.com/remoteoss/remote-flows/blob/main/example/src/ReviewStep.tsx
const ReviewStep = ({
  onboardingBag,
  components,
  apiError,
  setApiError,
}: any) => <div>Review Step Component</div>;

const STEPS = [
  'Select Country',
  'Basic Information',
  'Contract Details',
  'Benefits',
  'Review & Invite',
];

const MultiStepForm = ({
  components,
  onboardingBag,
}: OnboardingRenderProps) => {
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
    SelectCountryStep,
  } = components;
  const [apiError, setApiError] = useState<string | null>();

  switch (onboardingBag.stepState.currentStep.name) {
    case 'select_country':
      return (
        <>
          <SelectCountryStep
            onSubmit={(payload: SelectCountryFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(response: SelectCountrySuccess) =>
              console.log('response', response)
            }
            onError={(error: Error) => setApiError(error.message)}
          />
          <div className="buttons-container">
            <SubmitButton
              className="submit-button"
              disabled={onboardingBag.isSubmitting}
              variant="outline"
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={(payload: BasicInformationFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentCreationResponse) =>
              console.log('data', data)
            }
            onError={(error: Error) => setApiError(error.message)}
          />
          {apiError && <p className="alert-error">{apiError}</p>}
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              className="submit-button"
              disabled={onboardingBag.isSubmitting}
              onClick={() => setApiError(null)}
            >
              Create Employment & Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'contract_details':
      return (
        <>
          <ContractDetailsStep
            onSubmit={(payload: ContractDetailsFormPayload) =>
              console.log('payload', payload)
            }
            onSuccess={(data: EmploymentResponse) => console.log('data', data)}
            onError={(error: Error) => setApiError(error.message)}
          />
          {apiError && <p className="alert-error">{apiError}</p>}
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              className="submit-button"
              onClick={() => setApiError(null)}
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </>
      );
    case 'benefits':
      return (
        <div className="benefits-container">
          <BenefitsStep
            onSubmit={(payload: BenefitsFormPayload) =>
              console.log('payload', payload)
            }
            onError={(error: Error) => setApiError(error.message)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          {apiError && <p className="alert-error">{apiError}</p>}
          <div className="buttons-container">
            <BackButton
              className="back-button"
              onClick={() => setApiError(null)}
            >
              Previous Step
            </BackButton>
            <SubmitButton
              onClick={() => setApiError(null)}
              className="submit-button"
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    case 'review':
      return (
        <ReviewStep
          onboardingBag={onboardingBag}
          components={components}
          apiError={apiError}
          setApiError={setApiError}
        />
      );
  }
};

const OnBoardingRender = ({
  onboardingBag,
  components,
}: OnboardingRenderProps) => {
  const currentStepIndex = onboardingBag.stepState.currentStep.index;
  const stepTitle = STEPS[currentStepIndex];

  if (onboardingBag.isLoading) {
    return <p>Loading...</p>;
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
        <MultiStepForm onboardingBag={onboardingBag} components={components} />
      </div>
    </>
  );
};

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

export const OnboardingForm = () => (
  <RemoteFlows auth={fetchToken}>
    <OnboardingFlow
      companyId="c3c22940-e118-425c-9e31-f2fd4d43c6d8"
      type="employee"
      render={OnBoardingRender}
      employmentId=""
    />
  </RemoteFlows>
);
```

### Without Select Country Step

If you want to skip the country selection step and provide the country code directly:

```tsx
import {
  OnboardingFlow,
  RemoteFlows,
  OnboardingRenderProps,
  // ... other imports
} from '@remoteoss/remote-flows';

// Mock ReviewStep component - see full implementation at:
// https://github.com/remoteoss/remote-flows/blob/main/example/src/ReviewStep.tsx
const ReviewStep = ({
  onboardingBag,
  components,
  apiError,
  setApiError,
}: any) => <div>Review Step Component</div>;

const STEPS = [
  'Basic Information',
  'Contract Details',
  'Benefits',
  'Review & Invite',
];

// ... MultiStepForm component (same as above but without SelectCountryStep)

export const OnboardingForm = () => (
  <RemoteFlows auth={fetchToken}>
    <OnboardingFlow
      companyId="c3c22940-e118-425c-9e31-f2fd4d43c6d8"
      type="employee"
      render={OnBoardingRender}
      employmentId="afe2f0dd-2a07-425a-a8f7-4fdf4f8f4395"
      countryCode="CAN"
      options={{
        jsfModify: {
          basic_information: {
            fields: {
              name: {
                title: 'Full Name...',
              },
            },
          },
          contract_details: {
            fields: {
              annual_gross_salary: {
                title: 'Test label',
                presentation: {
                  annual_gross_salary_conversion_properties: {
                    label: 'Annual Gross Salary Conversion',
                    description:
                      'This is the conversion of your annual gross salary to the desired currency.',
                  },
                },
              },
              has_signing_bonus: {
                title: 'Signing Bonus...',
              },
            },
          },
        },
      }}
    />
  </RemoteFlows>
);
```

### With Custom Benefits

Customize the benefits step with your own UI components:

```tsx
import {
  OnboardingFlow,
  RemoteFlows,
  OnboardingRenderProps,
  // ... other imports
} from '@remoteoss/remote-flows';

// Mock ReviewStep component - see full implementation at:
// https://github.com/remoteoss/remote-flows/blob/main/example/src/ReviewStep.tsx
const ReviewStep = ({
  onboardingBag,
  components,
  apiError,
  setApiError,
}: any) => <div>Review Step Component</div>;

const MultiStepForm = ({
  onboardingBag,
  components,
}: OnboardingRenderProps) => {
  const [apiError, setApiError] = useState<string | null>();
  const {
    BasicInformationStep,
    ContractDetailsStep,
    BenefitsStep,
    SubmitButton,
    BackButton,
  } = components;

  switch (onboardingBag.stepState.currentStep.name) {
    // ... other cases
    case 'benefits':
      return (
        <div className="benefits-container">
          <BenefitsStep
            components={{
              radio: ({ field, fieldData }) => {
                const selectedValue = field.value;

                type OptionWithMeta = {
                  value: string;
                  label: string;
                  description?: string;
                  meta?: { display_cost?: string };
                };

                return (
                  <div className="benefit-cards-container">
                    {(fieldData.options as OptionWithMeta[] | undefined)?.map(
                      (option) => {
                        const isSelected = selectedValue === option.value;
                        const meta = option.meta || {};
                        return (
                          <label
                            key={option.value}
                            className={`benefit-card${isSelected ? ' benefit-card--selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={option.value}
                              checked={isSelected}
                              onChange={field.onChange}
                              style={{ display: 'none' }}
                            />
                            <div
                              className="benefit-card__label"
                              title={option.label}
                            >
                              {option.label}
                            </div>
                            <div className="benefit-card__summary">
                              {option.description || 'Plan summary'}
                            </div>
                            <div className="benefit-card__cost">
                              {meta.display_cost || ''}
                            </div>
                            <button
                              type="button"
                              className={`benefit-card__button${isSelected ? ' benefit-card__button--selected' : ''}`}
                              tabIndex={-1}
                            >
                              {isSelected
                                ? 'Plan Selected!'
                                : 'Select This Plan'}
                            </button>
                            {isSelected && (
                              <span className="benefit-card__selected-check">
                                ✓ Plan Selected!
                              </span>
                            )}
                          </label>
                        );
                      },
                    )}
                  </div>
                );
              },
            }}
            onSubmit={(payload: BenefitsFormPayload) =>
              console.log('payload', payload)
            }
            onError={(error: Error) => setApiError(error.message)}
            onSuccess={(data: SuccessResponse) => console.log('data', data)}
          />
          {apiError && <p className="alert-error">{apiError}</p>}
          <div className="buttons-container">
            <BackButton className="back-button">Previous Step</BackButton>
            <SubmitButton
              className="submit-button"
              disabled={onboardingBag.isSubmitting}
            >
              Continue
            </SubmitButton>
          </div>
        </div>
      );
    // ... other cases
  }
};

export const OnboardingForm = () => (
  <RemoteFlows auth={fetchToken}>
    <OnboardingFlow
      companyId="your-company-id"
      type="employee"
      render={MultiStepForm}
      employmentId=""
    />
  </RemoteFlows>
);
```

## Components API

### OnboardingFlow

The `OnboardingFlow` component lets you render different components like `SelectCountryStep`, `BasicInformationStep`, `ContractDetailsStep`, `BenefitsStep`, `SubmitButton`, `BackButton`, `OnboardingInvite`, `ReviewStep`

The component accepts the following props:

| Prop           | Type                                                                                                                                                                                                    | Required | Description                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `companyId`    | string                                                                                                                                                                                                  | Yes      | The company ID where the employee will be onboarded                                                                     |
| `type`         | `'employee' \| 'contractor'`                                                                                                                                                                            | Yes      | The type of employment relationship                                                                                     |
| `employmentId` | string                                                                                                                                                                                                  | No       | The employment ID if you want to update an existing employment                                                          |
| `countryCode`  | string                                                                                                                                                                                                  | No       | The country code where the employment is based (if not provided, SelectCountryStep will be shown)                       |
| `render`       | `({onboardingBag: ReturnType<typeof useOnboarding>, components: {SelectCountryStep, BasicInformationStep, ContractDetailsStep, BenefitsStep, SubmitButton, BackButton, OnboardingInvite, ReviewStep}})` | Yes      | render prop function with the params passed by the useOnboarding hook and the components available to use for this flow |
| `options`      | `{jsfModify: {basic_information?: JSFModify, contract_details?: JSFModify, benefits?: JSFModify}}`                                                                                                      | No       | See detailed explanation below                                                                                          |

#### options.jsfModify properties

The `options.jsfModify` object accepts keys for each step (`basic_information`, `contract_details`, `benefits`) where each value is a `JSFModify` object. The `JSFModify` type accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library accepts.

### SelectCountryStep

It renders the country selection step and its respective fields.

| Prop        | Type                                          | Required | Description                                                                                  |
| ----------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `onSubmit`  | `(payload: SelectCountryFormPayload) => void` | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess` | `(response: SelectCountrySuccess) => void`    | No       | Callback with the successful country selection data                                          |
| `onError`   | `(error: Error) => void`                      | No       | Error handling callback                                                                      |

### BasicInformationStep

It renders the basic information step and the fields of the onboarding flow.

| Prop        | Type                                             | Required | Description                                                                                  |
| ----------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `onSubmit`  | `(payload: BasicInformationFormPayload) => void` | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess` | `(response: EmploymentCreationResponse) => void` | No       | Callback with the successful employment creation data                                        |
| `onError`   | `(error: Error) => void`                         | No       | Error handling callback                                                                      |

### ContractDetailsStep

It renders the contract details step and the fields of the onboarding flow.

| Prop        | Type                                            | Required | Description                                                                                  |
| ----------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `onSubmit`  | `(payload: ContractDetailsFormPayload) => void` | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess` | `(response: EmploymentResponse) => void`        | No       | Callback with the successful contract details data                                           |
| `onError`   | `(error: Error) => void`                        | No       | Error handling callback                                                                      |

### BenefitsStep

It renders the benefits step and the fields of the onboarding flow.

| Prop         | Type                                     | Required | Description                                                                                  |
| ------------ | ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `onSubmit`   | `(payload: BenefitsFormPayload) => void` | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess`  | `(response: SuccessResponse) => void`    | No       | Callback with the successful benefits data                                                   |
| `onError`    | `(error: Error) => void`                 | No       | Error handling callback                                                                      |
| `components` | `Components`                             | No       | Custom components to override default field rendering                                        |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the OnboardingFlow component to ensure proper functionality.

### BackButton

It renders the back button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the OnboardingFlow component to ensure proper functionality.

### OnboardingInvite

Component that handles the invitation process and reserve invoice creation based on the company's credit risk status. It automatically determines whether to create a reserve invoice or send an invitation based on the `creditRiskStatus`.

| Prop        | Type                                                                                           | Required | Description                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `onSubmit`  | `() => void \| Promise<void>`                                                                  | No       | Callback that runs before the invitation/reserve process starts                  |
| `onSuccess` | `({data: SuccessResponse, employmentStatus: 'invited' \| 'created_awaiting_reserve'}) => void` | No       | Callback with the successful invitation or reserve creation data                 |
| `onError`   | `(error: unknown) => void`                                                                     | No       | Error handling callback                                                          |
| `render`    | `({employmentStatus: 'invited' \| 'created_awaiting_reserve'}) => ReactNode`                   | Yes      | Render prop function to customize the button text based on the employment status |
| `disabled`  | `boolean`                                                                                      | No       | Whether the button should be disabled                                            |
| `...props`  | `ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>`                            | No       | All standard button props and additional custom props                            |

#### Usage Example

```tsx
<OnboardingInvite
  onSuccess={({ data, employmentStatus }) => {
    console.log('Success:', data);
    if (employmentStatus === 'created_awaiting_reserve') {
      console.log('Reserve invoice created');
    } else {
      console.log('Employee invited');
    }
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
  render={({ employmentStatus }) => {
    return employmentStatus === 'created_awaiting_reserve'
      ? 'Create Reserve'
      : 'Invite Employee';
  }}
  className="submit-button"
/>
```

### ReviewStep

Component that renders the credit risk flow UI based on the company's credit risk status and employment state. It uses a render prop to let you customize the UI for different credit risk scenarios.

| Prop     | Type                                                                                                 | Required | Description                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `render` | `({creditRiskState: CreditRiskState, creditRiskStatus: CreditRiskStatus \| undefined}) => ReactNode` | Yes      | Render prop function to customize the review step UI based on credit risk state |

#### Credit Risk States

The `creditRiskState` can have the following values:

- **`'deposit_required'`** - Deposit payment is required but not yet paid
- **`'deposit_required_successful'`** - Deposit payment has been successfully processed
- **`'invite'`** - Regular invite flow is available (no deposit required)
- **`'invite_successful'`** - Invitation has been successfully sent
- **`null`** - No specific credit risk state applies

#### Usage Example

```tsx
<ReviewStep
  render={({ creditRiskState, creditRiskStatus }) => {
    switch (creditRiskState) {
      case 'deposit_required':
        return (
          <div>
            <h2>Confirm Details & Continue</h2>
            <p>
              Click Continue to check if your reserve invoice is ready for
              payment.
            </p>
            <OnboardingInvite
              render={({ employmentStatus }) => 'Create Reserve'}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        );

      case 'deposit_required_successful':
        return (
          <div>
            <h2>You'll receive a reserve invoice soon</h2>
            <p>
              We saved the details as a draft. You'll be able to invite them
              after completing the reserve payment.
            </p>
          </div>
        );

      case 'invite':
        return (
          <div>
            <h2>Ready to invite employee to Remote?</h2>
            <p>
              If you're ready to invite this employee to onboard with Remote,
              click the button below.
            </p>
            <OnboardingInvite
              render={({ employmentStatus }) => 'Invite Employee'}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        );

      case 'invite_successful':
        return (
          <div>
            <h2>You're all set!</h2>
            <p>
              The employee has been invited to Remote. We'll let you know once
              they complete their onboarding process.
            </p>
          </div>
        );

      default:
        return null;
    }
  }}
/>
```

## OnboardingBag Properties

The `onboardingBag` object returned by the `useOnboarding` hook contains the following properties:

| Property               | Type                                                                                                                            | Description                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employmentId`         | `string \| undefined`                                                                                                           | Employment ID passed useful to be used between components                                                                                           |
| `creditRiskStatus`     | `'not_started' \| 'ready' \| 'in_progress' \| 'referred' \| 'fail' \| 'deposit_required' \| 'no_deposit_required' \| undefined` | Credit risk status of the company, useful to know what to show in the review step                                                                   |
| `owner_id`             | `string \| undefined`                                                                                                           | Company owner user ID                                                                                                                               |
| `stepState`            | `{ currentStep: { name: string; index: number }; totalSteps: number; values: Record<string, any> } }`                           | Current step state containing the current step and total number of steps                                                                            |
| `fields`               | `Fields[]`                                                                                                                      | Array of form fields from the onboarding schema for the current step                                                                                |
| `isLoading`            | `boolean`                                                                                                                       | Loading state indicating if the onboarding schema is being fetched                                                                                  |
| `isSubmitting`         | `boolean`                                                                                                                       | Loading state indicating if the onboarding mutation is in progress                                                                                  |
| `initialValues`        | `Record<string, any>`                                                                                                           | Initial form values for the current step                                                                                                            |
| `handleValidation`     | `(values: FieldValues) => ValidationResult \| null`                                                                             | Function to validate form values against the onboarding schema                                                                                      |
| `checkFieldUpdates`    | `(values: FieldValues) => void`                                                                                                 | Function to update the current form field values                                                                                                    |
| `parseFormValues`      | `(values: FieldValues) => any`                                                                                                  | Function to parse form values before submission                                                                                                     |
| `onSubmit`             | `(values: FieldValues) => Promise<any>`                                                                                         | Function to handle form submission                                                                                                                  |
| `back`                 | `() => void`                                                                                                                    | Function to handle going back to the previous step                                                                                                  |
| `next`                 | `() => void`                                                                                                                    | Function to handle going to the next step                                                                                                           |
| `goTo`                 | `(step: string) => void`                                                                                                        | Function to handle going to a specific step                                                                                                         |
| `meta`                 | `{ fields: Record<string, any> }`                                                                                               | Fields metadata for each step with prettified values                                                                                                |
| `refetchEmployment`    | `() => void`                                                                                                                    | Function to refetch the employment data                                                                                                             |
| `employment`           | `Employment \| undefined`                                                                                                       | Employment data object                                                                                                                              |
| `isEmploymentReadOnly` | `boolean`                                                                                                                       | Indicates that the employment cannot be edited (happens when employment.status is `invited`, `created_awaiting_reserve`, or `created_reserve_paid`) |

### Credit Risk Status Values

The `creditRiskStatus` property can have the following values:

- **`not_started`** - Credit risk assessment has not been initiated
- **`ready`** - Credit risk assessment is ready to proceed
- **`in_progress`** - Credit risk assessment is currently being processed
- **`referred`** - Credit risk assessment has been referred for manual review
- **`fail`** - Credit risk assessment has failed
- **`deposit_required`** - A deposit payment is required to proceed
- **`no_deposit_required`** - No deposit payment is required

### Step Names

The `stepState.currentStep.name` can have the following values:

- **`select_country`** - Country selection step
- **`basic_information`** - Basic employee information step
- **`contract_details`** - Contract details step
- **`benefits`** - Benefits selection step
- **`review`** - Review and invitation step

## Configuration Options

#### options.jsfModify properties

The `options.jsfModify` object accepts keys for each step (`basic_information`, `contract_details`, `benefits`) where each value is a `JSFModify` object. The `JSFModify` type accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library accepts.

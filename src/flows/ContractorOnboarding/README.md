# ContractorOnboarding Flow

The ContractorOnboarding flow is a multi-step wizard designed to onboard independent contractors. It guides users through collecting essential information, defining contract terms, setting pricing, and finalizing contract signatures.

## Overview

The flow manages the complete lifecycle of contractor engagement, from initial information collection to contract signature. It supports both creating new employments and updating existing ones with contract documents and subscription management.

## Flow Steps

The contractor onboarding process consists of the following steps in order:

1. **Select Country** - Choose the country where the contractor will provide services
2. **Basic Information** - Collect contractor's personal and professional details
3. **Contract Details** - Define contract terms including services, duration, compensation, and notice periods
4. **Pricing Plan** - Select and configure subscription/pricing tier
5. **Contract Preview** - Review and electronically sign the generated contract
6. **Review** - Final review step (internal)

### Skipping Steps

You can skip the `select_country` step by passing `skipSteps: ['select_country']` if the country is already known via the `countryCode` prop.

## Usage

### Basic Setup

```tsx
import { ContractorOnboardingFlow } from '@remoteoss/remote-flows';

<RemoteFlows auth={fetchToken} theme={theme}>
  <ContractorOnboardingFlow
    render={({ contractorOnboardingBag, components }) => {
      const { BasicInformationStep, SelectCountryStep, ... } = components;
      // Render multi-step form
    }}
  />
</RemoteFlows>
```

### Props

#### `ContractorOnboardingFlowProps`

| Prop            | Type                                                          | Required | Description                                                                                                                  |
| --------------- | ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `render`        | `(props: ContractorOnboardingRenderProps) => React.ReactNode` | Yes      | Render prop function that receives the contractor onboarding bag and available components                                    |
| `countryCode`   | `string`                                                      | No       | Pre-selected country code for the contractor                                                                                 |
| `employmentId`  | `string`                                                      | No       | ID of existing employment to update. When provided, fetches existing data from the server                                    |
| `externalId`    | `string`                                                      | No       | Unique reference code for the employment in external systems (non-Remote). Links to external data sources                    |
| `skipSteps`     | `['select_country']`                                          | No       | Steps to skip. Currently only supports skipping the select_country step                                                      |
| `initialValues` | `Record<string, unknown>`                                     | No       | Pre-populate form fields. Flat field values are automatically mapped to the correct step. Server data overrides these values |
| `options`       | `FlowOptions`                                                 | No       | Configuration options for the flow, including `jsfModify` for customizing specific steps                                     |

### Render Props

The render function receives an object with:

- **`contractorOnboardingBag`** - Contains state, methods, and handlers:

  - `stepState.currentStep` - Current step information
  - `isSubmitting` - Loading state during form submission
  - `isLoading` - Loading state while fetching data
  - `parseFormValues()` - Parses form values before submission
  - `onSubmit()` - Submits the current step's form
  - `next()` - Advances to next step
  - `back()` - Returns to previous step

- **`components`** - Available step components:
  - `SelectCountryStep` - Country selection form
  - `BasicInformationStep` - Contractor details form
  - `ContractDetailsStep` - Contract terms form
  - `PricingPlanStep` - Pricing tier selection
  - `ContractPreviewStep` - Contract review and signature
  - `OnboardingInvite` - Invitation/status component
  - `SubmitButton` - Multi-purpose submit button
  - `BackButton` - Navigation back button

## Step Components

### SelectCountryStep

Renders a form for selecting the contractor's country. Must be used within the ContractorOnboardingFlow render prop.

**Props:**

- `onSubmit?: (payload: SelectCountryFormPayload) => void` - Called before submission
- `onSuccess?: (response: SelectCountrySuccess) => void` - Called on successful submission
- `onError?: (error: { error: Error; fieldErrors: NormalizedFieldError[] }) => void` - Called on error

### BasicInformationStep

Collects basic contractor information (name, contact details, professional information, etc.).

**Props:**

- `onSubmit?: (payload: BasicInformationFormPayload) => void` - Called before submission
- `onSuccess?: (data: EmploymentCreationResponse) => void` - Called on successful submission
- `onError?: (error: { error: Error; fieldErrors: NormalizedFieldError[] }) => void` - Called on error

### ContractDetailsStep

Gathers detailed contract information:

- Services and deliverables description
- Service duration (start date, optional end date)
- Termination notice periods (contractor and company)
- Payment terms (amount, currency, frequency, invoicing)

**Props:**

- `onSubmit?: (payload: ContractorOnboardingContractDetailsFormPayload) => void` - Called before submission
- `onSuccess?: (data: ContractorOnboardingContractDetailsResponse) => void` - Called on successful submission
- `onError?: (error: { error: Error; fieldErrors: NormalizedFieldError[] }) => void` - Called on error

### PricingPlanStep

Allows selection and configuration of subscription or pricing tiers for the contractor engagement.

**Props:**

- `onSubmit?: (payload: PricingPlanFormPayload) => void` - Called before submission
- `onSuccess?: (response: PricingPlanResponse) => void` - Called on successful submission
- `onError?: (error: { error: Error; fieldErrors: NormalizedFieldError[] }) => void` - Called on error

### ContractPreviewStep

Displays the generated contract document for review and electronic signature.

**Props:**

- `onSubmit?: (payload: ContractPreviewFormPayload) => void` - Called before submission
- `onSuccess?: (response: ContractPreviewResponse) => void` - Called on successful submission
- `onError?: (error: { error: Error; fieldErrors: NormalizedFieldError[] }) => void` - Called on error

## Example Implementation

```tsx
import { ContractorOnboardingFlow, RemoteFlows } from '@remoteoss/remote-flows';
import { useState } from 'react';

function ContractorOnboardingPage() {
  const [errors, setErrors] = useState({
    apiError: '',
    fieldErrors: [],
  });

  return (
    <RemoteFlows auth={fetchToken} theme={theme}>
      <ContractorOnboardingFlow
        countryCode='US'
        skipSteps={['select_country']}
        render={({ contractorOnboardingBag, components }) => {
          const {
            BasicInformationStep,
            ContractDetailsStep,
            PricingPlanStep,
            ContractPreviewStep,
            SubmitButton,
            BackButton,
          } = components;

          const currentStepName =
            contractorOnboardingBag.stepState.currentStep.name;

          return (
            <div>
              {currentStepName === 'basic_information' && (
                <>
                  <BasicInformationStep
                    onError={({ error, fieldErrors }) =>
                      setErrors({ apiError: error.message, fieldErrors })
                    }
                  />
                  <SubmitButton>Continue</SubmitButton>
                </>
              )}

              {currentStepName === 'contract_details' && (
                <>
                  <ContractDetailsStep
                    onError={({ error, fieldErrors }) =>
                      setErrors({ apiError: error.message, fieldErrors })
                    }
                  />
                  <BackButton>Back</BackButton>
                  <SubmitButton>Continue</SubmitButton>
                </>
              )}

              {currentStepName === 'pricing_plan' && (
                <>
                  <PricingPlanStep
                    onError={({ error, fieldErrors }) =>
                      setErrors({ apiError: error.message, fieldErrors })
                    }
                  />
                  <BackButton>Back</BackButton>
                  <SubmitButton>Continue</SubmitButton>
                </>
              )}

              {currentStepName === 'contract_preview' && (
                <>
                  <ContractPreviewStep
                    onSuccess={() => console.log('Contract signed!')}
                    onError={({ error, fieldErrors }) =>
                      setErrors({ apiError: error.message, fieldErrors })
                    }
                  />
                  <BackButton>Back</BackButton>
                  <SubmitButton>Sign Contract</SubmitButton>
                </>
              )}

              {errors.apiError && (
                <div className='error'>{errors.apiError}</div>
              )}
            </div>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

## Form Customization

### Customizing Specific Steps

Use the `options.jsfModify` prop to customize individual form steps:

```tsx
<ContractorOnboardingFlow
  options={{
    jsfModify: {
      basic_information: {
        fields: {
          first_name: {
            // Hide or customize field
            hidden: true,
          },
        },
      },
      contract_details: {
        // Customize contract details form
      },
    },
  }}
  render={}
/>
```

### Overriding Field Components

Override specific field presentations globally via the `RemoteFlows` components prop (see [RemoteFlows customization docs](../README.md#custom-components)).

## State Management

The `contractorOnboardingBag` provides access to:

- **Form State**: Current values, validation errors, submission state
- **Step Navigation**: Current step, ability to move forward/backward
- **Loading States**: Loading and submitting flags for UI updates
- **Server Data**: Employment details when `employmentId` is provided

## Data Flow

1. **Country Selection** (optional): User selects country, country code is stored
2. **Basic Information**: Employment record is created with basic contractor details
3. **Contract Details**: Contract document is generated and stored
4. **Pricing Plan**: Subscription tier is selected and configured
5. **Contract Preview**: Generated contract is displayed and user signs electronically
6. **Complete**: Flow finishes, contractor onboarding is complete

## Initial Values

Pre-populate form fields by passing `initialValues`:

```tsx
<ContractorOnboardingFlow
  initialValues={{
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
  }}
  render={() => {}}
/>
```

Values are mapped to the appropriate step and can be overridden by server data when `employmentId` is provided.

## Error Handling

Each step component accepts error callbacks:

```tsx
<BasicInformationStep
  onError={({ error, fieldErrors }) => {
    // Handle validation errors
    console.log('API Error:', error.message);
    console.log('Field Errors:', fieldErrors);
  }}
/>
```

Field errors contain:

- `path`: Field path (e.g., 'first_name')
- `message`: Human-readable error message
- `type`: Error type (e.g., 'validation', 'required')

## Related Documentation

- [RemoteFlows Provider](../README.md)
- [Onboarding Flow](../Onboarding/README.md)
- [JSON Schema Form Customization](../../components/form/README.md)

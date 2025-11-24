# Cost Calculator Docs

Welcome to the CostCalculator flow docs

# Table of Contents

- [Cost Calculator Docs](#cost-calculator-docs)
  - [Getting Started](#getting-started)
  - [Basic Setup](#basic-setup)
    - [Simple Cost Calculator](#simple-cost-calculator)
    - [Cost Calculator with Default Values and a Custom Disclaimer Label](#cost-calculator-with-default-values-and-a-custom-disclaimer-label)
    - [Cost Calculator with Simple Labels](#cost-calculator-with-simple-labels)
    - [Cost Calculator with Results](#cost-calculator-with-results)
    - [Cost Calculator with Button that Exports Results to PDF](#cost-calculator-with-button-that-exports-results-to-pdf)
    - [Cost Calculator with Premium Benefits](#cost-calculator-with-premium-benefits)
- [Components API](#components-api)
  - [RemoteFlows](#remoteflows)
  - [CostCalculatorFlow](#costcalculatorflow)
    - [EstimationParams Properties](#estimationparams-properties)
      - [Management Fee Configuration](#management-fee-configuration)
      - [Version Prop](#version-prop)
    - [DefaultValues Properties](#defaultvalues-properties)
  - [CostCalculatorForm](#costcalculatorform)
  - [CostCalculatorSubmitButton](#costcalculatorsubmitbutton)
  - [CostCalculatorResetButton](#costcalculatorresetbutton)
  - [CostCalculatorResults](#costcalculatorresults)
  - [SummaryResults](#summaryresults-component)
  - [useCostCalculator](#usecostcalculator)
    - [Parameters](#parameters)
    - [EstimationOptions Properties](#estimationoptions-properties)

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Basic Setup

#### Simple Cost calculator

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculator() {
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
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

#### Cost Calculator with default values and a custom disclaimer label

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorWithDefaultValues() {
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
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: 'a1aea868-0e0a-4cd7-9b73-9941d92e5bbe', // it's the region slug from the v1/cost-calculator/countries, different in each env
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba', // it's a currency slug from v1/company-currencies, different in each env
          salary: '50000',
        }}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
    </RemoteFlows>
  );
}
```

#### Cost calculator with simple labels

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

export function BasicCostCalculatorLabels() {
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
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => console.log({ response })}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
        options={{
          jsfModify: {
            fields: {
              country: {
                title: 'Select your country',
              },
              age: {
                title: 'Enter your age',
              },
            },
          },
        }}
      />
    </RemoteFlows>
  );
}
```

#### Cost calculator with results

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import { useState } from 'react';
import './css/main.css';

export function CostCalculatoWithResults() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
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
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => console.log(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => setEstimations(response)}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </RemoteFlows>
  );
}
```

#### Cost calculator with button that exports results to pdf

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
  buildCostCalculatorEstimationPayload,
} from '@remoteoss/remote-flows';
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './css/main.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorFlowWithExportPdf() {
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
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}
```

#### Cost Calculator with premium benefits

```tsx
import {
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorSubmitButton,
  CostCalculatorResetButton,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
  buildCostCalculatorEstimationPayload,
  CostCalculatorResults,
} from '@remoteoss/remote-flows';
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationSubmitValues,
} from '@remoteoss/remote-flows';
import './css/main.css';
import { useState } from 'react';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
  includePremiumBenefits: true,
};

function CostCalculatorFormDemo() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationSubmitValues | null>(null);

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(buildCostCalculatorEstimationPayload(payload), {
        onSuccess: (response) => {
          if (response?.data?.data?.content !== undefined) {
            const a = document.createElement('a');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a.href = response.data.data.content as any;
            a.download = 'estimation.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        },
        onError: (error) => {
          console.error({ error });
        },
      });
    }
  };
  return (
    <>
      <CostCalculatorFlow
        estimationOptions={estimationOptions}
        render={(props) => {
          if (props.isLoading) {
            return <div>Loading...</div>;
          }

          return (
            <div>
              <CostCalculatorForm
                onSubmit={(payload) => setPayload(payload)}
                onError={(error) => console.error({ error })}
                onSuccess={(response) => {
                  setEstimations(response);
                }}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
              <CostCalculatorResetButton>Reset</CostCalculatorResetButton>
            </div>
          );
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorFlowWithPremiumBenefits() {
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
      <CostCalculatorFormDemo />
    </RemoteFlows>
  );
}
```

## Components API

### CostCalculatorFlow

The `CostCalculatorFlow` component lets you render different components like `CostCalculatorForm`, `CostCalculatorSubmitButton`, `CostCalculatorResetButton`

| Prop               | Type                                                         | Required | Description                                                                                                               |
| ------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `estimationParams` | object                                                       | No       | Customization for the estimation response (see table below)                                                               |
| `defaultValues`    | object                                                       | No       | Predefined form values (see table below)                                                                                  |
| `render`           | `(costCalculatorBag:  ReturnType<typeof useCostCalculator>)` | Yes      | render prop function with the params passed by the useCostCalculator hook                                                 |
| `options`          | `{jsfModify: JSFModify}`                                     | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                   |
| `version`          | `'standard' \| 'marketing'`                                  | No       | Controls payload structure. `'standard'` includes `annual_gross_salary`, `'marketing'` excludes it. Default: `'standard'` |

#### estimationParams Properties

| Property                   | Type                           | Description                                                     |
| -------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `title`                    | `string`                       | Custom title for the estimation report                          |
| `includeBenefits`          | `boolean`                      | If `true`, includes benefits information in the response        |
| `includeCostBreakdowns`    | `boolean`                      | If `true`, includes detailed cost breakdowns in the response    |
| `includePremiumBenefits`   | `boolean`                      | If `true`, includes detailed premium benefits in the response   |
| `includeManagementFee`     | `boolean`                      | If `true`, includes the management fee in the response          |
| `enableCurrencyConversion` | `boolean`                      | If `true`, enables currency conversion in the salary field      |
| `managementFees`           | `Record<CurrencyCode, number>` | Override the base management fees from the SDK                  |
| `showManagementFee`        | `boolean`                      | If `true`, includes the management fee in the input in the form |

##### Management Fee Configuration

The management fee behavior can be configured using a combination of `includeManagementFee` and `showManagementFee`:

1. No management fees (hide completely):

```typescript
{
  includeManagementFee: false,
  showManagementFeeInput: false
}
```

This configuration excludes management fees from both the estimation results and the UI.

2. Use Remote base prices (show in estimation only):

```typescript
{
  includeManagementFee: true,
  showManagementFeeInput: false
}
```

This configuration includes management fees in the estimation using Remote's base prices, but hides the management fee input field in the UI.

3. Full management fee control:

```typescript
{
  includeManagementFee: true,
  showManagementFeeInput: true
}
```

This configuration shows management fees in both the estimation results and provides a UI input field for customizing the fee.

##### Version prop

The `version` prop (`'standard' | 'marketing'`) controls three key behaviors in the cost calculator:

1. Currency Conversion:

   - `marketing`: Uses `no_spread` (raw exchange rate without additional fees/risk margins)
   - `standard`: Uses `spread` (includes forex risk and service fees in exchange rate)

2. UI/Form Elements:

   - `marketing`: Hiring budget radio option is hidden
   - `standard`: Hiring budget radio option is shown

3. Salary Field Behavior:

   - Marketing Version:
     - Based on last input field used:
       - If last input was in country's currency → `annual_gross_salary`
       - If last input was in employer's currency → `annual_gross_salary_in_employer_currency`
   - Standard Version:
     - When hiring budget is NOT selected:
       - If country currency matches selected currency → `annual_gross_salary`
       - If currencies are different → `annual_gross_salary_in_employer_currency`
     - When hiring budget IS selected:
       - If country currency matches selected currency → `annual_total_cost`
       - If currencies are different → `annual_total_cost_in_employer_currency`

Note: The spread in currency conversion accounts for foreign exchange risk (currency fluctuations), transaction costs, and service fees.

#### defaultValues Properties

| Property            | Type     | Description                 |
| ------------------- | -------- | --------------------------- |
| `countryRegionSlug` | `string` | Pre-selected country/region |
| `currencySlug`      | `string` | Pre-selected currency       |
| `salary`            | `string` | Pre-filled salary amount    |
| `hiringBudget`      | `string` | Pre-filled hiring budget    |

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

### CostCalculatorForm

It renders the form and the fields of the cost calculator

| Prop              | Type                                                 | Required | Description                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onSubmit`        | `(payload: CostCalculatorEstimateParams) => void`    | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote                                                                                                             |
| `onSuccess`       | `(response: CostCalculatorEstimateResponse) => void` | No       | Callback with the successful estimation data                                                                                                                                                             |
| `onError`         | `(error: Error) => void`                             | No       | Error handling callback                                                                                                                                                                                  |
| `shouldResetForm` | `boolean`                                            | No       | If true, the form will be reset after a successful submission. Default is `false`.                                                                                                                       |
| `resetFields`     | `Array<'country' or 'currency' or 'salary'>`         | No       | Clears specified form fields. Pass field names as an array (e.g., ['country']). When resetting nested fields like 'country', related dependent fields (e.g., region) will also be cleared automatically. |

#### About `shouldResetForm` and `resetFields`

If used both at the same time, shouldResetForm will take precedence

### CostCalculatorSubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the CostCalculatorFlow component to ensure proper functionality

### CostCalculatorResetButton

It renders the reset button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the CostCalculatorFlow component to ensure proper functionality

# SummaryResults Component

A component that displays a comparative summary of costs across multiple estimations.

## Requirements

- **Minimum Estimations**: The component requires at least 2 estimations to render. It will return `null` if fewer estimations are provided.
- **Currency**: All estimations must use the same currency (taken from the first estimation).

## Props

| Prop          | Type                         | Description                                                                                       |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `estimations` | `CostCalculatorEstimation[]` | Array of employments to compare. **Must contain at least 2 entries** for the component to render. |

### useCostCalculator

The `useCostCalculator` hook provides access to the underlying functionality of the cost calculator, allowing for custom implementations.

| Property           | Type                                                                                                                 | Description                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `stepState`        | `{ current: number; total: number; isLastStep: boolean }`                                                            | Information about the current step in multi-step forms                                                                   |
| `fields`           | `Field[]`                                                                                                            | Array of form field definitions with metadata ([json-schema-form](https://github.com/remoteoss/json-schema-form) format) |
| `validationSchema` | `yup.Schema`                                                                                                         | Yup validation schema for the form                                                                                       |
| `handleValidation` | `Function`                                                                                                           | Function to handle custom field validation                                                                               |
| `isSubmitting`     | `boolean`                                                                                                            | Whether the form is currently submitting                                                                                 |
| `isLoading`        | `boolean`                                                                                                            | Whether any required data is still loading                                                                               |
| `onSubmit`         | `(values: CostCalculatorEstimationSubmitValues) => Promise<Result<CostCalculatorEstimateResponse, EstimationError>>` | Function to submit the form data to the Remote API                                                                       |
| `resetForm`        | `Function`                                                                                                           | Function that clears country and region selection state                                                                  |

#### Parameters

| Parameter           | Type                              | Required | Description                                                                                    |
| ------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `defaultRegion`     | `string`                          | No       | Pre-selected region slug                                                                       |
| `estimationOptions` | `CostCalculatorEstimationOptions` | Yes      | Options for the cost estimation (same as `estimationParams` in the `CostCalculator` component) |

The `estimationOptions` object has the following properties:

| Property                   | Type                           | Description                                                     |
| -------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `title`                    | `string`                       | Custom title for the estimation report                          |
| `includeBenefits`          | `boolean`                      | If `true`, includes benefits information in the response        |
| `includeCostBreakdowns`    | `boolean`                      | If `true`, includes detailed cost breakdowns in the response    |
| `includePremiumBenefits`   | `boolean`                      | If `true`, includes detailed premium benefits in the response   |
| `includeManagementFee`     | `boolean`                      | If `true`, includes the management fee in the response          |
| `enableCurrencyConversion` | `boolean`                      | If `true`, enables currency conversion in the salary field      |
| `managementFees`           | `Record<CurrencyCode, number>` | Override the base management fees from the SDK                  |
| `showManagementFee`        | `boolean`                      | If `true`, includes the management fee in the input in the form |

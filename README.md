# @remoteoss/remote-flows

## Overview

Welcome to the `@remoteoss/remote-flows` package, a React library that provides components for Remote's embbeded solution.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Basic Setup](#basic-setup)
    - [Simple Cost calculator](#simple-cost-calculator)
    - [Cost Calculator with default values and a custom disclaimer label](#cost-calculator-with-default-values-and-a-custom-disclaimer-label)
    - [Cost calculator with results](#cost-calculator-with-results)
    - [Cost calculator with button that exports results to pdf](#cost-calculator-with-button-that-exports-results-to-pdf)
- [Components API](#components-api)
  - [RemoteFlows](#remoteflows)
  - [CostCalculator](#costcalculator)
  - [CostCalculatorResults](#costcalculatorresults)
- [Authentication](#authentication)
- [Styling Options](#styling-options)
  - [Using Default Styles](#using-default-styles)
  - [Theme Customization](#theme-customization)
  - [CSS Overrides](#css-overrides)
- [Advanced Usage](#advanced-usage)
  - [Custom Implementation](#custom-implementation)
- [Example](#example)

## Installation

```sh
npm install @remoteoss/remote-flows
```

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Basic Setup

#### Simple Cost calculator

```tsx
import { CostCalculator, RemoteFlows } from '@remoteoss/remote-flows';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorForm() {
  return (
    <CostCalculator
      estimationOptions={estimationOptions}
      defaultValues={{
        countryRegionSlug: 'a1aea868-0e0a-4cd7-9b73-9941d92e5bbe',
        currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
        salary: '50000',
      }}
      params={{
        disclaimer: {
          label: 'Remote Disclaimer',
        },
      }}
      onSuccess={(response) => console.log({ response })}
    />
  );
}

export function BasicCostCalculator() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;

  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
```

#### Cost Calculator with default values and a custom disclaimer label

```tsx
import { CostCalculator, RemoteFlows } from '@remoteoss/remote-flows';
import './App.css';

const estimationOptions = {
  title: 'Estimate for a new company',
  includeBenefits: true,
  includeCostBreakdowns: true,
};

function CostCalculatorForm() {
  return (
    <CostCalculator
      defaultValues={{
        countryRegionSlug: 'a1aea868-0e0a-4cd7-9b73-9941d92e5bbe',
        currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
        salary: '50000',
      }}
      params={{
        disclaimer: {
          label: 'Remote Disclaimer',
        },
      }}
      estimationOptions={estimationOptions}
      onSuccess={(response) => console.log({ response })}
    />
  );
}

export function BasicCostCalculatorWithDefaultValues() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;

  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
```

#### Cost calculator with results

```tsx
import type { CostCalculatorEstimateResponse } from '@remoteoss/remote-flows';
import {
  CostCalculator,
  CostCalculatorResults,
  RemoteFlows,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
  };

  return (
    <>
      <CostCalculator
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: 'bf098ccf-7457-4556-b2a8-80c48f67cca4',
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
          salary: '50000',
        }}
        params={{
          disclaimer: {
            label: 'Remote Disclaimer',
          },
        }}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
    </>
  );
}

export function CostCalculatoWithResults() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;

  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
```

#### Cost calculator with button that exports results to pdf

```tsx
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculator,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
  };

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
      <CostCalculator
        estimationOptions={estimationOptions}
        defaultValues={{
          countryRegionSlug: 'bf098ccf-7457-4556-b2a8-80c48f67cca4',
          currencySlug: 'eur-acf7d6b5-654a-449f-873f-aca61a280eba',
          salary: '50000',
        }}
        params={{
          disclaimer: {
            label: 'Remote Disclaimer',
          },
        }}
        onSubmit={(payload) => setPayload(payload)}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

export function CostCalculatorWithExportPdf() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;

  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
```

#### Cost Calculator with premium benefits

```tsx
import type {
  CostCalculatorEstimateResponse,
  CostCalculatorEstimationFormValues,
} from '@remoteoss/remote-flows';
import {
  buildCostCalculatorEstimationPayload,
  CostCalculator,
  CostCalculatorResults,
  RemoteFlows,
  useCostCalculatorEstimationPdf,
} from '@remoteoss/remote-flows';
import { useState } from 'react';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] =
    useState<CostCalculatorEstimationFormValues | null>(null);

  const estimationOptions = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
    includePremiumBenefits: true,
  };

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(
        buildCostCalculatorEstimationPayload(payload, estimationOptions),
        {
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
        },
      );
    }
  };

  return (
    <>
      <CostCalculator
        estimationOptions={estimationOptions}
        options={{
          disclaimer: {
            label: 'Remote Disclaimer',
          },
        }}
        onSubmit={(payload) => setPayload(payload)}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && (
        <div className="cost-calculator__results">
          <CostCalculatorResults employmentData={estimations.data} />
        </div>
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

function CostCalculatorWithPremiumBenefits() {
  const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;

  const fetchToken = () => {
    return fetch(`/api/token?refresh_token=${refreshToken}`)
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
    <div className="cost-calculator__container">
      <RemoteFlows auth={() => fetchToken()}>
        <CostCalculatorForm />
      </RemoteFlows>
    </div>
  );
}
```

## Components API

### RemoteFlows

The `RemoteFlows` component serves as a provider for authentication and theming.

| Prop            | Type                                                        | Required | Description                                                        |
| --------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `auth`          | `() => Promise<{ accessToken: string, expiresIn: number }>` | Yes      | Function to fetch authentication token                             |
| `isTestingProp` | `boolean`                                                   | No       | When `true`, connects to sandbox environment instead of production |
| `theme`         | `ThemeOptions`                                              | No       | Custom theme configuration                                         |

### CostCalculator

The `CostCalculator` component renders a form for calculating employment costs.

| Prop               | Type                                                 | Required | Description                                                                                  |
| ------------------ | ---------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `estimationParams` | object                                               | No       | Customization for the estimation response (see table below)                                  |
| `defaultValues`    | object                                               | No       | Predefined form values (see table below)                                                     |
| `params`           | `{ disclaimer?: { label?: string } }`                | No       | Additional configuration parameters                                                          |
| `onSubmit`         | `(payload: CostCalculatorEstimateParams) => void`    | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote |
| `onSuccess`        | `(response: CostCalculatorEstimateResponse) => void` | No       | Callback with the successful estimation data                                                 |
| `onError`          | `(error: Error) => void`                             | No       | Error handling callback                                                                      |

#### estimationParams Properties

| Property                | Type      | Description                                                  |
| ----------------------- | --------- | ------------------------------------------------------------ |
| `title`                 | `string`  | Custom title for the estimation report                       |
| `includeBenefits`       | `boolean` | If `true`, includes benefits information in the response     |
| `includeCostBreakdowns` | `boolean` | If `true`, includes detailed cost breakdowns in the response |

#### defaultValues Properties

| Property            | Type     | Description                 |
| ------------------- | -------- | --------------------------- |
| `countryRegionSlug` | `string` | Pre-selected country/region |
| `currencySlug`      | `string` | Pre-selected currency       |
| `salary`            | `string` | Pre-filled salary amount    |

### CostCalculatorResults

A component to display cost calculation results.

| Prop             | Type                                 | Required | Description                  |
| ---------------- | ------------------------------------ | -------- | ---------------------------- |
| `employmentData` | `CostCalculatorEstimateResponseData` | Yes      | The estimation response data |

### useCostCalculator

The `useCostCalculator` hook provides access to the underlying functionality of the cost calculator, allowing for custom implementations.

| Property           | Type                                                                                                               | Description                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `stepState`        | `{ current: number; total: number; isLastStep: boolean }`                                                          | Information about the current step in multi-step forms                                                                   |
| `fields`           | `Field[]`                                                                                                          | Array of form field definitions with metadata ([json-schema-form](https://github.com/remoteoss/json-schema-form) format) |
| `validationSchema` | `yup.Schema`                                                                                                       | Yup validation schema for the form                                                                                       |
| `handleValidation` | `Function`                                                                                                         | Function to handle custom field validation                                                                               |
| `isSubmitting`     | `boolean`                                                                                                          | Whether the form is currently submitting                                                                                 |
| `isLoading`        | `boolean`                                                                                                          | Whether any required data is still loading                                                                               |
| `onSubmit`         | `(values: CostCalculatorEstimationFormValues) => Promise<Result<CostCalculatorEstimateResponse, EstimationError>>` | Function to submit the form data to the Remote API                                                                       |
| `resetForm`        | `Function`                                                                                                         | Function that clears country and region selection state                                                                  |

#### Parameters

| Parameter           | Type                              | Required | Description                                                                                    |
| ------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `defaultRegion`     | `string`                          | No       | Pre-selected region slug                                                                       |
| `estimationOptions` | `CostCalculatorEstimationOptions` | Yes      | Options for the cost estimation (same as `estimationParams` in the `CostCalculator` component) |

The `estimationOptions` object has the following properties:

| Property                 | Type      | Description                                                                                                                |
| ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `title`                  | `string`  | Custom title for the estimation report                                                                                     |
| `includeBenefits`        | `boolean` | If `true`, includes benefits information in the response                                                                   |
| `includeCostBreakdowns`  | `boolean` | If `true`, includes detailed cost breakdowns in the response                                                               |
| `includePremiumBenefits` | `boolean` | If `true`, includes premium benefits in the response, if there are no premium benefits available, we'll show core benefits |

## Authentication

You need to implement a server endpoint to securely handle authentication with Remote. This prevents exposing client credentials in your frontend code.

Your server should:

1. Store your client credentials securely
2. Implement an endpoint that exchanges these credentials for an access token
3. Return `access_token` and `expires_in` to the frontend application

For a complete implementation, check our [example server implementation](https://github.com/remoteoss/remote-flows/blob/main/example/server.js).

### API Gateway Endpoints

- **Development/Testing**: `https://gateway.partners.remote-sandbox.com`
- **Production**: `https://gateway.remote.com/`

## Styling Options

### Using Default Styles

Import the CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Theme Customization

```tsx
<RemoteFlows
  theme={{
    spacing: '0.25rem',
    borderRadius: '0px',
    colors: {
      primaryBackground: '#ffffff',
      primaryForeground: '#364452',
      accentBackground: '#e3e9ef',
      accentForeground: '#0f1419',
      danger: '#d92020',
      borderInput: '#cccccc',
    },
  }}
>
  {/* Your components */}
</RemoteFlows>
```

| **Token**                  | **Description**                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `colors.borderInput`       | Border color for input fields.                                                                        |
| `colors.primaryBackground` | Background used for the popover options                                                               |
| `colors.primaryForeground` | Color text for the input and options                                                                  |
| `colors.accentBackground`  | Used in the option selected and hover.                                                                |
| `colors.accentForeground`  | Color text for the select options                                                                     |
| `colors.danger`            | Red color used for danger states.                                                                     |
| `spacing`                  | Consistent scale for whitespace (margin, padding, gap).                                               |
| `borderRadius`             | The main border radius value (default: 0.625rem). This is the foundation for all other radius values. |
| `font.fontSizeBase`        | The main font size value (default: 1rem). Controls the base text size of the component.               |

### Custom CSS

All components expose CSS classes with the prefix `RemoteFlows__` that you can target for custom styling. This approach gives you fine-grained control over specific elements without having to rebuild the components.

For example, let's say you want to render the currency field next to the salary field. You can achieve this with the following CSS:

```css
.RemoteFlows__CostCalculatorForm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.RemoteFlows__SelectField__Item__country {
  grid-column: span 2;
}

.RemoteFlows__CostCalculatorForm .RemoteFlows__Button {
  grid-column: span 2;
}
```

## Advanced Usage

### Custom Implementation

`remote-flows` provides opinionated components but your application might require more extensive customization than what theme tokens allow. For these cases, we expose several hooks that give you complete control over rendering while handling the complex business logic for you.

Here's how to create a fully custom implementation using our hooks:

```tsx
function CustomCostCalculator() {
  const {
    onSubmit: submitCostCalculator,
    fields, // fields is a list of field objects returned by json-schema-form. Read more at https://github.com/remoteoss/json-schema-form
    validationSchema,
  } = useCostCalculator();

  // Build your custom form using the provided fields and validation schema

  function handleSubmit(data) {
    submitCostCalculator(data); // submitCostCalculator validates form fields before posting to Remote API
  }

  return (
    <Form onSubmit={handleSubmit}>{/* Your custom form implementation */}</Form>
  );
}
```

```tsx
function CustomCostCalculator() {
  const {
    onSubmit: submitCostCalculator,
    fields, // fields is a list of field objects returned by json-schema-form. Read more at https://github.com/remoteoss/json-schema-form
    validationSchema,
  } = useCostCalculator();

  // Build your custom form using the provided fields and validation schema

  return (
    <form onSubmit={handleSubmit((data) => submitCostCalculator(data))}>
      {/* Your custom form implementation */}
    </form>
  );
}
```

## Example

For a complete implementation example, refer to our [example application](https://github.com/remoteoss/remote-flows/blob/main/example/src/App.tsx).

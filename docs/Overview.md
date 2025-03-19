# @remoteoss/remote-flows

## Overview

Welcome to the `@remoteoss/remote-flows` package, a React library that provides components for Remote's embbeded solution.

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

Here's a simple example of how to set up the library:

```tsx
import { useState } from 'react';
import {
  CostCalculatorEstimateResponse,
  RemoteFlows,
  CostCalculator,
  CostCalculatorResults,
  useCostCalculatorEstimationPdf,
  CostCalculatorEstimateParams,
} from '@remoteoss/remote-flows';
import './App.css';

function CostCalculatorForm() {
  const [estimations, setEstimations] =
    useState<CostCalculatorEstimateResponse | null>(null);
  const [payload, setPayload] = useState<CostCalculatorEstimateParams | null>(
    null,
  );

  const estimationParams = {
    title: 'Estimate for a new company',
    includeBenefits: true,
    includeCostBreakdowns: true,
  };

  const exportPdfMutation = useCostCalculatorEstimationPdf();

  const handleExportPdf = () => {
    if (payload) {
      exportPdfMutation.mutate(payload, {
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
        estimationParams={estimationParams}
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
        onSubmit={(payload) => setPayload(payload)}
        onError={(error) => console.error({ error })}
        onSuccess={(response) => {
          setEstimations(response);
        }}
      />
      {estimations && (
        <CostCalculatorResults employmentData={estimations.data} />
      )}
      {estimations && <button onClick={handleExportPdf}>Export as PDF</button>}
    </>
  );
}

function App() {
  const fetchToken = async () => {
    try {
      const res = await fetch('/api/token');
      const data = await res.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  return (
    <RemoteFlows
      auth={fetchToken}
      isTestingProp={process.env.NODE_ENV === 'development'}
    >
      <CostCalculatorForm />
    </RemoteFlows>
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

| Prop               | Type                                                 | Required | Description                                                 |
| ------------------ | ---------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `estimationParams` | object                                               | No       | Customization for the estimation response (see table below) |
| `defaultValues`    | object                                               | No       | Predefined form values (see table below)                    |
| `params`           | `{ disclaimer?: { label?: string } }`                | No       | Additional configuration parameters                         |
| `onSubmit`         | `(payload: CostCalculatorEstimateParams) => void`    | No       | Callback with the payload sent to Remote server             |
| `onSuccess`        | `(response: CostCalculatorEstimateResponse) => void` | No       | Callback with the successful estimation data                |
| `onError`          | `(error: Error) => void`                             | No       | Error handling callback                                     |

#### estimationParams Properties

| Property                | Type      | Description                                                  |
| ----------------------- | --------- | ------------------------------------------------------------ |
| `title`                 | `string`  | Custom title for the estimation report                       |
| `includeBenefits`       | `boolean` | When true, includes benefits information in the response     |
| `includeCostBreakdowns` | `boolean` | When true, includes detailed cost breakdowns in the response |

#### defaultValues Properties

| Property            | Type     | Description                 |
| ------------------- | -------- | --------------------------- |
| `countryRegionSlug` | `string` | Pre-selected country/region |
| `currencySlug`      | `string` | Pre-selected currency       |
| `salary`            | `string` | Pre-filled salary amount    |

### CostCalculatorResults

A component to display cost calculation results.

| Prop             | Type                                 | Required | Description                    |
| ---------------- | ------------------------------------ | -------- | ------------------------------ |
| `employmentData` | `CostCalculatorEstimateResponseData` | Yes      | The estimation data to display |

## Authentication

You need to implement a server endpoint to securely handle authentication with Remote. This prevents exposing client credentials in your frontend code.

To do this you can follow the code in the [server.js][https://github.com/remoteoss/remote-flows/blob/main/example/server.js#L8]

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
    primaryBackground: '#ffffff',
    primaryForeground: '#364452',
    accentBackground: '#e3e9ef',
    accentForeground: '#0f1419',
    danger: '#d92020',
    focus: 'blue',
    borderInput: '#cccccc',
  }}
>
  {/* Your components */}
</RemoteFlows>
```

| **Token**           | **Description**                                    |
| ------------------- | -------------------------------------------------- |
| `borderInput`       | Border color for input fields.                     |
| `primaryBackground` | Background used for the popover options background |
| `primaryForeground` | Color text for the input and options               |
| `accentBackground`  | Accent background.                                 |
| `accentForeground`  | Accent foreground.                                 |
| `danger`            | Red color used for danger states.                  |

### CSS Overrides

#### Using CSS variables:

You can override the CSS variables defined in `:root` in the library's `styles/global.css`

#### Override CSS Classes
Use css or your css in js solution to override any classes from the SDK

## Advanced Usage

### Custom Implementation

For more control, use the provided hooks:

```tsx
function CustomCostCalculator() {
  const {
    onSubmit: submitCostCalculator,
    fields,
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

### PDF Export

Use the `useCostCalculatorEstimationPdf` hook to generate PDF exports:

```tsx
const exportPdfMutation = useCostCalculatorEstimationPdf();

const handleExportPdf = () => {
  if (payload) {
    exportPdfMutation.mutate(payload, {
      onSuccess: (response) => {
        if (response?.data?.data?.content) {
          const link = document.createElement('a');
          link.href = response.data.data.content;
          link.download = 'estimation.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
    });
  }
};
```

### Create your own disclaimer

Use the `useCostCalculatorDisclaimer`hook to get the data to render the disclaimer.

Check our [Diclaimer component](https://github.com/remoteoss/remote-flows/blob/main/src/flows/CostCalculator/Disclaimer/Disclaimer.tsx) for guidance

## Example

For a complete implementation example, refer to our [example application](https://github.com/remoteoss/remote-flows/blob/main/example/src/App.tsx).

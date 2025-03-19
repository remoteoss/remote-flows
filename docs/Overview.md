## Overview

Welcome to the @remoteoss/remote-flows package.

### Installation

```
 npm install @remoteoss/remote-flows
```

### How to use

Once you have installed, the repo you can start using in your React project.

We offer different components to to you available in our package

The next code is from our [example/App.tsx](https://github.com/remoteoss/remote-flows/blob/main/example/src/App.tsx) on how you can use the CostCalculator

```ts
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
    <RemoteFlows isTestingProp auth={() => fetchToken()}>
      <CostCalculatorForm />
    </RemoteFlows>
  );
}
```

Your App.css file should look like this

```css
@import '@remoteoss/remote-flows/index.css';
```

Let's breakdown the next code to get you up to speed with the package.

`<RemoteFlows>` component is a provider in charge of the auth and the theme in your app.

The auth prop is necessary to make the authentication against Remote gateway, check the examples/server.js, there you will learn how to set up this endpoint in your server.

When you're developing locally, I suggest to add isTestingProp, to connect to the partners gateway instead of the production one

Partners gateway is https://gateway.partners.remote-sandbox.com

Production gateway is https://gateway.remote.com/

### Why do you need to create an endpoint in your server?

To avoid leaking secrets in your FE code such as CLIENT_CODE or CLIENT_SECRET, you'll need to setup this endpoint, once you have done this and the server returns a token you'll be able to fetch the different countries, currencies and dynamic fields from the Remote server.

`<CostCalculator>` component renders the CostCalculator form and the Remote disclaimer, this component has different props that you can use.

All props are optional in this component but let's give you a quick overview of them

| **Property**         | **Description**                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `onSubmit`           | Gives you the payload sent to the Remote server.                                                     |
| `onSuccess`          | Gives you the estimation response.                                                                   |
| `onError`            | Gives you any errors that could have happened.                                                       |
| `defaultValues`      | Use it to set predefined values into the form.                                                       |
| `params?.disclaimer` | Lets you customize the disclaimer label.                                                             |
| `estimationParams`   | Lets you customize the estimation response; you can skip benefits and cost breakdowns if not needed. |

`useCostCalculatorEstimationPdf` hook gives you a mutation that you can use to download a pdf with the estimation, usually we offer this with a button

`CostCalculatorResults` it gives you an opinionated component to preview the estimation, you can get a general idea how the response should be parametrized in case you want to do a custom component or use this one and change the styles

## How to style

There are several ways that you could style the sdk.

The SDK has been built using shadcn which uses tailwind, to import succesfully all library styles import the css somewhere in your app

```css
@import '@remoteoss/remote-flows/index.css';
```

If you want to override the theme, you can use `<RemoteFlows>` directly

```ts
<RemoteFlows theme={{
  focus: 'red',
  borderInput: 'red',
  primaryBackground: '#ffffff',
  primaryForeground: '#364452',
  accentBackground: '#e3e9ef',
  accentForeground: '#0f1419',
  danger: '#d92020',
}}>
```

These are the current available tokens

| **Token**           | **Description**                   |
| ------------------- | --------------------------------- |
| `focus`             | Focus color.                      |
| `borderInput`       | Border color for input fields.    |
| `primaryBackground` | Primary background.               |
| `primaryForeground` | Primary foreground.               |
| `accentBackground`  | Accent background.                |
| `accentForeground`  | Accent foreground.                |
| `danger`            | Red color used for danger states. |

if you want also to to some changes to any sdk css rule, you also can do it with js

```ts
<RemoteFlows rules={{
  '.Select__Item': {
    padding: 20px 4px;
  }
}}>
```

If you don't like these solutions, you can still use normal css in your app and it should work, you can check the example App where I give styles to the disclaimer drawer css.

If you want to theme your app with css, just override the :root css variables stored in styles/global.css

### Do you want more flexibility?

If you feel that you need more flexibility in your CostCalculator form, you can use the `useCostCalculator` and `useCostCalculatorDisclaimer`

These two hooks gives no UI, just data and you can build the UI that you want without problems.

To create your own Cost Calculator

```ts
function App() {
  const {
    onSubmit: submitCostCalculator,
    fields,
    validationSchema,
  } = useCostCalculator();
}
```

The hook will give you a submit function to call the Remote endpoint, to build the payload investigate how we do it on the onSubmit function,
the fields that you need to render and a validationSchema built with yup.

To create your disclaimer, check our [Diclaimer component](https://github.com/remoteoss/remote-flows/blob/main/src/flows/CostCalculator/Disclaimer/Disclaimer.tsx), you'll get an idea on how to build one yourself

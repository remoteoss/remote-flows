# @remoteoss/remote-flows

[![npm version](https://img.shields.io/npm/v/@remoteoss/remote-flows.svg)](https://www.npmjs.com/package/@remoteoss/remote-flows) [![Bundle Size](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/remotecom/b8884fb20051d4c0095a29569d51e34e/raw/remote-flows-bundle-size.json)](https://github.com/remoteoss/remote-flows/actions/workflows/update-badge.yml)

> **Note:** This badge reflects the latest published version. Check [npm](https://www.npmjs.com/package/@remoteoss/remote-flows) for current version information.

A React library that provides components for Remote's embedded solution, enabling seamless integration of Remote's employment flows into your application.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components API](#components-api)
  - [RemoteFlows](#remoteflows)
  - [Custom Field Components](#custom-field-components)
- [Available Flows](#available-flows)
- [Authentication](#authentication)
- [Styling Options](#styling-options)
  - [Using Default Styles](#using-default-styles)
  - [Theme Customization](#theme-customization)
  - [Custom CSS](#custom-css)
- [Advanced Usage](#advanced-usage)
- [Example](#example)
- [Contributing](#contributing)
- [Internals](#internals)

## Installation

```sh
npm install @remoteoss/remote-flows
```

## Quick Start

```tsx
import { RemoteFlows, CostCalculator } from '@remoteoss/remote-flows';
import '@remoteoss/remote-flows/styles.css';

function App() {
  const fetchToken = async () => {
    const response = await fetch('/api/auth/token');
    return response.json();
  };

  return (
    <RemoteFlows auth={fetchToken} environment='partners'>
      <CostCalculator onSuccess={(data) => console.log(data)} />
    </RemoteFlows>
  );
}
```

## Components API

### RemoteFlows

The `RemoteFlows` component serves as a provider for authentication and theming.

| Prop            | Type                                                                                          | Required | Deprecated | Description                                                                 |
| --------------- | --------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------- |
| `auth`          | `() => Promise<{ accessToken: string, expiresIn: number }>`                                   | Yes      | -          | Function to fetch authentication token                                      |
| `environment`   | `'partners' \| 'production' \| 'sandbox' \| 'staging'`                                        | No       | -          | Environment to use for API calls (defaults to production)                   |
| `theme`         | `ThemeOptions`                                                                                | No       | -          | Custom theme configuration                                                  |
| `components`    | `Components`                                                                                  | No       | -          | Custom field components for form rendering                                  |
| `proxy`         | `{ url: string, headers?: Record<string, string> }`                                           | No       | -          | Configuration for API request proxy with optional headers                   |
| `errorBoundary` | `{ useParentErrorBoundary?: boolean, fallback?: ReactNode \| ((error: Error) => ReactNode) }` | No       |  -         | Error boundary configuration to prevent crashes and show custom fallback UI |

#### Error Boundary

The `errorBoundary` prop controls how the SDK handles runtime errors to prevent crashes in your host application.

```tsx
<RemoteFlows
  auth={fetchToken}
  errorBoundary={{
    useParentErrorBoundary: false,
    fallback: (error) => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something Went Wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    ),
  }}
>
  {/* Your flows */}
</RemoteFlows>
```

**Options:**

- `useParentErrorBoundary` (boolean, default: `false`): If `true`, errors are re-thrown to your parent error boundary. If `false`, the SDK shows a fallback UI to prevent crashes.
- `fallback` (ReactNode | function, optional): Custom UI to display when an error occurs. Only used when `useParentErrorBoundary` is `false`. Can be a React element or a function that receives the error object.

**Behavior:**

- When `useParentErrorBoundary: true` → Errors propagate to your application's error boundary
- When `useParentErrorBoundary: false` without `fallback` → Shows default error message: "Something went wrong in RemoteFlows. Please refresh the page."
- When `useParentErrorBoundary: false` with `fallback` → Shows your custom fallback UI

### Custom Field Components

You can customize form field components to match your application's design system.

> For detailed documentation on component customization including step-level and field-specific overrides, see the [Component Customization Guide](./docs/COMPONENT_CUSTOMIZATION.md).

## Available Flows

Each flow handles a specific Remote employment operation. For detailed API documentation, see the individual flow READMEs:

- [**Cost Calculator**](./src/flows/CostCalculator/README.md) - Calculate employment costs for different countries
- [**Onboarding**](./src/flows/Onboarding/README.md) - Onboard new employees
- [**Contract Amendment**](./src/flows/ContractAmendment/README.md) - Modify existing employment contracts
- [**Termination**](./src/flows/Termination/README.md) - Handle employee terminations

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
@import '@remoteoss/remote-flows/styles.css';
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

All components expose CSS classes prefixed with `RemoteFlows__` for targeted styling:

**Example:** Customize the Cost Calculator layout:

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

For complete control over rendering, use our hooks directly. They handle the business logic while you control the UI:

```tsx
import { useCostCalculator } from '@remoteoss/remote-flows';

function CustomCostCalculator() {
  const {
    onSubmit: submitCostCalculator,
    fields, // Field definitions from json-schema-form
    validationSchema,
  } = useCostCalculator();

  return (
    <form onSubmit={handleSubmit((data) => submitCostCalculator(data))}>
      {/* Your custom form implementation */}
    </form>
  );
}
```

Learn more about field definitions in the [json-schema-form documentation](https://github.com/remoteoss/json-schema-form).

## Example

For a complete implementation example, see our [example application](https://github.com/remoteoss/remote-flows/blob/main/example/src/App.tsx).

## Contributing

We welcome contributions! If you're working on this package:

- See [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup, testing, and bundle size management
- Check out our [example app](./example) to test changes locally
- Ensure bundle size stays within limits before submitting PRs

## Internals

We have created an entry point in the package `@remoteoss/remote-flows/internals`

This entry endpoint exports internals utils and shadcn components to avoid duplicating these on the `example` folder.

We don't guarantee `semver` compatiblity if you used them in your project.

```

```

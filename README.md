# @remoteoss/remote-flows

## Overview

Welcome to the `@remoteoss/remote-flows` package, a React library that provides components for Remote's embbeded solution.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components API](#components-api)
  - [RemoteFlows](#remoteflows)
- [Docs](#docs)
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

## Development

To run the SDK locally for development:

1. Clone the repository and install dependencies:

```sh
git clone https://github.com/remoteoss/remote-flows.git
cd remote-flows
npm install
```

2. Create a `.env` file in the example directory with your Remote credentials:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
REMOTE_GATEWAY=https://gateway.partners.remote-sandbox.com # for sandbox
# REMOTE_GATEWAY=https://gateway.remote.com # for production
```

3. Start the development server:

```sh
cd example
npm run dev
```

The example app will be available at `http://localhost:3001`. The server handles authentication and proxies API requests to Remote's gateway.

## Components API

### RemoteFlows

The `RemoteFlows` component serves as a provider for authentication and theming.

| Prop            | Type                                                        | Required | Description                                                        |
| --------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `auth`          | `() => Promise<{ accessToken: string, expiresIn: number }>` | Yes      | Function to fetch authentication token                             |
| `isTestingMode` | `boolean`                                                   | No       | When `true`, connects to sandbox environment instead of production |
| `theme`         | `ThemeOptions`                                              | No       | Custom theme configuration                                         |
| `components`    | `Components`                                                | No       | Custom field components for form rendering                         |
| `proxy`         | `{ url: string, headers?: Record<string, string> }`         | No       | Configuration for API request proxy with optional headers          |

### Custom Field Components

The `components` prop allows you to override the default form field components with your own implementations. Each component receives three props:

- `field`: React Hook Form's field props for registration and state management
- `fieldState`: Field state including errors and touched status
- `fieldData`: Metadata from JSON schema with field configuration

> **Important**: All custom components are wrapped with React Hook Form's `Controller` component. You must bind the `field` props to your HTML elements to ensure proper form state management and validation.

For TypeScript users, we export component prop types to make it easier to create properly typed custom components:

```tsx
import {
  FieldComponentProps,
  ButtonComponentProps,
} from '@remoteoss/remote-flows';

const CustomInput = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  return (
    <div>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input {...field} />
      {fieldState.error && <p>{fieldState.error.message}</p>}
    </div>
  );
};

const CustomButton = ({ children, ...props }: ButtonComponentProps) => {
  return <button {...props}>{children}</button>;
};
```

Here's an example of custom field components implementation:

```tsx
<RemoteFlows
  components={{
    text: CustomInput,
    button: CustomButton,
    number: ({ field, fieldState, fieldData }) => (
      <div>
        <label>{fieldData.label}</label>
        <input {...field} type="number" />
        {fieldState.error && (
          <span className="text-red-500">{fieldState.error.message}</span>
        )}
      </div>
    ),
    select: ({ field, fieldState, fieldData }) => (
      <>
        <select {...field} onChange={(ev) => field.onChange(ev.target.value)}>
          {fieldData?.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldState.error && (
          <span className="text-red-500">{fieldState.error.message}</span>
        )}
      </>
    ),
  }}
  auth={fetchToken}
>
  {/* Your form components */}
</RemoteFlows>
```

### Available Component Prop Types

- `FieldComponentProps`: For all form field components (text, number, select, etc.)
- `ButtonComponentProps`: For custom button components
- `StatementComponentProps`: For custom statement components

Supported field types:

- `text`: Text input fields
- `number`: Numeric input fields
- `select`: Dropdown selection fields

## Docs

Visit the different different docs for each flow

- [Cost Calculator Flow](./src/flows/CostCalculator/README.md)
- [Termination Flow](./src/flows/Termination/README.md)
- [Contract Amendments](./src/flows/ContractAmendment/README.md)

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

# Component Customization Guide

This guide explains the different ways to customize and override components in Remote Flows to match your application's design system.

## Table of Contents

- [Overview](#overview)
- [Method 1: Global Component Override](#method-1-global-component-override)
- [Method 2: Step-Level Component Override](#method-2-step-level-component-override)
- [Method 3: Field-Specific Override with jsfModify](#method-3-field-specific-override-with-jsfmodify)
- [Component Props and Types](#component-props-and-types)
- [When to Use Each Method](#when-to-use-each-method)

## Overview

Remote Flows provides three levels of component customization, each suited for different use cases:

| Method                  | Scope                       | Use Case                                                        |
| ----------------------- | --------------------------- | --------------------------------------------------------------- |
| Global Override         | All forms across all flows  | Consistent design system across entire app                      |
| Step-Level Override     | Specific step within a flow | Custom UI for particular step (e.g., onboarding benefits cards) |
| Field-Specific Override | Individual field            | One-off customization for specific fields                       |

## Method 1: Global Component Override

Override field components globally across **all flows** in your application using the `components` prop on `RemoteFlows`.

### Example

```tsx
import {
  RemoteFlows,
  FieldComponentProps,
  ButtonComponentProps,
} from '@remoteoss/remote-flows';

const CustomInput = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  return (
    <div className='custom-field'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input {...field} className='custom-input' />
      {fieldState.error && (
        <span className='error'>{fieldState.error.message}</span>
      )}
    </div>
  );
};

const CustomButton = ({ children, ...props }: ButtonComponentProps) => {
  return (
    <button className='custom-button' {...props}>
      {children}
    </button>
  );
};

function App() {
  return (
    <RemoteFlows
      auth={fetchToken}
      components={{
        text: CustomInput,
        number: CustomInput,
        button: CustomButton,
        select: ({ field, fieldState, fieldData }) => (
          <div>
            <label>{fieldData.label}</label>
            <select {...field} className='custom-select'>
              {fieldData?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </div>
        ),
      }}
    >
      {/* All flows will use these custom components */}
      <OnboardingFlow {...props} />
    </RemoteFlows>
  );
}
```

### Supported Field Types

For a complete list of all component types you can override, see the [default components registry](../src/default-components.ts). This file shows all the default implementations used internally by Remote Flows and serves as a reference for building custom components.

Available component types include:

- `text` - Text input fields
- `number` - Numeric input fields
- `email` - Email input fields
- `textarea` - Multi-line text areas
- `select` - Dropdown selection fields
- `multi-select` - Multi-select dropdowns
- `radio` - Radio button groups
- `checkbox` - Checkbox fields
- `date` - Date picker fields
- `countries` - Country selection fields
- `file` - File upload fields
- `work-schedule` - Work schedule fields
- `fieldsetToggle` - Fieldset toggle buttons
- `statement` - Statement/information display
- `table` - Table components
- `drawer` - Drawer components
- `zendeskDrawer` - Zendesk drawer components

> **Tip:** Check [src/default-components.ts](../src/default-components.ts) to see the default implementations. You can use these as a starting point or reference when building your own custom components.

### Important Notes

- All custom components are wrapped with React Hook Form's `Controller`
- You **must** bind the `field` props to your HTML elements for proper form state management
- Use the exported TypeScript types for proper typing

## Method 2: Step-Level Component Override

Override components for a **specific step** within a flow using the step component's `components` prop. This is useful when you need custom rendering for a particular step while keeping other steps standard.

### Example: Custom Benefits Cards

```tsx
import { BenefitsStep, JSFCustomComponentProps } from '@remoteoss/remote-flows';

function MultiStepForm({ onboardingBag, components }) {
  const { BenefitsStep, SubmitButton, BackButton } = components;

  switch (onboardingBag.stepState.currentStep.name) {
    case 'benefits':
      return (
        <div className='benefits-container'>
          <BenefitsStep
            components={{
              radio: ({ field, fieldData }: FieldComponentProps) => {
                const selectedValue = field.value;

                type OptionWithMeta = {
                  value: string;
                  label: string;
                  description?: string;
                  meta?: { display_cost?: string };
                };

                return (
                  <div className='benefit-cards-container'>
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
                              type='radio'
                              name={field.name}
                              value={option.value}
                              checked={isSelected}
                              onChange={field.onChange}
                              style={{ display: 'none' }}
                            />
                            <div className='benefit-card__label'>
                              {option.label}
                            </div>
                            <div className='benefit-card__summary'>
                              {option.description || 'Plan summary'}
                            </div>
                            <div className='benefit-card__cost'>
                              {meta.display_cost || ''}
                            </div>
                            <button
                              type='button'
                              className={`benefit-card__button${isSelected ? ' benefit-card__button--selected' : ''}`}
                              tabIndex={-1}
                            >
                              {isSelected
                                ? 'Plan Selected!'
                                : 'Select This Plan'}
                            </button>
                          </label>
                        );
                      },
                    )}
                  </div>
                );
              },
            }}
            onSubmit={(payload) => console.log('payload', payload)}
            onSuccess={(data) => console.log('data', data)}
            onError={({ error, fieldErrors }) => {
              console.error(error, fieldErrors);
            }}
          />
          <div className='buttons-container'>
            <BackButton>Previous Step</BackButton>
            <SubmitButton>Continue</SubmitButton>
          </div>
        </div>
      );
  }
}
```

### When to Use

- Custom card layouts for radio/checkbox groups
- Special UI requirements for a specific step
- Step-specific interactions that differ from your global design

## Method 3: Field-Specific Override with jsfModify

Override a **single field** within a form using the `jsfModify` option. This allows surgical customization without affecting other fields.

### Example: Custom Switcher Component

```tsx
import {
  ContractorOnboardingFlow,
  JSFCustomComponentProps,
} from '@remoteoss/remote-flows';
import { Tabs, TabsTrigger, TabsList } from '@remoteoss/remote-flows/internals';

const Switcher = (props: JSFCustomComponentProps) => {
  return (
    <Tabs
      defaultValue={props.options?.[0].value}
      onValueChange={(value) => {
        props.setValue(value);
      }}
    >
      <TabsList>
        {props.options?.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

function ContractorOnboarding() {
  return (
    <ContractorOnboardingFlow
      render={OnBoardingRender}
      options={{
        jsfModify: {
          contract_details: {
            fields: {
              'payment_terms.payment_terms_type': {
                'x-jsf-presentation': {
                  Component: (props: JSFCustomComponentProps) => (
                    <Switcher {...props} />
                  ),
                },
              },
            },
          },
        },
      }}
    />
  );
}
```

### How It Works

1. The `jsfModify` option takes a nested object structure matching your form schema
2. Navigate to the field using dot notation (e.g., `'payment_terms.payment_terms_type'`)
3. Add `x-jsf-presentation.Component` to provide your custom component
4. The component receives `JSFCustomComponentProps` with field state and helpers

### When to Use

- Overriding a single field without affecting others
- Using a specialized widget for one specific field

## Component Props and Types

Remote Flows exports TypeScript types to help you create properly typed custom components:

### FieldComponentProps

For form field components (text, number, select, etc.):

```tsx
import { FieldComponentProps } from '@remoteoss/remote-flows';

type FieldComponentProps = {
  field: {
    name: string;
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    ref: React.Ref<any>;
  };
  fieldState: {
    error?: { message?: string };
    isDirty: boolean;
    isTouched: boolean;
  };
  fieldData: {
    label?: string;
    description?: string;
    placeholder?: string;
    options?: Array<{
      value: string;
      label: string;
      description?: string;
      meta?: Record<string, any>;
    }>;
  };
};
```

### ButtonComponentProps

For custom button components:

```tsx
import { ButtonComponentProps } from '@remoteoss/remote-flows';

type ButtonComponentProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
};
```

### JSFCustomComponentProps

For components used with `jsfModify`

```tsx
import { JSFCustomComponentProps } from '@remoteoss/remote-flows';

type JSFCustomComponentProps = {
  field: {
    name: string;
    value: any;
    onChange: (event: any) => void;
  };
  setValue: (value: any) => void;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    meta?: Record<string, any>;
  }>;
  // ... additional JSON Schema Form props
};
```

## When to Use Each Method

### Use Global Override When:

- You want consistent styling across your entire application
- All forms should use the same custom components
- You need to override multiple field types uniformly

**Example:** Replacing all text inputs with your design system

### Use Step-Level Override When:

- You need special UI for a specific step (like card layouts)
- Only one step requires custom rendering

**Example:** Showing benefits as interactive cards instead of radio buttons.

### Use Field-Specific Override When:

- Only one field needs customization
- You're using a specialized widget (e.g., tabs, custom picker)
- The field has unique requirements

**Example:** Using a tab switcher for payment terms while keeping other fields standard.

---

## Best Practices

1. **Start Specific, Go Global**: Begin with field-specific overrides, then promote to step-level or global if the pattern is useful elsewhere.

2. **Bind Field Props**: Always spread `{...field}` or bind individual field props to maintain React Hook Form integration.

3. **Handle Errors**: Display `fieldState.error` messages to provide validation feedback.

4. **Use TypeScript**: Leverage the exported types for type safety and better IDE support.

## Additional Resources

- [React Hook Form Controller](https://react-hook-form.com/api/usecontroller/controller/)
- [JSON Schema Form Documentation](https://github.com/remoteoss/json-schema-form)
- [Example Application](../example/src/)

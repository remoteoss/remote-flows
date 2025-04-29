# Termination Docs

Welcome to the Termination flow docs

# Table of Contents

## Getting Started

After installation, import the main CSS file in your application:

```css
@import '@remoteoss/remote-flows/index.css';
```

### Full Example

## Components API

### TerminationFlow

The `TerminationFlow` component lets you render different components like `Form`, `SubmitButton`, `Back`, `TimeOff`

The component accepts the next props

| Prop           | Type                                                                                                   | Required | Description                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `employmentId` | string                                                                                                 | Yes      | The employment id from the employee that you want to offboard                                                            |
|                |
| `render`       | `({termination:  ReturnType<typeof useTermination>, components: {Form, SubmitButton, Back, TimeOff}})` | Yes      | render prop function with the params passed by the useTermination hook and the components available to use for this flow |
| `options`      | `{jsfModify: JSFModify}`                                                                               | No       | JSFModify options lets you modify properties from the form, such as changing the labels                                  |

### Form

It renders the form and the fields of the termination flow

| Prop        | Type                                             | Required | Description                                                                                                        |
| ----------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `username`  | `string`                                         | Yes      | Replaces the {{username}} placeholder for the acknowledge field in the last step, should be the requester username |
| `onSubmit`  | `(payload: TerminationFormValues) => void`       | No       | Callback with the form payload sent to Remote API. Runs before submitting the form to Remote                       |
| `onSuccess` | `(response: PostCreateOffboardingError) => void` | No       | Callback with the successful termination data                                                                      |
| `onError`   | `(error: Error) => void`                         | No       | Error handling callback                                                                                            |

### SubmitButton

It renders the submit button for the form and supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### BackButton

It renders the back button for the form supports all standard `<button>` element props. This component must be used within the render prop of the TerminationFlow component to ensure proper functionality

### Timeoff

Component that retrieves the employment and the timeoff of the employee. It uses a render prop that lets you to render the UI elements

```tsx
<TimeOff
  render={({ timeoff, employment }) => {
    const username = employment.data?.data.employment?.basic_information
      ?.name as string;
    const days = timeoff?.data?.data?.total_count || 0;

    // if days is 0 or > 1 'days' else 'day
    const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
    return (
      <>
        <p>
          We have recorded {days} {daysLiteral} of paid time off for {username}
        </p>
        <a href="#">See {username}'s timeoff breakdown</a>
      </>
    );
  }}
/>
```

#### Timeoff render prop Properties

| Property     | Type                                                        | Description                                                     |
| ------------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `timeoff`    | `UseQueryResult<ListTimeoffResponse \| undefined, Error>`   | returns a useQuery result with the properties of the timeoff    |
| `employment` | `UseQueryResult<EmploymentShowResponse\| undefined, Error>` | returns a useQuery result with the properties of the employment |

#### options.jsfModify properties

The options.jsfModify props accepts the same props that the [modify](https://json-schema-form.vercel.app/?path=/docs/api-reference-modify--docs#config-methods) function from the json-schema-form library

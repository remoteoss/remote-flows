import type {
  ButtonComponentProps,
  Components,
  FieldComponentProps,
} from '@remoteoss/remote-flows';

// you can define HTML button attributes or event props that exist in your Button like variant, size, etc.
const Button = ({
  children,
  /* variant */
  ...props
}: ButtonComponentProps) => {
  //console.log('Button component rendered with props:', props.variant); // THIS WILL WORK
  return <button {...props}>{children}</button>;
};

const Input = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;
  const hasCurrency = fieldData.currency;

  return (
    <div className="input-container">
      <label htmlFor={field.name}>{fieldData.label}</label>

      {hasCurrency ? (
        <div className="input-with-currency">
          <input
            id={field.name}
            className={`input input-with-currency-field ${hasError ? 'error' : ''}`}
            {...field}
          />
          <span className="currency-symbol">{fieldData.currency}</span>
        </div>
      ) : (
        <input
          id={field.name}
          className={`input ${hasError ? 'error' : ''}`}
          {...field}
        />
      )}

      {fieldData.description && (
        <p className="input-description">{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className="error-message">{fieldState.error.message}</p>
      )}
    </div>
  );
};

const Select = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;
  const { onChange, ...fieldProps } = field;

  return (
    <div className="input-container">
      <label htmlFor={field.name}>{fieldData.label}</label>
      <select
        id={field.name}
        className={`input ${hasError ? 'error' : ''}`}
        onChange={(e) => onChange(e.target.value)}
        {...fieldProps}
      >
        <option value="">Select an option</option>
        {fieldData.options?.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {fieldState.error && (
        <p className="error-message">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export const components: Components = {
  button: Button,
  text: Input,
  select: Select,
};

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
  const { 'data-type': dataType, className, ...buttonProps } = props;
  const isInline = dataType === 'inline';

  return (
    <button
      className={isInline ? `button-inline ${className}` : className}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

const Input = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;
  const hasCurrency = fieldData.metadata?.currency;

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
          <span className="currency-symbol">
            {fieldData.metadata?.currency as string}
          </span>
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
  const { onChange, value, ...fieldProps } = field;

  return (
    <div className="input-container">
      <label htmlFor={field.name}>{fieldData.label}</label>

      <div className={`select-wrapper ${hasError ? 'error' : ''}`}>
        <select
          id={field.name}
          className="select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          {...fieldProps}
        >
          <option value="" disabled>
            Select an option
          </option>
          {fieldData.options?.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
        <div className="select-arrow" aria-hidden="true">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

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

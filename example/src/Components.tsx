import type {
  ButtonComponentProps,
  Components,
  FieldComponentProps,
  FieldSetToggleComponentProps,
} from '@remoteoss/remote-flows';
import { FileUploader } from '@remoteoss/remote-flows/internals';
//import { ZendeskDialog } from './ZendeskDialog';

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
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>

      {hasCurrency ? (
        <div className='input-with-currency'>
          <input
            id={field.name}
            className={`input input-with-currency-field ${hasError ? 'error' : ''}`}
            maxLength={fieldData.maxLength}
            {...field}
          />
          <span className='currency-symbol'>
            {fieldData.metadata?.currency as string}
          </span>
        </div>
      ) : (
        <input
          id={field.name}
          className={`input ${hasError ? 'error' : ''}`}
          maxLength={fieldData.maxLength}
          {...field}
        />
      )}

      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  );
};

const Select = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;
  const { onChange, value, ...fieldProps } = field;

  return (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>

      <div className={`select-wrapper ${hasError ? 'error' : ''}`}>
        <select
          id={field.name}
          className='select'
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          {...fieldProps}
        >
          <option value='' disabled>
            Select an option
          </option>
          {fieldData.options?.map((option) => {
            return (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            );
          })}
        </select>
        <div className='select-arrow' aria-hidden='true'>
          <svg width='12' height='8' viewBox='0 0 12 8' fill='none'>
            <path
              d='M1 1.5L6 6.5L11 1.5'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>

      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}

      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  );
};

const Textarea = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;

  return (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <textarea
        id={field.name}
        className={`textarea ${hasError ? 'error' : ''}`}
        maxLength={fieldData.maxLength}
        {...field}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  );
};

const Radio = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;

  return (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <div className='radio-container'>
        {fieldData.options?.map((option) => {
          return (
            <div key={option.value} className='radio-option'>
              <input
                type='radio'
                id={option.value}
                value={option.value}
                onChange={field.onChange}
                checked={field.value === option.value}
              />
              <label htmlFor={option.value}>{option.label}</label>
            </div>
          );
        })}
      </div>
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {hasError && <p className='error-message'>{fieldState.error?.message}</p>}
    </div>
  );
};

const Checkbox = ({ field, fieldData, fieldState }: FieldComponentProps) => {
  const hasError = !!fieldState.error;

  return (
    <div>
      <div className='checkbox-container'>
        <input type='checkbox' id={field.name} {...field} />
        <label htmlFor={field.name}>{fieldData.label}</label>
      </div>
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {hasError && <p className='error-message'>{fieldState.error?.message}</p>}
    </div>
  );
};

export const Countries = ({
  field,
  fieldData,
  fieldState,
}: FieldComponentProps) => {
  const hasError = !!fieldState.error;

  const { onChange, value, ...fieldProps } = field;

  return (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>

      <div className={`select-wrapper ${hasError ? 'error' : ''}`}>
        <select
          id={field.name}
          className='select'
          value={value || ''}
          onChange={(e) => onChange([e.target.value])}
          {...fieldProps}
        >
          <option value='' disabled>
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
        <div className='select-arrow' aria-hidden='true'>
          <svg width='12' height='8' viewBox='0 0 12 8' fill='none'>
            <path
              d='M1 1.5L6 6.5L11 1.5'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>

      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}

      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  );
};

const FieldsetToggle = ({
  isExpanded,
  onToggle,
  className,
  'aria-controls': controls,
  'aria-label': label,
  children,
}: FieldSetToggleComponentProps) => {
  return (
    <button
      type='button'
      className={className}
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={controls}
      aria-label={label}
    >
      {children}
    </button>
  );
};

const FileUploadField = ({
  field,
  fieldData,
  fieldState,
}: FieldComponentProps) => {
  return (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <FileUploader
        onChange={field.onChange}
        files={field.value}
        accept={fieldData.accept}
        multiple={fieldData.multiple}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  );
};

export const components: Components = {
  button: Button,
  text: Input,
  select: Select,
  textarea: Textarea,
  radio: Radio,
  checkbox: Checkbox,
  countries: Countries,
  fieldsetToggle: FieldsetToggle,
  file: FileUploadField,
  //zendeskDrawer: ZendeskDialog,
};

import { FieldComponentProps } from '@/src/types/fields';

export const defaultComponents = {
  text: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input type='text' id={field.name} {...field} />
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  email: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input type='email' id={field.name} {...field} />
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  number: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input type='number' id={field.name} {...field} />
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  textarea: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <textarea id={field.name} {...field} />
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  date: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input
        type='date'
        id={field.name}
        data-testid={field.name}
        value={field.value}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  select: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
      >
        <option value=''>Select an option</option>
        {fieldData.options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldData.description && (
        <p className='input-description'>{fieldData.description}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  countries: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
      >
        <option value=''>Select a country</option>
        {fieldData.options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  radio: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <fieldset role='radiogroup' aria-label={fieldData.label as string}>
      <legend>{fieldData.label}</legend>
      {fieldData.options?.map((option: { value: string; label: string }) => (
        <label key={option.value}>
          <input
            type='radio'
            name={field.name}
            value={option.value}
            checked={field.value === option.value}
            onChange={() => field?.onChange?.(option.value)}
          />
          {option.label}
        </label>
      ))}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </fieldset>
  ),
  checkbox: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label>
        <input
          type='checkbox'
          aria-label={fieldData.label as string}
          checked={!!field.value}
          onChange={(e) => field?.onChange?.(e.target.checked)}
        />
        {fieldData.label}
      </label>
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
};

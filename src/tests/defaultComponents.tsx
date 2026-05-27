import { FieldComponentProps } from '@/src/types/fields';
import { defaultComponents as defaultComponentsFromPackage } from '@/src/default-components';

export const defaultComponents = {
  ...defaultComponentsFromPackage,
  date: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    const maxDate = fieldData.maxDate
      ? new Date(fieldData.maxDate).toISOString().split('T')[0]
      : undefined;
    const minDate = fieldData.minDate
      ? new Date(fieldData.minDate).toISOString().split('T')[0]
      : undefined;
    return (
      <div className='input-container'>
        <label htmlFor={field.name}>{fieldData.label}</label>
        <input
          type='date'
          id={field.name}
          data-testid={field.name}
          aria-invalid={!!fieldState.error}
          value={field.value}
          onChange={(e) => {
            field?.onChange?.(e.target.value);
          }}
          {...(maxDate && { max: maxDate })}
          {...(minDate && { min: minDate })}
        />
        {fieldData.description && (
          <p className='input-description'>{fieldData.description}</p>
        )}
        {fieldState.error && (
          <p className='error-message'>{fieldState.error.message}</p>
        )}
      </div>
    );
  },
  select: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    return (
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
          {fieldData.options?.map(
            (option: { value: string; label: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </select>
        {fieldData.description && (
          <p className='input-description'>{fieldData.description}</p>
        )}
        {fieldState.error && (
          <p className='error-message'>{fieldState.error.message}</p>
        )}
      </div>
    );
  },
};

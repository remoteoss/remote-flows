import { FieldComponentProps } from '@/src/types/fields';
import { defaultComponents as defaultComponentsFromPackage } from '@/src/default-components';

export const defaultComponents = {
  ...defaultComponentsFromPackage,
  date: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    return (
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
    );
  },
  select: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    console.log('field', field.name);
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

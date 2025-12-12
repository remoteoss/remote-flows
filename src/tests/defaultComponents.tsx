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
};

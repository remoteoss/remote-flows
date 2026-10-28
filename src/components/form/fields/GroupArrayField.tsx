import { useFieldArray, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { baseFields } from '@/src/components/form/fields/baseFields';
import { isFieldSkipped } from '@/src/components/form/utils';
import { useFormFields } from '@/src/context';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { BaseTypes } from './types';

export type GroupArrayFieldProps = {
  name: string;
  label: string;
  hideLabel?: boolean;
  description?: React.ReactNode;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
  fields: $TSFixMe[];
  additionalProps?: Record<string, unknown>;
  component?: Components['group-array'];
  components?: Components;
};

export function GroupArrayField({
  name,
  label,
  hideLabel,
  description,
  addFieldText = 'Add item',
  minItems = 0,
  maxItems,
  fields,
  additionalProps,
  component,
  components,
}: GroupArrayFieldProps) {
  const { components: formComponents } = useFormFields();
  const { control, getFieldState, formState } = useFormContext();
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({ control, name, keyName: 'rowId' });

  const Component = component || formComponents?.['group-array'];

  if (!Component) {
    throw new Error(`Group array component not found for field ${name}`);
  }

  const { error } = getFieldState(name, formState);
  const blankRow = Object.fromEntries(fields.map((field) => [field.name, '']));

  return (
    <Component
      name={name}
      label={label}
      hideLabel={hideLabel}
      description={description}
      addFieldText={addFieldText}
      error={typeof error?.message === 'string' ? error.message : undefined}
      canAdd={maxItems === undefined || rows.length < maxItems}
      add={() => append(blankRow)}
      rows={rows.map((row, index) => ({
        id: row.rowId,
        index,
        canRemove: rows.length > minItems,
        remove: () => remove(index),
        fields: fields.map((field) => {
          if (isFieldSkipped(field)) {
            return null;
          }

          const FieldComponent = baseFields[field.type as BaseTypes];
          const fieldName = `${name}.${index}.${field.name}`;

          if (!FieldComponent) {
            return (
              <p key={fieldName} className='error'>
                Field type {field.type} not supported
              </p>
            );
          }

          return (
            <FieldComponent
              key={fieldName}
              {...omit(field, 'WrapperComponent')}
              name={fieldName}
              additionalProps={{
                ...additionalProps,
                ...field.additionalProps,
              }}
              component={components?.[field.type as keyof Components]}
            />
          );
        }),
      }))}
    />
  );
}

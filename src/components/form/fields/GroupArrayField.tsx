import { useFieldArray, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { baseFields } from '@/src/components/form/fields/baseFields';
import { isFieldSkipped } from '@/src/components/form/utils';
import { useFormFields } from '@/src/context';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { BaseTypes } from './types';

type GroupArrayFieldProps = {
  name: string;
  label: string;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
  fields: $TSFixMe[];
  component?: Components['group-array'];
  components?: Components;
};

export function GroupArrayField({
  name,
  label,
  addFieldText = 'Add item',
  minItems = 0,
  maxItems,
  fields,
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

  const blankRow = Object.fromEntries(fields.map((field) => [field.name, '']));

  return (
    <Component
      name={name}
      label={label}
      addFieldText={addFieldText}
      error={getFieldState(name, formState).error?.message}
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

          const isMultiSelect = field.type === 'select' && field.multiple;
          const FieldComponent =
            baseFields[
              isMultiSelect ? 'multi-select' : (field.type as BaseTypes)
            ];
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
              component={components?.[field.type as keyof Components]}
            />
          );
        }),
      }))}
    />
  );
}

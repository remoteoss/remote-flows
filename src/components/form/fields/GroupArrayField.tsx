import { ReactNode } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { baseFields } from '@/src/components/form/fields/baseFields';
import {
  getBlankRowValues,
  getFieldRenderType,
  isFieldSkipped,
} from '@/src/components/form/utils';
import { useFormFields } from '@/src/context';
import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { BaseTypes } from './types';

type GroupArrayFieldProps = {
  name: string;
  label: string;
  hideLabel?: boolean;
  description?: ReactNode;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
  fields: $TSFixMe[];
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
  components,
}: GroupArrayFieldProps) {
  const { components: formComponents } = useFormFields();
  const { control, getFieldState, formState } = useFormContext();
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({ control, name, keyName: 'rowId' });

  const Component =
    components?.['group-array'] || formComponents?.['group-array'];

  if (!Component) {
    throw new Error(`Group array component not found for field ${name}`);
  }

  const error = getFieldState(name, formState).error?.message;
  const canRemove = rows.length > minItems;
  const visibleFields = fields.filter((field) => !isFieldSkipped(field));
  const blankRow = getBlankRowValues(fields);

  const renderRowFields = (index: number) =>
    visibleFields.map((field) => {
      const fieldName = `${name}.${index}.${field.name}`;
      const FieldComponent = baseFields[getFieldRenderType(field) as BaseTypes];

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
    });

  return (
    <Component
      name={name}
      label={label}
      hideLabel={hideLabel}
      description={description}
      addFieldText={addFieldText}
      error={error}
      canAdd={maxItems === undefined || rows.length < maxItems}
      add={() => append(blankRow)}
      rows={rows.map((row, index) => ({
        id: row.rowId,
        index,
        canRemove,
        remove: () => remove(index),
        fields: renderRowFields(index),
      }))}
    />
  );
}

import { useFieldArray, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { baseFields } from '@/src/components/form/fields/baseFields';
import { Button } from '@/src/components/ui/button';
import { isFieldSkipped } from '@/src/components/form/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { BaseTypes } from './types';

type GroupArrayFieldProps = {
  name: string;
  label: string;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
  fields: $TSFixMe[];
};

export function GroupArrayField({
  name,
  label,
  addFieldText = 'Add item',
  minItems = 0,
  maxItems,
  fields,
}: GroupArrayFieldProps) {
  const { control } = useFormContext();
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({ control, name, keyName: 'rowId' });

  const blankRow = Object.fromEntries(fields.map((field) => [field.name, '']));

  return (
    <div
      role='group'
      aria-label={label}
      className='grid gap-4 RemoteFlows__GroupArrayField'
    >
      <p className='text-sm font-semibold'>{label}</p>
      {rows.map((row, index) => (
        <div
          key={row.rowId}
          className='grid gap-4 RemoteFlows__GroupArrayField__Row'
        >
          <div className='grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-4'>
            {fields.map((field) => {
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
                />
              );
            })}
          </div>
          {rows.length > minItems ? (
            <div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                aria-label={`Remove ${label} ${index + 1}`}
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          ) : null}
        </div>
      ))}
      {maxItems === undefined || rows.length < maxItems ? (
        <div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => append(blankRow)}
          >
            {addFieldText}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

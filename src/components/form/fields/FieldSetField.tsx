import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { cn } from '@/src/lib/utils';
import { SupportedTypes } from './types';
import { Components } from '@/src/types/remoteFlows';
import { Statement, StatementProps } from '@/src/components/form/Statement';
import { useFormContext } from 'react-hook-form';
import { useEffect, useRef } from 'react';

type FieldBase = {
  label: string;
  name: string;
  description: string;
};

type FieldWithOptions = FieldBase & {
  type: 'select' | 'radio';
  options: Array<{ value: string; label: string }>;
};

type FieldWithoutOptions = FieldBase & {
  type: Exclude<SupportedTypes, 'select' | 'radio'>;
  options?: never;
};

type Field = FieldWithOptions | FieldWithoutOptions;

type FieldSetProps = {
  label: string;
  name: string;
  description: string;
  fields: Field[];
  components: Components;
  statement?: StatementProps;
};

export function FieldSetField({
  label,
  name,
  fields,
  description,
  components,
  statement,
}: FieldSetProps) {
  const { watch, trigger } = useFormContext();
  const fieldNames = fields.map(
    ({ name: fieldName }) => `${name}.${fieldName}`,
  );
  const watchedValues = watch(fieldNames);
  const prevValuesRef = useRef<string[]>(watchedValues);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentValues = watchedValues;
    const previousValues = prevValuesRef.current;

    // Check if any value has changed
    let hasChanged = false;
    for (let i = 0; i < currentValues.length; i++) {
      if (
        currentValues[i] !== undefined &&
        previousValues[i] !== currentValues[i]
      ) {
        hasChanged = true;
        // This is to prevent the form from triggering validation too many times
        break;
      }
    }
    // If changes detected and we haven't triggered yet, run trigger
    if (hasChanged) {
      // We need to debounce the validation trigger so that tests don't freeze
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
      triggerTimeoutRef.current = setTimeout(() => {
        trigger();
      }, 50);

      return;
    }
    prevValuesRef.current = [...currentValues];

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [watchedValues, trigger]);

  return (
    <fieldset
      className={cn(
        'border-1 border-input p-4 rounded-xl',
        `RemoteFlows__FieldSetField__${name}`,
      )}
    >
      <legend className="text-sm font-semibold px-2">{label}</legend>
      {description ? (
        <div
          className="mb-5 RemoteFlows__FieldSetField__Description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}
      <div className="grid gap-4">
        {fields.map((field) => {
          const FieldComponent = fieldsMap[field.type];

          // @ts-expect-error - TODO: use types from json-schema-form v1
          if (field.isVisible === false || field.deprecated) {
            return null; // Skip hidden or deprecated fields
          }

          return (
            <FieldComponent
              {...field}
              key={field.name}
              name={`${name}.${field.name}`}
              component={components?.[field.type]}
            />
          );
        })}
        {statement ? <Statement {...statement} /> : null}
      </div>
    </fieldset>
  );
}

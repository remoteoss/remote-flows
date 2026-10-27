import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  checkFieldHasForcedValue,
  isFieldSkipped,
  resolveFieldDynamicProperties,
} from '@/src/components/form/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

export function useApplyRevealDefaults(
  fields: $TSFixMe[],
  fieldValues?: Record<string, unknown>,
) {
  const { getValues, setValue, clearErrors } = useFormContext();
  const previouslyVisible = useRef<Set<string> | null>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const revealedWithDefault: $TSFixMe[] = [];

    fields.forEach((rawField) => {
      const field = resolveFieldDynamicProperties(rawField, fieldValues);

      if (isFieldSkipped(field) || checkFieldHasForcedValue(field)) {
        return;
      }

      visible.add(field.name);

      if (
        field.default !== undefined &&
        !field.readOnly &&
        previouslyVisible.current &&
        !previouslyVisible.current.has(field.name)
      ) {
        revealedWithDefault.push(field);
      }
    });

    revealedWithDefault.forEach((field) => {
      if (isEmpty(getValues(field.name))) {
        setValue(field.name, field.default);
        clearErrors(field.name);
      }
    });

    previouslyVisible.current = visible;
  });
}

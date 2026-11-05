import equal from 'fast-deep-equal';
import { supportedTypes } from './fieldTypes';
import type { $TSFixMe } from './types';

export function isMultiSelect(field: $TSFixMe) {
  return field.type === supportedTypes.SELECT && field.multiple;
}

/**
 * The field type to render a field with: a select that allows several values renders as a
 * multi-select, every other field as its own type.
 */
export function getFieldRenderType(field: $TSFixMe): string {
  return isMultiSelect(field) ? 'multi-select' : field.type;
}

export function getBlankRowValues(fields: $TSFixMe[]) {
  return Object.fromEntries(
    fields.map((field) => [field.name, isMultiSelect(field) ? [] : '']),
  );
}

export function isForceValue(field: $TSFixMe) {
  return field.const !== undefined && equal(field.const, field.default);
}

/**
 * Check if a field has a forced value.
 * @param field - The field to check.
 * @returns True if the field has a forced value, false otherwise.
 */
export function checkFieldHasForcedValue(field: $TSFixMe) {
  // A field to be considered "forced value" must:
  return (
    isForceValue(field) && // Only accepts a specific value that is also prefilled, meaning it's not critical
    field.type !== 'checkbox' && // Because checkbox must always be visible
    field.type !== 'hidden' // Because hidden inputs shouldn't be visible
  );
}

/**
 * Applies a field's `calculateDynamicProperties` to the current form values.
 *
 * @param field - The field definition.
 * @param formValues - Current form values.
 * @returns The field with its dynamic properties merged in.
 */
export function resolveFieldDynamicProperties(
  field: $TSFixMe,
  formValues: $TSFixMe,
) {
  if (!field.calculateDynamicProperties) {
    return field;
  }
  return {
    ...field,
    ...(field.calculateDynamicProperties(formValues, field) || {}),
  };
}

/**
 * Checks whether a field is left out of the form entirely (invisible, hidden or deprecated).
 *
 * @param field - The field definition, with dynamic properties already resolved.
 * @returns True if the field is not rendered, false otherwise.
 */
export function isFieldSkipped(field: $TSFixMe) {
  return field.isVisible === false || field.deprecated || field.hidden;
}

/**
 * Checks whether a fieldset has anything to show: its own description, statement, extra,
 * help center link or toggle, or at least one field the user can see.
 *
 * @param fieldset - The fieldset props or field definition.
 * @param formValues - Current form values, used to resolve dynamic field properties.
 * @returns True if the fieldset has visible content, false otherwise.
 */
export function fieldsetHasVisibleContent(
  fieldset: $TSFixMe,
  formValues: $TSFixMe,
): boolean {
  if (
    fieldset.description ||
    fieldset.statement ||
    fieldset.extra ||
    fieldset.meta?.helpCenter?.id ||
    fieldset.features?.toggle?.enabled
  ) {
    return true;
  }

  return (fieldset.fields ?? []).some((field: $TSFixMe) => {
    const resolved = resolveFieldDynamicProperties(field, formValues);

    if (isFieldSkipped(resolved) || resolved.type === supportedTypes.HIDDEN) {
      return false;
    }

    if (checkFieldHasForcedValue(resolved)) {
      return Boolean(
        resolved.statement?.title ||
        resolved.statement?.description ||
        resolved.description,
      );
    }

    if (resolved.Component) {
      return true;
    }

    if (
      resolved.type === supportedTypes.FIELDSET ||
      resolved.type === supportedTypes.FIELDSET_FLAT
    ) {
      return fieldsetHasVisibleContent(resolved, formValues);
    }

    return true;
  });
}

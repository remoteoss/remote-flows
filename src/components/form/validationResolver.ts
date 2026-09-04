import { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type {
  FormErrors,
  ValidationResult,
} from '@remoteoss/remote-json-schema-form-kit';

export function iterateFormErrors(
  formErrors?: FormErrors,
  parentPath = '',
): FieldErrors {
  return Object.entries(formErrors || {}).reduce(
    (allErrors: FieldErrors, [fieldName, message]) => {
      const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

      // If message is a nested object, recurse
      if (
        typeof message === 'object' &&
        message !== null &&
        !Array.isArray(message)
      ) {
        return {
          ...allErrors,
          ...iterateFormErrors(message as FormErrors, fullPath),
        };
      }

      // Extract the error message string from various payload formats
      const messageString =
        typeof message === 'string' ? message : JSON.stringify(message);

      allErrors[fullPath] = {
        type: 'validation',
        message: messageString,
      };

      // Also add errors for nested variants (.value and .filter) in case the field is nested
      allErrors[`${fullPath}.value`] = {
        type: 'validation',
        message: messageString,
      };

      return allErrors;
    },
    {} as FieldErrors,
  );
}

export const useJsonSchemasValidationFormResolver = <
  T extends FieldValues = FieldValues,
>(
  handleValidation: (data: T) => Promise<ValidationResult | null>,
): Resolver<T> => {
  return async (data: T) => {
    const result = await handleValidation(data);

    // Handle null case - return no errors
    if (!result) {
      return {
        values: data,
        errors: {} as Record<string, never>,
      };
    }

    const formErrors = 'formErrors' in result ? result.formErrors : undefined;

    if (Object.keys(formErrors || {}).length > 0) {
      const errors = iterateFormErrors(formErrors);
      return {
        values: {} as Record<string, never>,
        errors: errors as FieldErrors<T>,
      };
    }
    return {
      values: data,
      errors: {} as Record<string, never>,
    };
  };
};

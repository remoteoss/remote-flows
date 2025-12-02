import { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ValidationError } from 'yup';
import type {
  FormErrors,
  ValidationResult,
} from '@remoteoss/remote-json-schema-form-kit';

// TODO: deprecated only used in the CostCalculatorFlow as we're using yup there
export function iterateErrors(error: ValidationError) {
  const errors = (error as ValidationError).inner.reduce(
    (
      allErrors: Record<string, { type: string; message: string }>,
      currentError: ValidationError,
    ) => {
      return {
        ...allErrors,
        [currentError.path as string]: {
          type: currentError.type ?? 'validation',
          message: currentError.message,
        },
      };
    },
    {} as Record<string, { type: string; message: string }>,
  );

  return errors;
}

function iterateFormErrors(formErrors?: FormErrors): FieldErrors {
  const flattenedErrors: FieldErrors = {};

  const flattenErrors = (obj?: FormErrors, prefix = '') => {
    Object.entries(obj || {}).forEach(([fieldName, message]) => {
      const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

      if (typeof message === 'string') {
        // Simple string error
        flattenedErrors[fullPath] = {
          type: 'validation',
          message: message,
        };
      } else if (
        typeof message === 'object' &&
        message !== null &&
        !Array.isArray(message)
      ) {
        // Check if this is a leaf error (has 'value' property) or a nested object
        if (
          'value' in message &&
          typeof (message as Record<string, string>).value === 'string'
        ) {
          // Case: { value: "..." }
          flattenedErrors[fullPath] = {
            type: 'validation',
            message: (message as Record<string, string>).value as string,
          };
        } else if (Object.values(message).some((v) => typeof v === 'string')) {
          // Nested object with string values - recurse
          flattenErrors(message, fullPath);
        } else {
          // Fallback
          flattenedErrors[fullPath] = {
            type: 'validation',
            message: JSON.stringify(message),
          };
        }
      } else {
        // Fallback for arrays or other structures
        flattenedErrors[fullPath] = {
          type: 'validation',
          message: JSON.stringify(message),
        };
      }
    });
  };

  flattenErrors(formErrors);

  // Add support for .value and .filter variants for compatibility
  const withVariants: FieldErrors = { ...flattenedErrors };
  Object.keys(flattenedErrors).forEach((path) => {
    withVariants[`${path}.value`] = flattenedErrors[path];
  });

  return withVariants;
}

export const useJsonSchemasValidationFormResolver = <
  T extends FieldValues = FieldValues,
>(
  handleValidation: (data: T) => Promise<ValidationResult | null>,
): Resolver<T> => {
  return async (data: T) => {
    const result = await handleValidation(data);

    console.log('result', result);

    // Handle null case - return no errors
    if (!result) {
      return {
        values: data,
        errors: {},
      };
    }

    const formErrors = 'formErrors' in result ? result.formErrors : undefined;

    if (Object.keys(formErrors || {}).length > 0) {
      const errors = iterateFormErrors(formErrors);
      return {
        values: {} as T,
        errors: errors as FieldErrors<T>,
      };
    }
    return {
      values: data,
      errors: {},
    };
  };
};

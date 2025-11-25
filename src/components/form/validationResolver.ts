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
  return Object.entries(formErrors || {}).reduce(
    (allErrors: FieldErrors, [fieldName, message]) => {
      // Extract the error message string from various payload formats
      let messageString: string;

      if (typeof message === 'string') {
        // Case 1: Simple string error
        messageString = message;
      } else if (
        typeof message === 'object' &&
        message !== null &&
        !Array.isArray(message)
      ) {
        // Case 2: Object with 'value' property (e.g., { value: "..." })
        messageString =
          ((message as Record<string, string>).value as string) ||
          JSON.stringify(message);
      } else {
        // Case 3: Fallback for arrays or other structures
        messageString = JSON.stringify(message);
      }

      allErrors[fieldName] = {
        type: 'validation',
        message: messageString,
      };

      // Also add errors for nested variants (.value and .filter) in case the field is nested
      allErrors[`${fieldName}.value`] = {
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
  handleValidation: (data: T) => ValidationResult | null,
): Resolver<T> => {
  return async (data: T) => {
    const result = await handleValidation(data);

    // Handle null case - return no errors
    if (!result) {
      return {
        values: data,
        errors: {},
      };
    }

    // Extract formErrors - handle both new and legacy ValidationResult formats
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

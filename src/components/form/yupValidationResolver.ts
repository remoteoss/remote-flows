import { useCallback } from 'react';
import { FieldValues, Resolver } from 'react-hook-form';
import type { InferType, ValidationError, AnyObjectSchema } from 'yup';

export type JSONSchemaValidation = (
  values: Record<string, unknown>,
) => { yupError: any; formErrors: any } | null;

function iterateErrors(error: ValidationError) {
  const errors = (error as ValidationError).inner.reduce(
    (
      allErrors: Record<string, { type: string; message: string }>,
      currentError: ValidationError,
    ) => {
      console.log({ allErrors, currentError });
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

export const useYupValidationResolver = <T extends AnyObjectSchema>(
  validationSchema: T,
  JSONSchemaValidation: React.MutableRefObject<JSONSchemaValidation | null>,
): Resolver<InferType<T>> =>
  useCallback(
    async (data: FieldValues) => {
      let yupValues;
      let yupErrors = {};
      let hasYupErrors = false;

      try {
        yupValues = await validationSchema.validate(data, {
          abortEarly: false,
        });
      } catch (error) {
        hasYupErrors = true;
        yupErrors = iterateErrors(error as ValidationError);
      }

      const dynamicValues = await JSONSchemaValidation.current?.(data);
      let jsonErrors = {};
      let hasJsonErrors = false;

      if (
        dynamicValues?.formErrors &&
        Object.keys(dynamicValues.formErrors).length > 0
      ) {
        hasJsonErrors = true;
        // If we have dynamic form errors, convert them to the expected format
        if (dynamicValues.yupError) {
          // If the dynamic validation returns a yupError object, use iterateErrors
          jsonErrors = iterateErrors(dynamicValues.yupError);
        } else {
          // Otherwise, manually format the errors
          jsonErrors = Object.entries(dynamicValues.formErrors).reduce(
            (acc, [field, message]) => ({
              ...acc,
              [field]: {
                type: 'validation',
                message: message as string,
              },
            }),
            {},
          );
        }
      }

      const combinedErrors = { ...yupErrors, ...jsonErrors };

      // Return based on validation results
      if (hasYupErrors || hasJsonErrors) {
        return {
          values: {},
          errors: combinedErrors,
        };
      }

      // Both validations passed
      return {
        values: yupValues,
        errors: {},
      };
    },
    [validationSchema],
  );

import { HeadlessFormOutput } from '@remoteoss/json-schema-form';
import { useCallback } from 'react';
import { FieldValues, Resolver } from 'react-hook-form';
import type { InferType, ValidationError, AnyObjectSchema } from 'yup';

const useValidationYupResolver = <T extends AnyObjectSchema>(
  validationSchema: T,
) => {
  return useCallback(
    async (data: FieldValues) => {
      return await validationSchema.validate(data, {
        abortEarly: false,
      });
    },
    [validationSchema],
  );
};

function iterateErrors(error: ValidationError) {
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

export const useValidationFormResolver = <T extends AnyObjectSchema>(
  validationSchema: T,
  JSONSchemaValidation: React.MutableRefObject<
    HeadlessFormOutput['handleValidation'] | null
  >,
): Resolver<InferType<T>> => {
  const yupValidation = useValidationYupResolver(validationSchema);
  return useCallback(
    async (data: FieldValues) => {
      let yupValues;
      let yupErrors = {};
      let hasYupErrors = false;

      try {
        yupValues = await yupValidation(data);
      } catch (error) {
        hasYupErrors = true;
        yupErrors = iterateErrors(error as ValidationError);
      }

      console.log({ yupValues });

      const dynamicValues = await JSONSchemaValidation.current?.(data);
      console.log({ dynamicValues });
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
        console.log('returning errors', combinedErrors);
        return {
          values: {},
          errors: combinedErrors,
        };
      }

      console.log('success', yupValues);

      // Both validations passed
      return {
        values: yupValues,
        errors: {},
      };
    },
    [validationSchema],
  );
};

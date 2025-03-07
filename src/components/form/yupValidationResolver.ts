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
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        });

        const dynamicValues = await JSONSchemaValidation.current?.(data);

        if (dynamicValues) {
          return {
            values: {},
            errors: iterateErrors(dynamicValues.yupError),
          };
        }

        return {
          values,
          errors: {},
        };
      } catch (error) {
        const errors = iterateErrors(error as ValidationError);

        return {
          values: {},
          errors,
        };
      }
    },
    [validationSchema],
  );

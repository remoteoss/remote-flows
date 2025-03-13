import { useCallback } from 'react';
import { FieldValues, Resolver } from 'react-hook-form';
import type { AnyObjectSchema, InferType, ValidationError } from 'yup';

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

      if (Object.keys(yupErrors).length > 0) {
        return {
          values: {},
          errors: yupErrors,
        };
      }

      return {
        values: yupValues,
        errors: {},
      };
    },
    [validationSchema],
  );
};

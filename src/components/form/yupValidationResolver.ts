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
      let values;
      let errors = {};

      try {
        values = await yupValidation(data);
      } catch (error) {
        errors = iterateErrors(error as ValidationError);
      }

      if (Object.keys(errors).length > 0) {
        return {
          values: {},
          errors: errors,
        };
      }

      return {
        values,
        errors: {},
      };
    },
    [validationSchema],
  );
};

export const useJsonSchemasValidationFormResolver = <T extends AnyObjectSchema>(
  handleValidation: (data: FieldValues) => {
    formErrors: Record<string, string>;
    yupError: ValidationError;
  },
): Resolver<InferType<T>> => {
  return useCallback(async (data: FieldValues) => {
    const { yupError, formErrors } = handleValidation(data);

    if (Object.keys(formErrors || {}).length > 0) {
      return {
        values: {},
        errors: iterateErrors(yupError as ValidationError),
      };
    }
    return {
      values: data,
      errors: {},
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

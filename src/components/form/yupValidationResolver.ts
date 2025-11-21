import { FieldValues, Resolver } from 'react-hook-form';
import type { AnyObjectSchema, InferType, ValidationError } from 'yup';

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

export const useJsonSchemasValidationFormResolver = <T extends AnyObjectSchema>(
  handleValidation: (data: FieldValues) => {
    formErrors: Record<string, string>;
    yupError: ValidationError;
  },
): Resolver<InferType<T>> => {
  return async (data: FieldValues) => {
    const { yupError, formErrors } = await handleValidation(data);

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
  };
};

export const useJsonSchemasValidationFormResolverNext = <
  T extends AnyObjectSchema,
>(
  handleValidation: (data: FieldValues) => {
    formErrors: Record<string, string>;
  },
): Resolver<InferType<T>> => {
  return async (data: FieldValues) => {
    const { formErrors } = await handleValidation(data);
    console.log('formErrors', formErrors);

    if (Object.keys(formErrors || {}).length > 0) {
      return {
        values: {},
        errors: formErrors,
      };
    }
    return {
      values: data,
      errors: {},
    };
  };
};

import { FieldValues, Resolver } from 'react-hook-form';
import type { AnyObjectSchema, InferType, ValidationError } from 'yup';

// TODO: deprecated only used with old json-schema-form-version
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

// TODO: deprecated only used with old json-schema-form-version
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

function iterateFormErrors(formErrors: Record<string, string>) {
  return Object.entries(formErrors || {}).reduce(
    (
      allErrors: Record<string, { type: string; message: string }>,
      [fieldName, message],
    ) => {
      return {
        ...allErrors,
        [fieldName]: {
          type: 'validation',
          message,
        },
      };
    },
    {} as Record<string, { type: string; message: string }>,
  );
}

export const useJsonSchemasValidationFormResolverNext = <
  T extends AnyObjectSchema,
>(
  handleValidation: (data: FieldValues) => {
    formErrors: Record<string, string>;
  },
): Resolver<InferType<T>> => {
  return async (data: FieldValues) => {
    const { formErrors } = await handleValidation(data);

    if (Object.keys(formErrors || {}).length > 0) {
      return {
        values: {},
        errors: iterateFormErrors(formErrors),
      };
    }
    return {
      values: data,
      errors: {},
    };
  };
};

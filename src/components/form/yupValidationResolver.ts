import { useCallback } from 'react';
import { FieldValues, Resolver } from 'react-hook-form';
import * as yup from 'yup';

export const useYupValidationResolver = <T extends yup.AnyObjectSchema>(
  validationSchema: T,
): Resolver<yup.InferType<T>> =>
  useCallback(
    async (data: FieldValues) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        });

        return {
          values,
          errors: {},
        };
      } catch (error) {
        const errors = (error as yup.ValidationError).inner.reduce(
          (
            allErrors: Record<string, { type: string; message: string }>,
            currentError: yup.ValidationError,
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

        return {
          values: {},
          errors,
        };
      }
    },
    [validationSchema],
  );

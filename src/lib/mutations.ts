/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta } from '@/src/types/remoteFlows';
import { UseMutationResult } from '@tanstack/react-query';

type MutationData<T> =
  T extends UseMutationResult<infer R, any, any, any> ? R : never;
type MutationVariables<T> =
  T extends UseMutationResult<any, any, infer V, any> ? V : never;
type MutationError<T> =
  T extends UseMutationResult<any, infer E, any, any> ? E : never;

export interface SuccessResponse<D> {
  data: D;
  error: null;
}

export interface FieldError {
  field: string;
  messages: string[];
}

export interface ErrorResponse<E> {
  data: null;
  error: E;
  rawError: Record<string, unknown>;
  fieldErrors: FieldError[];
}

type PromiseResult<D, E> = SuccessResponse<D> | ErrorResponse<E>;

/**
 * Extracts field errors from error response into a structured format
 * @param error - The error response object
 * @returns Array of field errors with field name and messages
 */
export function extractFieldErrors(error: any): FieldError[] {
  if (!error || !error.errors || typeof error.errors !== 'object') return [];

  const fieldErrors: FieldError[] = [];

  Object.entries(error.errors).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      fieldErrors.push({
        field: key,
        messages: value.map((msg: any) => String(msg)),
      });
      return;
    }
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (Array.isArray(nestedValue)) {
          fieldErrors.push({
            field: nestedKey,
            messages: nestedValue.map((msg: any) => String(msg)),
          });
        }
      });
    }
  });
  return fieldErrors;
}
/**
 * Converts a mutation to a promise-based API. We avoid using the
 * `mutateAsync` method from react-query for 2 reasons:
 * 1. We lose the isPending state of the mutation
 * 2. We want to return the data and error in a consistent way
 *    (either data or error is null)
 * @param mutation
 * @returns
 */
export function mutationToPromise<
  T extends UseMutationResult<any, any, any, any>,
>(mutation: T) {
  type Data = MutationData<T>;
  type Variables = MutationVariables<T>;
  type Error = MutationError<T>;

  return {
    mutateAsync: (values: Variables): Promise<PromiseResult<Data, Error>> => {
      return new Promise((resolve, reject) => {
        mutation.mutate(values, {
          onSuccess: (response) => {
            if (response.data) {
              resolve({
                data: response.data as Data,
                error: null,
              });
            } else {
              const fieldErrors = extractFieldErrors(response.error);
              resolve({
                data: null,
                error: response.error?.message
                  ? (new Error(response.error.message) as unknown as Error)
                  : (new Error(
                      'Something went wrong. Please try again later.',
                    ) as unknown as Error),
                rawError: response.error,
                fieldErrors,
              });
            }
          },
          onError: (error) => {
            const fieldErrors = extractFieldErrors(error);
            reject({
              data: null,
              error: error as Error,
              rawError: error,
              fieldErrors,
            });
          },
        });
      });
    },
  };
}

/**
 * Enhanced FieldError interface with user-friendly labels
 */
export interface NormalizedFieldError extends FieldError {
  userFriendlyLabel: string;
}

/**
 * Utility function to normalize field errors using field metadata
 * @param fieldErrors - Array of field errors from API response
 * @param meta - Field metadata containing field names and labels
 * @returns Normalized field errors with user-friendly labels
 */
export function normalizeFieldErrors(
  fieldErrors: FieldError[],
  meta?: Meta,
): NormalizedFieldError[] {
  if (!fieldErrors || fieldErrors.length === 0) {
    return [];
  }

  return fieldErrors.map((fieldError) => {
    const fieldMeta = meta?.[fieldError.field];
    const userFriendlyLabel = fieldMeta?.label || fieldError.field;

    return {
      ...fieldError,
      userFriendlyLabel,
      // Keep the original field name for form integration
      field: fieldError.field,
      messages: fieldError.messages,
    };
  });
}

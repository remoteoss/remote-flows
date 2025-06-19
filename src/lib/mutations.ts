/* eslint-disable @typescript-eslint/no-explicit-any */
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
  rawError: E;
  fieldErrors: FieldError[];
}

type PromiseResult<D, E> = SuccessResponse<D> | ErrorResponse<E>;

/**
 * Extracts field errors from error response into a structured format
 * @param error - The error response object
 * @returns Array of field errors with field name and messages
 */
export function extractFieldErrors(error: any): FieldError[] {
  const fieldErrors: FieldError[] = [];

  if (!error) return fieldErrors;

  // Handle nested errors structure like { errors: { field: [messages] } }
  if (error.errors && typeof error.errors === 'object') {
    Object.entries(error.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        fieldErrors.push({
          field,
          messages: messages.map((msg: any) => String(msg)),
        });
      } else if (typeof messages === 'string') {
        fieldErrors.push({
          field,
          messages: [messages],
        });
      }
    });
  }

  // Handle flat error structure like { field: [messages] }
  else if (typeof error === 'object') {
    Object.entries(error).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        fieldErrors.push({
          field,
          messages: messages.map((msg: any) => String(msg)),
        });
      } else if (typeof messages === 'string') {
        fieldErrors.push({
          field,
          messages: [messages],
        });
      }
    });
  }

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
                error: new Error(
                  'Something went wrong. Please try again later.',
                ) as unknown as Error,
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
              originalError: error,
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
  meta?: Record<string, { label?: string; prettyValue?: string | boolean }>,
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

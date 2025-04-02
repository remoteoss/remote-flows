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

export interface ErrorResponse<E> {
  data: null;
  error: E;
}

type PromiseResult<D, E> = SuccessResponse<D> | ErrorResponse<E>;

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
              resolve({
                data: null,
                error: new Error(
                  'Something went wrong. Please try again later.',
                ) as unknown as Error,
              });
            }
          },
          onError: (error) => {
            reject({
              data: null,
              error: error as Error,
            });
          },
        });
      });
    },
  };
}

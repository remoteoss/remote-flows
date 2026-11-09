import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { mutationToPromise } from '@/src/lib/mutations';

/**
 * Binds a core options factory to the client from context, keeping its remaining arguments.
 * Name the result `useX`: it reads context, so it must be called as a hook.
 */
export const withClient =
  <TArgs extends unknown[], TOptions>(
    factory: (client: Client, ...args: TArgs) => TOptions,
  ) =>
  (...args: TArgs): TOptions => {
    const { client } = useClient();
    return factory(client as Client, ...args);
  };

/**
 * Turns a core mutation factory into a hook that returns the mutation plus `mutateAsyncOrThrow`.
 */
export const createClientMutation =
  <TArgs extends unknown[], TVars, TData>(
    factory: (
      client: Client,
      ...args: TArgs
    ) => { mutationFn: (vars: TVars) => Promise<TData> },
  ) =>
  (...args: TArgs) => {
    const { client } = useClient();
    const mutation = useMutation(factory(client as Client, ...args));
    const { mutate } = mutation;
    const { mutateAsyncOrThrow } = useMemo(
      () => mutationToPromise({ mutate } as typeof mutation),
      [mutate],
    );
    return { ...mutation, mutateAsyncOrThrow };
  };

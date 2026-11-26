import { inject } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  postV1MagicLink,
  getV1IdentityCurrent,
} from '@remoteoss/remote-flows-core/client/sdk.gen';
import type { MagicLinkParams } from '@remoteoss/remote-flows-core/client/types.gen';
import { REMOTE_CLIENT } from '../provide-remote-flows';

/** The entities behind the current token. A client credentials token has no `user`. */
export function injectIdentity() {
  const client = inject(REMOTE_CLIENT);
  return injectQuery(() => ({
    queryKey: ['identity'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const result = await getV1IdentityCurrent({
        client,
        headers: { Authorization: `` },
      });
      return result.data?.data;
    },
  }));
}

/** Creates a one-time login URL for a user that lands on `path` in the Remote dashboard. */
export function injectMagicLink() {
  const client = inject(REMOTE_CLIENT);
  return injectMutation(() => ({
    mutationFn: async (params: MagicLinkParams) => {
      const result = await postV1MagicLink({
        client,
        headers: { Authorization: `` },
        body: params,
      });
      const url = result.data?.data?.url;
      if (!url) {
        throw new Error(
          `Magic link request failed (${result.response?.status ?? 'no response'})`,
        );
      }
      return url;
    },
  }));
}

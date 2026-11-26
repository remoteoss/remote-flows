import { inject } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  identityOptions,
  magicLinkMutation,
  selectIdentity,
  selectMagicLinkUrl,
} from '@remoteoss/remote-flows-core';
import { rejectOnError } from '../core/reject-on-error';
import { REMOTE_CLIENT } from '../provide-remote-flows';

/** The entities behind the current token. A client credentials token has no `user`. */
export function injectIdentity() {
  const client = inject(REMOTE_CLIENT);
  return injectQuery(() => {
    const options = identityOptions(client);
    return {
      ...options,
      queryFn: rejectOnError(options.queryFn),
      select: selectIdentity,
    };
  });
}

/** Creates a one-time login URL that lands on `path` in the Remote dashboard. */
export function injectMagicLink() {
  const client = inject(REMOTE_CLIENT);
  const options = magicLinkMutation(client);
  return injectMutation(() => ({
    mutationFn: async (params: Parameters<typeof options.mutationFn>[0]) => {
      const response = await options.mutationFn(params);
      const url = selectMagicLinkUrl(response);
      if (!url) {
        throw new Error(
          `Magic link request failed (${response.response?.status ?? 'no response'})`,
        );
      }
      return url;
    },
  }));
}

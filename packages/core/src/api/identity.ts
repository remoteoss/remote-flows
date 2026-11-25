import { getV1IdentityCurrent } from '../client/sdk.gen';
import type { Client } from '../client/client';

export const identityOptions = (client: Client) => ({
  queryKey: ['identity'] as const,
  staleTime: 5 * 60 * 1000,
  queryFn: () =>
    getV1IdentityCurrent({
      client,
      headers: { Authorization: `` },
    }),
});

type IdentityResponse = Awaited<
  ReturnType<ReturnType<typeof identityOptions>['queryFn']>
>;

/**
 * The entities behind the current token. Which of `company` and `user` are present depends on
 * the token type: a client credentials token has neither.
 */
export const selectIdentity = (response: IdentityResponse) =>
  response.data?.data;

/**
 * The id of the user behind the token, or undefined when the token has none.
 */
export const selectUserId = (response: IdentityResponse) => {
  const identity = selectIdentity(response);
  return identity && 'user' in identity ? identity.user.id : undefined;
};

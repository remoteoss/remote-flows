import { getV1IdentityCurrent } from '../client/sdk.gen';
import type { Client } from '../client/client';

export const identityOptions = (client: Client) => ({
  queryKey: ['identity'] as const,
  staleTime: 5 * 60 * 1000,
  queryFn: () =>
    getV1IdentityCurrent({
      client,
      headers: {
        Authorization: ``,
      },
    }),
});

type IdentityResponse = Awaited<
  ReturnType<ReturnType<typeof identityOptions>['queryFn']>
>;

export const selectIdentity = (response: IdentityResponse) =>
  response.data?.data;

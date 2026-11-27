import { postV1MagicLink } from '../client/sdk.gen';
import type { Client } from '../client/client';
import type { MagicLinkParams } from '../client/types.gen';

export const magicLinkMutation = (client: Client) => ({
  mutationFn: (params: MagicLinkParams) =>
    postV1MagicLink({
      client,
      headers: {
        Authorization: ``,
      },
      body: params,
    }),
});

type MagicLinkResponse = Awaited<
  ReturnType<ReturnType<typeof magicLinkMutation>['mutationFn']>
>;

export const selectMagicLinkUrl = (response: MagicLinkResponse) =>
  response.data?.data?.url;

import { postV1MagicLink } from '../client/sdk.gen';
import type { Client } from '../client/client';
import type { MagicLinkParams, MagicLinkResponse } from '../client/types.gen';

export const createMagicLinkMutation = (client: Client) => ({
  mutationFn: (params: MagicLinkParams) =>
    postV1MagicLink({
      client,
      headers: { Authorization: `` },
      body: params,
    }),
});

/**
 * Reads the login URL from the response body (`response.data` of the raw response).
 */
export const selectMagicLinkUrl = (body: MagicLinkResponse | undefined) =>
  body?.data?.url;

import { useMutation } from '@tanstack/react-query';
import { MagicLinkParams, postV1MagicLink } from '@/src/client';
import { useClient } from '@/src/context';

import { Client } from '@/src/client/client';

export const useMagicLink = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: MagicLinkParams) => {
      return postV1MagicLink({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: params,
      });
    },
  });
};

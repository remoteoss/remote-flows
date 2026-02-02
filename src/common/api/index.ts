import { useMutation } from '@tanstack/react-query';
import { MagicLinkParams, postGenerateMagicLink } from '@/src/client';
import { useClient } from '@/src/context';

import { Client } from '@/src/client/client';

export const useMagicLink = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: MagicLinkParams) => {
      return postGenerateMagicLink({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: params,
      });
    },
  });
};

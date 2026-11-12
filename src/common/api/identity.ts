import { useQuery } from '@tanstack/react-query';
import { getV1IdentityCurrent } from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';

/**
 * The entities behind the current token. Which of `company` and `user` are present depends on the
 * token type: a client credentials token has neither.
 */
export const useIdentity = ({ enabled }: { enabled?: boolean } = {}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['identity'],
    enabled,
    queryFn: () =>
      getV1IdentityCurrent({
        client: client as Client,
        headers: { Authorization: `` },
      }),
    select: (data) => data.data?.data,
  });
};

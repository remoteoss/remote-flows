import { useQuery } from '@tanstack/react-query';
import { getCurrentIdentity } from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';

export const useIdentity = () => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['identity'],
    queryFn: () =>
      getCurrentIdentity({
        client: client as Client,
        headers: { Authorization: `` },
      }),
    select: (data) => data.data?.data,
  });
};

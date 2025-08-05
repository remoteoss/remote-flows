import { getShowHelpCenterArticle } from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';

export const useZendeskArticle = (
  zendeskId?: string,
  queryOptions?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['zendesk-article', zendeskId],
    queryFn: async () => {
      getShowHelpCenterArticle({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          id: Number(zendeskId),
        },
      });
    },
    ...queryOptions,
  });
};

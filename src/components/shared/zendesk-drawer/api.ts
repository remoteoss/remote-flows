import { getShowHelpCenterArticle } from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';

export const useZendeskArticle = (
  zendeskId: string | null,
  queryOptions?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['zendesk-article', zendeskId],
    queryFn: async () => {
      return getShowHelpCenterArticle({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          id: Number(zendeskId),
        },
      });
    },
    select: (data) => data.data?.data.help_center_article,
    ...queryOptions,
  });
};

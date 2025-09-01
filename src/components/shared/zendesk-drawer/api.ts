import { getShowHelpCenterArticle } from '@/src/client';
import { useClient } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { Client } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';

export const useZendeskArticle = (
  zendeskId: number | null,
  queryOptions?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['zendesk-article', zendeskId],
    queryFn: async () => {
      const response = await getShowHelpCenterArticle({
        client: client as Client,
        path: {
          id: Number(zendeskId),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch article');
      }

      return response;
    },
    select: (data) => {
      const article = data.data?.data.help_center_article;
      if (article) {
        return {
          ...article,
          body: sanitizeHtml(article.body || ''),
        };
      }
      return article;
    },
    retry: false,
    ...queryOptions,
  });
};

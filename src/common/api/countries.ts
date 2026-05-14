import { queryOptions } from '@tanstack/react-query';
import { getV1Countries } from '@/src/client';
import { Client } from '@/src/client/client';

export const countriesOptions = (
  client: Client,
  queryKeySuffix = 'default',
) => {
  return queryOptions({
    queryKey: ['countries', queryKeySuffix] as const,
    retry: false,
    queryFn: async () => {
      const response = await getV1Countries({
        client,
        headers: {
          Authorization: ``,
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch supported countries');
      }

      return response;
    },
  });
};

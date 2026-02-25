import { queryOptions } from '@tanstack/react-query';
import { getSupportedCountry } from '@/src/client';
import { Client } from '@/src/client/client';

export const countriesOptions = (
  client: Client,
  queryKeySuffix = 'default',
) => {
  return queryOptions({
    queryKey: ['countries', queryKeySuffix] as const,
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({
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

import { useClient } from '@/src/context';
import { useQuery } from '@tanstack/react-query';
import { Country, getSupportedCountry } from '@/src/client';
import { Client } from '@/src/client/client';
import { $TSFixMe } from '@/src/types/remoteFlows';

type UseCountriesOptions<TData = Country[]> = {
  enabled?: boolean;
  queryKey?: string;
  select?: (response: Awaited<ReturnType<typeof getSupportedCountry>>) => TData;
};

export const useCountries = <TData = Country[]>(
  options?: UseCountriesOptions<TData>,
) => {
  const { client } = useClient();
  const { enabled, queryKey = 'default', select } = options || {};

  return useQuery<
    Awaited<ReturnType<typeof getSupportedCountry>>,
    Error,
    TData,
    string[]
  >({
    enabled,
    queryKey: ['countries', queryKey],
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch supported countries');
      }

      return response;
    },
    select:
      select ||
      (((response: Awaited<ReturnType<typeof getSupportedCountry>>) => {
        return response.data?.data || [];
      }) as $TSFixMe),
  });
};

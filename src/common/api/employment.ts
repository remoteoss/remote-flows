import { getShowEmployment, GetShowEmploymentResponse } from '@/src/client';
import { useClient } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Client } from '@/src/client/client';

/**
 * Hook to retrieve employment details for a specific employment ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch details for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the employment details.
 */
export const useEmploymentQuery = ({
  employmentId,
  queryParams,
}: {
  employmentId: string;
  queryParams?: $TSFixMe; // TODO: we need to generate openapi-ts types but it's broken at the moment
}): UseQueryResult<
  GetShowEmploymentResponse['data']['employment'],
  unknown
> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    queryFn: () => {
      return getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
        query: queryParams,
      });
    },
    enabled: !!employmentId,
    select: ({ data }) => data?.data?.employment,
  });
};

import {
  getShowEmployment,
  MagicLinkParams,
  postGenerateMagicLink,
} from '@/src/client';
import { useClient } from '@/src/context';
import { ContractAmendmentParams } from '@/src/flows/ContractAmendment/types';

import { Client } from '@/src/client/client';
import { useMutation, useQuery } from '@tanstack/react-query';

type UseEmployment = Pick<ContractAmendmentParams, 'employmentId'>;

/**
 * Hook to retrieve employment details for a specific employment ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch details for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the employment details.
 */
export const useEmploymentQuery = ({ employmentId }: UseEmployment) => {
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
      });
    },
    enabled: !!employmentId,
    select: ({ data }) => data?.data?.employment,
  });
};

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

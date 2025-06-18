import {
  getIndexTimeoff,
  getShowEmployment,
  TimeoffStatus,
} from '@/src/client';
import { useClient } from '@/src/context';
import { ContractAmendmentParams } from '@/src/flows/ContractAmendment/types';
import { Client } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';

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
    select: ({ data }) => data,
  });
};

/**
 * Hook to retrieve time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off data for.
 * @param {TimeoffStatus} [params.status] - The status of the time off requests to filter by (e.g., 'approved', 'pending').
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off data.
 *
 */
export const useTimeOffQuery = ({
  employmentId,
  status,
}: {
  employmentId?: string;
  status?: TimeoffStatus;
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['timeoff', employmentId, status],
    retry: false,
    queryFn: () => {
      return getIndexTimeoff({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        query: {
          employment_id: employmentId,
          status: status,
        },
      });
    },
    select: ({ data }) => data,
  });
};

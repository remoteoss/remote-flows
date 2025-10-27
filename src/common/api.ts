import {
  getIndexLeavePoliciesSummary,
  getIndexTimeoff,
  getShowEmployment,
  TimeoffStatus,
  TimeoffType,
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
  timeoffType,
}: {
  employmentId?: string;
  status?: TimeoffStatus;
  timeoffType?: TimeoffType;
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
          timeoff_type: timeoffType,
        },
      });
    },
    select: ({ data }) => data,
  });
};

/**
 * Hook to retrieve time off balance for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off balance for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off balance.
 *
 */
export const useTimeOffLeavePoliciesSummaryQuery = ({
  employmentId,
}: {
  employmentId?: string;
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['timeoff-balance', employmentId],
    retry: false,
    queryFn: () => {
      return getIndexLeavePoliciesSummary({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId as string },
      });
    },
    select: ({ data }) => data,
  });
};

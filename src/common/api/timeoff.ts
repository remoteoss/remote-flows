import {
  getIndexLeavePoliciesSummary,
  getIndexTimeoff,
  ListTimeoffResponse,
  TimeoffStatus,
  TimeoffType,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { parseLocalDate } from '@/src/common/dates';
import { useClient } from '@/src/context';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to retrieve time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off data for.
 * @param {TimeoffStatus} [params.status] - The status of the time off requests to filter by (e.g., 'approved', 'pending').
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off data.
 *
 */
export const useTimeOffQuery = <TData = ListTimeoffResponse>({
  employmentId,
  status,
  timeoffType,
  options,
}: {
  employmentId?: string;
  status?: TimeoffStatus;
  timeoffType?: TimeoffType;
  options?: {
    enabled?: boolean;
    select?: (data: ListTimeoffResponse | undefined) => TData;
  };
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
    select: ({ data }) => (options?.select?.(data) ?? data) as TData,
    enabled: options?.enabled,
  });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = parseLocalDate(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = parseLocalDate(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${start} → ${end}`;
};

export type PaidTimeoffBreakdownResponse = {
  bookedDays: number;
  timeoffs: {
    status: string;
    duration: number;
    startDate: string;
    endDate: string;
    formattedDate: string;
  }[];
};

/**
 * Hook to retrieve paid time off breakdown for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch paid time off breakdown for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the paid time off breakdown.
 *
 */
export const usePaidTimeoffBreakdownQuery = ({
  employmentId,
  options,
}: {
  employmentId?: string;
  options?: {
    enabled?: boolean;
  };
}) => {
  return useTimeOffQuery<PaidTimeoffBreakdownResponse>({
    employmentId,
    timeoffType: 'paid_time_off',
    options: {
      enabled: options?.enabled,
      select: (data) => {
        return {
          bookedDays:
            data?.data?.timeoffs?.reduce(
              (acc, timeoff) => acc + (timeoff?.timeoff_days?.length || 0),
              0,
            ) || 0,
          timeoffs:
            data?.data?.timeoffs?.map((timeoff) => {
              const duration =
                timeoff?.timeoff_days?.filter((day) => day.hours > 0).length ||
                0;
              return {
                status: timeoff?.status,
                duration: duration,
                startDate: timeoff?.start_date,
                endDate: timeoff?.end_date,
                formattedDate: formatDateRange(
                  timeoff?.start_date,
                  timeoff?.end_date,
                ),
              };
            }) || [],
        };
      },
    },
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

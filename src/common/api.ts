import {
  getIndexLeavePoliciesSummary,
  getIndexTimeoff,
  getShowEmployment,
  ListTimeoffResponse,
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
  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-US', {
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
          bookedDays: data?.data?.total_count || 0,
          timeoffs:
            data?.data?.timeoffs?.map((timeoff) => {
              return {
                status: timeoff?.status,
                duration: timeoff?.timeoff_days.length,
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

export type BookedTimeoffBeforeDateResponse = {
  bookedDaysBeforeTermination: number;
  bookedDaysAfterTermination: number;
};

/**
 * Hook to retrieve booked time off data before and after a specific date for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch booked time off data for.
 * @param {string} [params.date] - The date to fetch booked time off data for.
 * @returns {BookedTimeoffBeforeDateResponse} - The booked time off data before and after the specific date.
 *
 * This hooks it's not taking into account unlimited time off or half days yet or even we you request several days in one request.
 */
export const useBookedTimeoffBeforeAndAfterTerminationQuery = ({
  employmentId,
  date,
  options,
}: {
  employmentId: string;
  date: string;
  options?: { enabled: boolean };
}) => {
  return useTimeOffQuery<BookedTimeoffBeforeDateResponse>({
    employmentId,
    timeoffType: 'paid_time_off',
    status: 'approved',
    options: {
      enabled: options?.enabled,
      select: (data) => {
        return {
          bookedDaysBeforeTermination:
            data?.data?.timeoffs?.filter((timeoff) => {
              return new Date(timeoff?.start_date) <= new Date(date);
            }).length || 0,
          bookedDaysAfterTermination:
            data?.data?.timeoffs?.filter((timeoff) => {
              return new Date(timeoff?.start_date) > new Date(date);
            }).length || 0,
        };
      },
    },
  });
};

export type SummaryTimeOffDataResponse = {
  entitledDays: number;
  bookedDays: number;
  usedDays: number;
  approvedDaysBeforeTermination: number;
  approvedDaysAfterTermination: number;
  remainingDays: number;
};

/**
 * Hook to retrieve summary time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch summary time off data for.
 * @param {string} [params.proposedTerminationDate] - The proposed termination date to fetch summary time off data for.
 * @returns {SummaryTimeOffDataResponse} - The summary time off data.
 *
 * This hook doesn't take into account unlimited time off or half days yet.
 *
 */
export const useSummaryTimeOffDataQuery = ({
  employmentId,
  proposedTerminationDate,
}: {
  employmentId: string;
  proposedTerminationDate: string;
}) => {
  const leavePoliciesSummaryQuery = useTimeOffLeavePoliciesSummaryQuery({
    employmentId,
  });
  const bookedTimeQuery = useBookedTimeoffBeforeAndAfterTerminationQuery({
    employmentId,
    date: proposedTerminationDate,
  });

  const entitledDays =
    (leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.type ===
      'limited' &&
      leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.days) ||
    0;
  const bookedDays =
    leavePoliciesSummaryQuery.data?.data?.[0].booked?.days || 0;
  const usedDays = leavePoliciesSummaryQuery.data?.data?.[0].used.days || 0;
  const approvedDaysBeforeTermination =
    bookedTimeQuery.data?.bookedDaysBeforeTermination || 0;
  const approvedDaysAfterTermination =
    bookedTimeQuery.data?.bookedDaysAfterTermination || 0;
  const remainingDays = entitledDays - bookedDays - usedDays;

  return {
    data: {
      entitledDays,
      bookedDays,
      usedDays,
      approvedDaysBeforeTermination,
      approvedDaysAfterTermination,
      remainingDays: remainingDays < 0 ? 0 : remainingDays,
    },
    isLoading: leavePoliciesSummaryQuery.isLoading || bookedTimeQuery.isLoading,
    isError: leavePoliciesSummaryQuery.isError || bookedTimeQuery.isError,
    error: leavePoliciesSummaryQuery.error || bookedTimeQuery.error,
  };
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

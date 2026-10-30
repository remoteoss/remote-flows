import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  DeclineTimeoffParams,
  getV1Timeoff,
  GetV1TimeoffData,
  getV1TimeoffId,
  ListTimeoffResponse,
  NullableApproverId,
  postV1TimeoffTimeoffIdApprove,
  postV1TimeoffTimeoffIdDecline,
  TimeoffErrorResponse,
  TimeoffResponse,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import {
  TimeOffDecisionError,
  TimeOffRequestError,
  TimeOffRequestsError,
} from '@/src/flows/TimeOff/types';
import { isMutationError } from '@/src/lib/mutations';

const getTimeOffRequestErrorReason = (
  status: number | undefined,
): TimeOffRequestError['reason'] => {
  if (status === 404) {
    return 'not_found';
  }
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  return 'request_failed';
};

/**
 * One time-off request, from `GET /v1/timeoff/{id}`.
 */
export const timeOffRequestOptions = (client: Client, timeOffId: string) =>
  queryOptions<TimeoffResponse, TimeOffRequestError>({
    queryKey: ['timeoff-request', timeOffId] as const,
    retry: false,
    queryFn: async () => {
      const response = await getV1TimeoffId({
        client,
        headers: {
          Authorization: ``,
        },
        path: { id: timeOffId },
      });

      if (response.error || !response.data) {
        const status = response.response?.status;
        throw {
          reason: getTimeOffRequestErrorReason(status),
          status,
        } satisfies TimeOffRequestError;
      }

      return response.data;
    },
  });

export const useGetTimeOffRequest = (timeOffId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    ...timeOffRequestOptions(client as Client, timeOffId ?? ''),
    enabled: Boolean(timeOffId),
    select: (data) => data.data.timeoff,
  });
};

const getTimeOffRequestsErrorReason = (
  status: number | undefined,
): TimeOffRequestsError['reason'] => {
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  if (status === 400 || status === 422) {
    return 'rejected';
  }
  return 'request_failed';
};

type TimeOffRequestsQuery = Pick<
  NonNullable<GetV1TimeoffData['query']>,
  'status' | 'page' | 'page_size'
>;

/**
 * One page of time-off requests, from `GET /v1/timeoff`.
 */
export const timeOffRequestsOptions = (
  client: Client,
  query: TimeOffRequestsQuery,
) =>
  queryOptions<ListTimeoffResponse, TimeOffRequestsError>({
    queryKey: ['timeoff-requests', query] as const,
    retry: false,
    queryFn: async () => {
      const response = await getV1Timeoff({
        client,
        headers: {
          Authorization: ``,
        },
        query,
      });

      if (response.error || !response.data) {
        const status = response.response?.status;
        throw {
          reason: getTimeOffRequestsErrorReason(status),
          status,
        } satisfies TimeOffRequestsError;
      }

      return response.data;
    },
  });

export const useGetTimeOffRequests = (query: TimeOffRequestsQuery) => {
  const { client } = useClient();
  return useQuery({
    ...timeOffRequestsOptions(client as Client, query),
    select: (data) => data.data ?? {},
  });
};

export const getTimeOffDecisionError = (
  error: unknown,
): TimeOffDecisionError => {
  if (!isMutationError(error)) {
    return {
      reason: 'request_failed',
      status: undefined,
      message: error instanceof Error ? error.message : String(error),
      fieldErrors: [],
    };
  }

  const status = error.response?.status;
  if (status === 422) {
    const { field_errors: fieldErrors = [] } = (error.rawError.error ??
      error.rawError) as Partial<TimeoffErrorResponse>;
    return {
      reason: 'rejected',
      status,
      message: error.error.message,
      fieldErrors,
    };
  }

  return {
    reason: getTimeOffRequestErrorReason(status),
    status,
    message: error.error.message,
    fieldErrors: [],
  };
};

/**
 * Approves one time-off request with `POST /v1/timeoff/{timeoff_id}/approve`, then caches the
 * request the API returns so the request under review shows its new status.
 */
export const useApproveTimeOffRequest = () => {
  const { client } = useClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      timeOffId,
      approverId,
    }: {
      timeOffId: string;
      approverId: NullableApproverId;
    }) =>
      postV1TimeoffTimeoffIdApprove({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { timeoff_id: timeOffId },
        body: { approver_id: approverId },
      }),
    onSuccess: (response, { timeOffId }) => {
      if (!response.data) {
        return;
      }
      queryClient.setQueryData(
        timeOffRequestOptions(client as Client, timeOffId).queryKey,
        response.data,
      );
    },
  });
};

/**
 * Declines one time-off request with `POST /v1/timeoff/{timeoff_id}/decline`, then caches the
 * request the API returns so the request under review shows its new status.
 */
export const useDeclineTimeOffRequest = () => {
  const { client } = useClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      timeOffId,
      declineReason,
    }: {
      timeOffId: string;
      declineReason: DeclineTimeoffParams['decline_reason'];
    }) =>
      postV1TimeoffTimeoffIdDecline({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { timeoff_id: timeOffId },
        body: { decline_reason: declineReason },
      }),
    onSuccess: (response, { timeOffId }) => {
      if (!response.data) {
        return;
      }
      queryClient.setQueryData(
        timeOffRequestOptions(client as Client, timeOffId).queryKey,
        response.data,
      );
    },
  });
};

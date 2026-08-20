import {
  getV1EmploymentsEmploymentId,
  GetV1EmploymentsEmploymentIdResponse,
  getV2EmploymentsEmploymentIdBasicInformation,
  GetV2EmploymentsEmploymentIdBasicInformationResponse,
  postV1CancelOnboardingEmploymentId,
} from '@/src/client';
import { useClient } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
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
  enabled = true,
}: {
  employmentId: string;
  queryParams?: $TSFixMe; // TODO: we need to generate openapi-ts types but it's broken at the moment
  /** Optional. Set to `false` to skip the query, e.g. when the caller's token can't reach this endpoint. */
  enabled?: boolean;
}): UseQueryResult<
  GetV1EmploymentsEmploymentIdResponse['data']['employment'],
  unknown
> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    queryFn: () => {
      return getV1EmploymentsEmploymentId({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
        query: queryParams,
      });
    },
    enabled: !!employmentId && enabled,
    select: ({ data }) => data?.data?.employment,
  });
};

/**
 * Hook to retrieve basic information for a specific employment ID from the v2 endpoint.
 *
 * This endpoint returns a subset of employment data including contract_origin,
 * which is not available in the v1 full employment endpoint.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch basic information for.
 * @param {boolean} params.enabled - Optional. Set to `false` to skip the query.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the basic information.
 */
export const useBasicInformationQuery = ({
  employmentId,
  enabled = true,
}: {
  employmentId: string;
  enabled?: boolean;
}): UseQueryResult<
  GetV2EmploymentsEmploymentIdBasicInformationResponse['data']['employment'],
  unknown
> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', employmentId, 'basic-information'],
    retry: false,
    queryFn: () => {
      return getV2EmploymentsEmploymentIdBasicInformation({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
    enabled: !!employmentId && enabled,
    select: ({ data }) => data?.data?.employment,
  });
};

/**
 * Hook to discard an employment.
 *
 * @returns {UseMutationResult<void, unknown, { employmentId: string }, unknown>} - The mutation result.
 */
export const useDiscardEmploymentMutation = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({ employmentId }: { employmentId: string }) => {
      return postV1CancelOnboardingEmploymentId({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
  });
};

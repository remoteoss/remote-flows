import { getV1EmploymentsEmploymentId } from '../client/sdk.gen';
import type { Client } from '../client/client';
import type { $TSFixMe } from '../types';

export const employmentOptions = (
  client: Client,
  employmentId: string,
  queryParams?: $TSFixMe,
) => ({
  queryKey: ['employment', employmentId] as const,
  retry: false as const,
  queryFn: () =>
    getV1EmploymentsEmploymentId({
      client,
      headers: {
        Authorization: ``,
      },
      path: { employment_id: employmentId },
      query: queryParams,
    }),
});

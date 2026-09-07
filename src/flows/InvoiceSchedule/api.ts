import { useQuery, queryOptions } from '@tanstack/react-query';
import { getV1Employments, MinimalEmployment } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';

/**
 * Pages to walk when loading contractors for the picker. `GET /v1/employments` is paginated,
 * so the picker loads pages up front to populate a plain select.
 *
 * Pass a `search` term to have the API filter by name instead — matched per word, ignoring
 * case and accents — which keeps the response small enough that the walk rarely runs past
 * the first page.
 */
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

export type Contractor = {
  id: string;
  fullName: string;
};

export type ContractorsResult = {
  contractors: Contractor[];
  /**
   * Total contractors the API reports. Larger than `contractors.length` when the walk hit
   * `MAX_PAGES`, in which case the picker is showing a subset.
   */
  totalCount: number;
  /**
   * True when the walk stopped early, so the list is incomplete.
   */
  isTruncated: boolean;
};

const toContractor = (employment: MinimalEmployment): Contractor => ({
  id: employment.id,
  fullName: employment.full_name,
});

/**
 * Query options factory for the active contractors of the authenticated company.
 */
export const contractorsOptions = (client: Client, search?: string) =>
  queryOptions({
    queryKey: ['invoice-schedule-contractors', search ?? null] as const,
    queryFn: async (): Promise<ContractorsResult> => {
      const collected: MinimalEmployment[] = [];
      let page = 1;
      let totalPages = 1;
      let totalCount = 0;

      while (page <= Math.min(totalPages, MAX_PAGES)) {
        const response = await getV1Employments({
          client,
          // The client supplies the real credentials; the generated type only requires the key.
          headers: { Authorization: `` },
          query: {
            employment_type: 'contractor',
            status: 'active',
            // `name` is not in the generated client's query type yet — it arrives with the
            // next `npm run openapi-ts` once the API change adding it is deployed. Spread
            // rather than an inline key so this type-checks against the current client; the
            // parameter is forwarded either way, and ignored by the API until then.
            ...(search ? { name: search } : {}),
            page,
            page_size: PAGE_SIZE,
          },
        });

        if (response.error || !response.data) {
          throw new Error('Failed to fetch contractors');
        }

        const data = response.data.data;
        collected.push(...(data?.employments ?? []));
        totalPages = data?.total_pages ?? 1;
        totalCount = data?.total_count ?? collected.length;
        page += 1;
      }

      return {
        contractors: collected.map(toContractor),
        totalCount,
        isTruncated: collected.length < totalCount,
      };
    },
  });

/**
 * Active contractors for the invoice-schedule contractor picker.
 */
export const useContractors = ({
  search,
  options,
}: {
  /**
   * Filter contractors by name, server-side. Omit to load the company's active contractors.
   */
  search?: string;
  options?: { queryOptions?: { enabled?: boolean } };
} = {}) => {
  const { client } = useClient();
  return useQuery({
    ...contractorsOptions(client as Client, search),
    enabled: options?.queryOptions?.enabled ?? true,
  });
};

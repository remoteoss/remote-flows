import { useQuery } from '@tanstack/react-query';
import { useClient } from '@/src/context';
import {
  getIndexCompanyPricingPlan,
  IdentityCurrentResponse,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useIdentity } from '@/src/common/api/identity';

export function hasCompany(
  identity: IdentityCurrentResponse['data'] | undefined,
): identity is Extract<
  IdentityCurrentResponse['data'],
  { company: { id: string } }
> {
  return identity != null && 'company' in identity;
}

export const useCompanyPricingPlans = (
  queryOptions: { enabled?: boolean } = { enabled: true },
) => {
  const { data: identity } = useIdentity();
  const companyId = hasCompany(identity) ? (identity?.company?.id ?? '') : '';
  const { client } = useClient();
  return useQuery({
    queryKey: ['pricing-plans', companyId],
    queryFn: () =>
      getIndexCompanyPricingPlan({
        client: client as Client,
        path: { company_id: companyId },
      }),
    select: (data) => data.data?.data?.pricing_plans,
    enabled: Boolean(queryOptions?.enabled) && !!companyId,
  });
};

import { useQuery } from '@tanstack/react-query';
import {
  getV1CompaniesCompanyIdLegalEntities,
  getV1EmploymentsEmploymentIdOnboardingSteps,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';

export const useGPOnboardingSteps = (employmentId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['gp-onboarding-steps', employmentId],
    enabled: !!employmentId,
    retry: false,
    queryFn: async () => {
      const response = await getV1EmploymentsEmploymentIdOnboardingSteps({
        client: client as Client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId as string },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch onboarding steps');
      }

      return response.data;
    },
    select: (data) => data.data.steps,
  });
};

export const useGPLegalEntities = (companyId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['gp-legal-entities', companyId],
    enabled: !!companyId,
    retry: false,
    queryFn: async () => {
      const response = await getV1CompaniesCompanyIdLegalEntities({
        client: client as Client,
        headers: { Authorization: `` },
        path: { company_id: companyId as string },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch legal entities');
      }

      return response.data;
    },
    select: (data) =>
      (data.data?.legal_entities ?? []).filter(
        (le) => le.global_payroll_enabled,
      ),
  });
};

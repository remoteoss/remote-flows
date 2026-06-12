import { useMutation, useQuery } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeForm,
  putV1EmployeeFederalTaxes,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import type { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export const useGPFederalTaxesSchema = (
  countryCode: string | undefined,
  fieldValues: FieldValues,
  queryOptions?: { enabled?: boolean },
): ReturnType<typeof useQuery<JSONSchemaFormResultWithFieldsets>> => {
  const { client } = useClient();
  return useQuery({
    queryKey: [
      'gp-employee-form-schema',
      countryCode,
      'global_payroll_federal_taxes',
    ],
    enabled: !!countryCode && (queryOptions?.enabled ?? true),
    retry: false,
    queryFn: async () => {
      const response = await getV1CountriesCountryCodeForm({
        client: client as Client,
        headers: { Authorization: `` },
        path: {
          country_code: countryCode as string,
          form: 'global_payroll_federal_taxes',
        },
      });
      if (response.error || !response.data) {
        throw new Error('Failed to fetch global_payroll_federal_taxes schema');
      }
      return response;
    },
    select: ({ data }) =>
      createHeadlessForm(
        (data?.data as Record<string, unknown>) || {},
        fieldValues,
      ),
  });
};

export const useGPUpdateFederalTaxes = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (federalTaxes: Record<string, unknown>) =>
      putV1EmployeeFederalTaxes({
        client: client as Client,
        headers: { Authorization: `` },
        body: { federal_taxes: federalTaxes },
      }),
  });
};

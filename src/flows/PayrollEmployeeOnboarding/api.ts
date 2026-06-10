import { useMutation, useQuery } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeForm,
  putV1EmployeeAddress,
  putV1EmployeeBankAccount,
  putV1EmployeePersonalDetails,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import type { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export type GPEmployeeSchemaType =
  | 'global_payroll_personal_details'
  | 'address_details'
  | 'global_payroll_bank_account_details';

export const useGPEmployeeFormSchema = (
  countryCode: string | undefined,
  schemaType: GPEmployeeSchemaType,
  fieldValues: FieldValues,
  queryOptions?: { enabled?: boolean },
): ReturnType<typeof useQuery<JSONSchemaFormResultWithFieldsets>> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['gp-employee-form-schema', countryCode, schemaType],
    enabled: !!countryCode && (queryOptions?.enabled ?? true),
    retry: false,
    queryFn: async () => {
      const response = await getV1CountriesCountryCodeForm({
        client: client as Client,
        headers: { Authorization: `` },
        path: {
          country_code: countryCode as string,
          form: schemaType,
        },
      });
      if (response.error || !response.data) {
        throw new Error(`Failed to fetch ${schemaType} schema`);
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

export const useGPUpdatePersonalDetails = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (personalDetails: Record<string, unknown>) =>
      putV1EmployeePersonalDetails({
        client: client as Client,
        headers: { Authorization: `` },
        body: { personal_details: personalDetails },
      }),
  });
};

export const useGPUpdateHomeAddress = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (addressDetails: Record<string, unknown>) =>
      putV1EmployeeAddress({
        client: client as Client,
        headers: { Authorization: `` },
        body: { address_details: addressDetails },
      }),
  });
};

export const useGPUpdateBankAccount = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (bankAccountDetails: Record<string, unknown>) =>
      putV1EmployeeBankAccount({
        client: client as Client,
        headers: { Authorization: `` },
        body: { bank_account_details: bankAccountDetails },
      }),
  });
};

import { useMutation, useQuery } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeForm,
  putV1EmployeeAddress,
  putV1EmployeeBankAccount,
  putV1EmployeeFederalTaxes,
  putV1EmployeePersonalDetails,
  putV1EmployeeStateTaxesJurisdiction,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import type {
  JSONSchemaFormResultWithFieldsets,
  JSFModify,
} from '@/src/flows/types';

export type GPEmployeeSchemaType =
  | 'global_payroll_personal_details'
  | 'address_details'
  | 'global_payroll_bank_account_details'
  | 'global_payroll_federal_taxes'
  | 'global_payroll_state_taxes';

export const useGPEmployeeFormSchema = (
  countryCode: string | undefined,
  schemaType: GPEmployeeSchemaType,
  fieldValues: FieldValues,
  queryOptions?: {
    enabled?: boolean;
    employmentId?: string;
    jurisdiction?: string;
  },
  jsfModify?: JSFModify,
): ReturnType<typeof useQuery<JSONSchemaFormResultWithFieldsets>> => {
  const { client } = useClient();
  const employmentId = queryOptions?.employmentId;
  const jurisdiction = queryOptions?.jurisdiction;
  return useQuery({
    queryKey: [
      'gp-employee-form-schema',
      countryCode,
      schemaType,
      employmentId,
      jurisdiction,
    ],
    enabled: !!countryCode && (queryOptions?.enabled ?? true),
    retry: false,
    queryFn: async () => {
      // `employment_id` and `jurisdiction` are required by the gateway for the
      // `global_payroll_state_taxes` form (employment_id also for other forms
      // whose `restrict_fields` branches on user_role). Only send what we have.
      const query = {
        ...(employmentId ? { employment_id: employmentId } : {}),
        ...(jurisdiction ? { jurisdiction } : {}),
      };
      const response = await getV1CountriesCountryCodeForm({
        client: client as Client,
        headers: { Authorization: `` },
        path: {
          country_code: countryCode as string,
          form: schemaType,
        },
        ...(Object.keys(query).length > 0 ? { query } : {}),
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
        jsfModify ? { jsfModify } : undefined,
      ),
  });
};

export const useGPUpdatePersonalDetails = (employmentId: string) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (personalDetails: Record<string, unknown>) => {
      // 'name' is a computed read-only display field in the schema (additionalProperties: false
      // on the PUT endpoint rejects it). Strip it before sending.
      const { name: _name, ...payload } = personalDetails;
      return putV1EmployeePersonalDetails({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        body: { personal_details: payload },
      });
    },
  });
};

export const useGPUpdateHomeAddress = (employmentId: string) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (addressDetails: Record<string, unknown>) =>
      putV1EmployeeAddress({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        body: { address_details: addressDetails },
      }),
  });
};

export const useGPUpdateBankAccount = (employmentId: string) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (bankAccountDetails: Record<string, unknown>) =>
      putV1EmployeeBankAccount({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        body: { bank_account_details: bankAccountDetails },
      }),
  });
};

export const useGPUpdateFederalTaxes = (employmentId: string) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (federalTaxes: Record<string, unknown>) =>
      putV1EmployeeFederalTaxes({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        body: { federal_taxes: federalTaxes },
      }),
  });
};

export const useGPUpdateStateTaxes = (
  jurisdiction: string | undefined,
  employmentId: string,
) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (stateTaxes: Record<string, unknown>) => {
      if (!jurisdiction) {
        throw new Error(
          'A `jurisdiction` (US state code) is required to submit state taxes.',
        );
      }
      return putV1EmployeeStateTaxesJurisdiction({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        path: { jurisdiction },
        body: { state_taxes: stateTaxes },
      });
    },
  });
};

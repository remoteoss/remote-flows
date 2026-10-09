import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeForm,
  getV1EmployeeAddress,
  getV1EmployeeBankAccount,
  getV1EmployeePersonalDetails,
  putV1EmployeeAddress,
  putV1EmployeeBankAccount,
  putV1EmployeeFederalTaxes,
  putV1EmployeePersonalDetails,
  putV1EmployeeStateTaxesJurisdiction,
} from '@/src/client';
import type { EmploymentDetailsOnlyResponse } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
// oxlint-disable-next-line no-restricted-imports -- TODO: move onto useHeadlessForm, see docs/USE_HEADLESS_FORM_ROLLOUT.md
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

type SavedValuesStep = 'personal_details' | 'home_address' | 'bank_account';

const gpEmployeeSavedValuesKey = (
  step: SavedValuesStep,
  employmentId: string,
) => ['gp-employee-saved-values', step, employmentId];

// The PUT responds with the same shape as the GET, so caching it keeps a
// remounted step from starting at the pre-save read without re-fetching or
// flipping the current step back to loading while the save advances it.
const useCacheSavedValues = (step: SavedValuesStep, employmentId: string) => {
  const queryClient = useQueryClient();
  return (response: { data?: EmploymentDetailsOnlyResponse }) => {
    if (!response.data) {
      return;
    }
    queryClient.setQueryData(
      gpEmployeeSavedValuesKey(step, employmentId),
      response.data,
    );
  };
};

export const useGPUpdatePersonalDetails = (employmentId: string) => {
  const { client } = useClient();
  const cacheSavedValues = useCacheSavedValues(
    'personal_details',
    employmentId,
  );
  return useMutation({
    onSuccess: cacheSavedValues,
    mutationFn: (personalDetails: Record<string, unknown>) =>
      putV1EmployeePersonalDetails({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
        body: { personal_details: personalDetails },
      }),
  });
};

export const useGPUpdateHomeAddress = (employmentId: string) => {
  const { client } = useClient();
  const cacheSavedValues = useCacheSavedValues('home_address', employmentId);
  return useMutation({
    onSuccess: cacheSavedValues,
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
  const cacheSavedValues = useCacheSavedValues('bank_account', employmentId);
  return useMutation({
    onSuccess: cacheSavedValues,
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

type SavedValues = Record<string, unknown>;

type SavedEmployment = NonNullable<
  EmploymentDetailsOnlyResponse['data']['employment']
>;

const pickDefaultBankAccount = (
  bankAccounts: SavedEmployment['bank_account_details'],
): SavedValues | undefined => {
  const account =
    bankAccounts?.find((entry) => entry.is_default === true) ??
    bankAccounts?.[0];
  if (!account) {
    return undefined;
  }
  const { is_default: _isDefault, ...values } = account;
  return values;
};

const useGPEmployeeSavedValues = (
  step: SavedValuesStep,
  employmentId: string,
  enabled: boolean,
  fetchSaved: (options: {
    client: Client;
    headers: Record<string, string>;
  }) => Promise<{ data?: EmploymentDetailsOnlyResponse; error?: unknown }>,
  pickValues: (employment: SavedEmployment) => SavedValues | null | undefined,
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: gpEmployeeSavedValuesKey(step, employmentId),
    enabled: !!employmentId && enabled,
    retry: false,
    queryFn: async () => {
      const response = await fetchSaved({
        client: client as Client,
        headers: { Authorization: ``, 'x-rf-employment-id': employmentId },
      });
      if (response.error || !response.data) {
        throw new Error(`Failed to fetch saved ${step}`);
      }
      return response.data;
    },
    select: ({ data }) =>
      data.employment ? (pickValues(data.employment) ?? undefined) : undefined,
  });
};

export const useGPEmployeePersonalDetails = (
  employmentId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useGPEmployeeSavedValues(
    'personal_details',
    employmentId,
    enabled,
    getV1EmployeePersonalDetails,
    (employment) => employment.personal_details,
  );

export const useGPEmployeeHomeAddress = (
  employmentId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useGPEmployeeSavedValues(
    'home_address',
    employmentId,
    enabled,
    getV1EmployeeAddress,
    (employment) => employment.address_details,
  );

export const useGPEmployeeBankAccount = (
  employmentId: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useGPEmployeeSavedValues(
    'bank_account',
    employmentId,
    enabled,
    getV1EmployeeBankAccount,
    (employment) => pickDefaultBankAccount(employment.bank_account_details),
  );

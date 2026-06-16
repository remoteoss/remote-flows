import { useMutation, useQuery } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeForm,
  postV1Employments,
  postV1EmploymentsEmploymentIdInvite,
  putV2EmploymentsEmploymentIdAdministrativeDetails,
  putV2EmploymentsEmploymentIdContractDetails,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export type GPAdminSchemaType =
  | 'global_payroll_basic_information'
  | 'global_payroll_contract_details'
  | 'global_payroll_administrative_details';

export const useGPFormSchema = (
  countryCode: string | undefined,
  schemaType: GPAdminSchemaType,
  fieldValues: FieldValues,
  queryOptions?: { enabled?: boolean; employmentId?: string },
): ReturnType<typeof useQuery<JSONSchemaFormResultWithFieldsets>> => {
  const { client } = useClient();
  const employmentId = queryOptions?.employmentId;
  return useQuery({
    queryKey: ['gp-form-schema', countryCode, schemaType, employmentId],
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
        // Passing employment_id lets the gateway resolve the company/employment
        // context (and therefore the schema-engine user_role) for forms whose
        // `restrict_fields` component branches on role — contract_details and
        // administrative_details are the common cases. The OpenAPI spec marks
        // this as required only for `contract_amendment` and
        // `global_payroll_state_taxes`, but the gateway uses it more broadly.
        ...(employmentId ? { query: { employment_id: employmentId } } : {}),
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

export const useGPCreateEmployment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      countryCode,
      legalEntityId,
      basicInformation,
      externalId,
    }: {
      countryCode: string;
      legalEntityId: string;
      basicInformation: Record<string, unknown>;
      externalId?: string;
    }) =>
      postV1Employments({
        client: client as Client,
        headers: { Authorization: `` },
        body: {
          type: 'global_payroll_employee',
          country_code: countryCode,
          engaged_by_entity_slug: legalEntityId,
          basic_information: basicInformation,
          external_id: externalId,
        },
      }),
  });
};

export const useGPUpdateContractDetails = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      contractDetails,
    }: {
      employmentId: string;
      contractDetails: Record<string, unknown>;
    }) =>
      putV2EmploymentsEmploymentIdContractDetails({
        client: client as Client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
        body: { contract_details: contractDetails },
      }),
  });
};

export const useGPUpdateAdministrativeDetails = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      administrativeDetails,
    }: {
      employmentId: string;
      administrativeDetails: Record<string, unknown>;
    }) =>
      putV2EmploymentsEmploymentIdAdministrativeDetails({
        client: client as Client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
        body: { administrative_details: administrativeDetails },
      }),
  });
};

export const useGPInviteEmployee = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({ employmentId }: { employmentId: string }) =>
      postV1EmploymentsEmploymentIdInvite({
        client: client as Client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
      }),
  });
};

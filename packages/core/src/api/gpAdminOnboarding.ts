import {
  getV1CompaniesCompanyIdLegalEntities,
  getV1CountriesCountryCodeForm,
  postV1Employments,
  postV1EmploymentsEmploymentIdInvite,
  putV2EmploymentsEmploymentIdAdministrativeDetails,
  putV2EmploymentsEmploymentIdContractDetails,
} from '../client/sdk.gen';
import type { Client } from '../client/client';

export type GPAdminForm =
  | 'global_payroll_basic_information'
  | 'global_payroll_contract_details'
  | 'global_payroll_administrative_details';

type Values = Record<string, unknown>;

class GPRequestError extends Error {
  constructor(
    readonly status: number | undefined,
    readonly body: unknown,
  ) {
    super(describeError(status, body));
  }
}

function describeError(status: number | undefined, body: unknown) {
  const message =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message: unknown }).message)
      : null;
  const errors =
    body && typeof body === 'object' && 'errors' in body
      ? JSON.stringify((body as { errors: unknown }).errors)
      : null;
  return [`Request failed with status ${status ?? 'unknown'}`, message, errors]
    .filter(Boolean)
    .join(': ');
}

async function orThrow<T extends { error?: unknown; response?: Response }>(
  request: Promise<T>,
) {
  const result = await request;
  if (result.error) {
    throw new GPRequestError(result.response?.status, result.error);
  }
  return result;
}

export const gpLegalEntitiesOptions = (client: Client, companyId: string) => ({
  queryKey: ['gp-legal-entities', companyId] as const,
  retry: false as const,
  queryFn: () =>
    orThrow(
      getV1CompaniesCompanyIdLegalEntities({
        client,
        headers: { Authorization: `` },
        path: { company_id: companyId },
      }),
    ),
});

type LegalEntitiesResponse = Awaited<
  ReturnType<ReturnType<typeof gpLegalEntitiesOptions>['queryFn']>
>;

export const selectGPLegalEntities = (response: LegalEntitiesResponse) =>
  (response.data?.data?.legal_entities ?? []).filter(
    (legalEntity) => legalEntity.global_payroll_enabled,
  );

export const gpFormSchemaOptions = (
  client: Client,
  countryCode: string,
  form: GPAdminForm,
  employmentId?: string,
) => ({
  queryKey: ['gp-form-schema', countryCode, form, employmentId] as const,
  retry: false as const,
  queryFn: () =>
    orThrow(
      getV1CountriesCountryCodeForm({
        client,
        headers: { Authorization: `` },
        path: { country_code: countryCode, form },
        // contract details answers 400 without an employment, so pass it whenever there is one.
        ...(employmentId ? { query: { employment_id: employmentId } } : {}),
      }),
    ),
});

type FormSchemaResponse = Awaited<
  ReturnType<ReturnType<typeof gpFormSchemaOptions>['queryFn']>
>;

export const selectGPFormSchema = (response: FormSchemaResponse) =>
  ((response.data as { data?: Values } | undefined)?.data ?? {}) as Values;

export const createGPEmploymentMutation = (client: Client) => ({
  mutationFn: async ({
    countryCode,
    legalEntityId,
    basicInformation,
  }: {
    countryCode: string;
    legalEntityId: string;
    basicInformation: Values;
  }) => {
    const response = await orThrow(
      postV1Employments({
        client,
        headers: { Authorization: `` },
        body: {
          type: 'global_payroll_employee',
          country_code: countryCode,
          // oxlint-disable-next-line typescript/no-deprecated
          engaged_by_entity_slug: legalEntityId,
          basic_information: basicInformation,
        },
      }),
    );
    const employmentId = (
      response.data as { data?: { employment?: { id?: string } } } | undefined
    )?.data?.employment?.id;
    if (!employmentId) {
      throw new Error('The employment was created but no id came back.');
    }
    return employmentId;
  },
});

export const updateGPContractDetailsMutation = (client: Client) => ({
  mutationFn: ({
    employmentId,
    contractDetails,
  }: {
    employmentId: string;
    contractDetails: Values;
  }) =>
    orThrow(
      putV2EmploymentsEmploymentIdContractDetails({
        client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
        body: { contract_details: contractDetails },
      }),
    ),
});

export const updateGPAdministrativeDetailsMutation = (client: Client) => ({
  mutationFn: ({
    employmentId,
    administrativeDetails,
  }: {
    employmentId: string;
    administrativeDetails: Values;
  }) =>
    orThrow(
      putV2EmploymentsEmploymentIdAdministrativeDetails({
        client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
        body: { administrative_details: administrativeDetails },
      }),
    ),
});

export const inviteGPEmployeeMutation = (client: Client) => ({
  mutationFn: ({ employmentId }: { employmentId: string }) =>
    orThrow(
      postV1EmploymentsEmploymentIdInvite({
        client,
        headers: { Authorization: `` },
        path: { employment_id: employmentId },
      }),
    ),
});

import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit';
import {
  fetchSandboxAuthHeaders,
  getSandboxGatewayUrl,
} from '@/scripts/verify-contract-details-version/auth';
import { fillVisibleFields } from '@/scripts/verify-contract-details-version/fill';
import { $TSFixMe } from '@/src/types/remoteFlows';

type ApiOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

async function sandboxApi(
  method: string,
  urlPath: string,
  options: ApiOptions = {},
) {
  const url = new URL(getSandboxGatewayUrl() + urlPath);
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(await fetchSandboxAuthHeaders(method, urlPath)),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new Error(`${method} ${urlPath} -> ${response.status}: ${text}`);
  }

  return json;
}

async function fetchCountrySchema(
  countryCode: string,
  form: string,
  jsonSchemaVersion?: number,
) {
  const response = await sandboxApi(
    'GET',
    `/v1/countries/${countryCode}/${form}`,
    {
      query: {
        skip_benefits: true,
        ...(jsonSchemaVersion
          ? { json_schema_version: jsonSchemaVersion }
          : {}),
      },
    },
  );
  return response.data;
}

function fillSchema(schema: unknown, seedValues: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = { ...seedValues };
  const skipped: string[] = [];

  for (let round = 0; round < 8; round++) {
    const { fields } = createHeadlessForm(schema as $TSFixMe, {
      initialValues: values as $TSFixMe,
    });
    const changed = fillVisibleFields(
      fields as $TSFixMe,
      values,
      'required',
      skipped,
    );
    if (!changed) break;
  }

  return { values, skipped };
}

export type SeedResult = {
  employmentId: string;
};

export async function seedEmploymentUpToContractDetails(
  countryCode: string,
  { basicInfoVersion = 4 }: { basicInfoVersion?: number } = {},
): Promise<SeedResult> {
  const basicInfoSchema = await fetchCountrySchema(
    countryCode,
    'employment_basic_information',
    basicInfoVersion,
  );
  const { values: basicInformation } = fillSchema(basicInfoSchema);

  const created = await sandboxApi('POST', '/v1/employments', {
    query: { json_schema_version: basicInfoVersion },
    body: {
      basic_information: basicInformation,
      type: 'employee',
      country_code: countryCode,
    },
  });

  const employmentId = created?.data?.employment?.id;
  if (!employmentId) {
    throw new Error(
      `Could not find employment id in response: ${JSON.stringify(created)}`,
    );
  }

  await sandboxApi(
    'POST',
    `/v1/employments/${employmentId}/contract-eligibility`,
    {
      body: {
        eligible_to_work_in_residing_country: 'citizen',
        employer_or_work_restrictions: false,
      },
    },
  );

  let engagementSchema: $TSFixMe;
  try {
    engagementSchema = await fetchCountrySchema(
      countryCode,
      'engagement_agreement_details',
    );
  } catch (error) {
    const isNotFound =
      error instanceof Error && error.message.includes('-> 404');
    if (!isNotFound) throw error;
  }

  if (
    engagementSchema &&
    Object.keys(engagementSchema.properties || {}).length > 0
  ) {
    const { values: engagementDetails } = fillSchema(engagementSchema);
    await sandboxApi(
      'POST',
      `/v2/employments/${employmentId}/engagement-agreement-details`,
      { body: { engagement_agreement_details: engagementDetails } },
    );
  }

  return { employmentId };
}

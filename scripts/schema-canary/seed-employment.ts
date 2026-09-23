import {
  getV1CountriesCountryCodeForm,
  getV1CountriesCountryCodeHolidaysYear,
  postV1Employments,
  postV1EmploymentsEmploymentIdContractEligibility,
  postV2EmploymentsEmploymentIdEngagementAgreementDetails,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { fillSchema, pickSafeDate, safeStartDateYears } from '../fill-schema';

const BASIC_INFO_VERSION = 4;

/** Fetches public holidays directly from the sandbox gateway and picks a
 * holiday-free provisional_start_date - see pickSafeDate in fill-schema.ts
 * for why a fixed offset alone isn't enough. Falls back to the unchecked
 * minimum-lead date if the holidays lookup itself fails, rather than
 * blocking seeding on it. */
async function findSafeStartDate(
  client: Client,
  country: string,
): Promise<string> {
  const holidayDates = new Set<string>();
  try {
    for (const year of safeStartDateYears()) {
      const response = await getV1CountriesCountryCodeHolidaysYear({
        client,
        headers: { Authorization: '' },
        path: { country_code: country, year },
      });
      if (response.error) {
        throw new Error(JSON.stringify(response.error));
      }
      for (const holiday of response.data?.data ?? []) {
        holidayDates.add(holiday.day);
        if (holiday.observed_day) holidayDates.add(holiday.observed_day);
      }
    }
  } catch {
    return pickSafeDate(new Set());
  }
  return pickSafeDate(holidayDates);
}

async function fetchSchema(
  client: Client,
  country: string,
  form: string,
  jsonSchemaVersion?: number,
): Promise<Record<string, unknown> | null> {
  const response = await getV1CountriesCountryCodeForm({
    client,
    headers: { Authorization: '' },
    path: { country_code: country, form },
    query: {
      skip_benefits: true,
      ...(jsonSchemaVersion ? { json_schema_version: jsonSchemaVersion } : {}),
    },
  });
  if (response.error) {
    throw new Error(
      `GET /v1/countries/${country}/${form} -> ${JSON.stringify(response.error)}`,
    );
  }
  return response.data?.data ?? null;
}

/**
 * Creates a real employment for `country`, up to (but not including)
 * contract_details, purely through the sandbox gateway - mirrors
 * scripts/seed-onboarding.ts but calls the gateway directly instead of
 * going through the example app's dev-server proxy, so it can run
 * standalone in CI. Shares its field-filling logic with seed-onboarding.ts
 * via scripts/fill-schema.ts.
 */
export async function seedEmploymentForCountry(
  client: Client,
  country: string,
): Promise<string> {
  const basicInfoSchema = await fetchSchema(
    client,
    country,
    'employment_basic_information',
    BASIC_INFO_VERSION,
  );
  if (!basicInfoSchema) {
    throw new Error(`No employment_basic_information schema for ${country}`);
  }
  const startDate = await findSafeStartDate(client, country);
  const { values: basicInformation } = fillSchema(basicInfoSchema, {
    provisional_start_date: startDate,
  });

  const created = await postV1Employments({
    client,
    headers: { Authorization: '' },
    query: { json_schema_version: BASIC_INFO_VERSION },
    body: {
      basic_information: basicInformation,
      type: 'employee',
      country_code: country,
    },
  });
  if (created.error) {
    throw new Error(`POST /v1/employments -> ${JSON.stringify(created.error)}`);
  }
  const employmentId = (created.data as $TSFixMe)?.data?.employment?.id;
  if (!employmentId) {
    throw new Error(
      `Could not find employment id in response: ${JSON.stringify(created.data)}`,
    );
  }

  const eligibility = await postV1EmploymentsEmploymentIdContractEligibility({
    client,
    headers: { Authorization: '' },
    path: { employment_id: employmentId },
    body: {
      eligible_to_work_in_residing_country: 'citizen',
      employer_or_work_restrictions: false,
    },
  });
  if (eligibility.error) {
    throw new Error(
      `POST /v1/employments/${employmentId}/contract-eligibility -> ${JSON.stringify(eligibility.error)}`,
    );
  }

  let engagementSchema: Record<string, unknown> | null = null;
  try {
    engagementSchema = await fetchSchema(
      client,
      country,
      'engagement_agreement_details',
    );
  } catch {
    // No engagement_agreement_details form for this country - fine, skip.
  }

  if (
    engagementSchema &&
    Object.keys((engagementSchema.properties as Record<string, unknown>) ?? {})
      .length > 0
  ) {
    const { values: engagementDetails } = fillSchema(engagementSchema);
    const engagement =
      await postV2EmploymentsEmploymentIdEngagementAgreementDetails({
        client,
        headers: { Authorization: '' },
        path: { employment_id: employmentId },
        body: { engagement_agreement_details: engagementDetails },
      });
    if (engagement.error) {
      throw new Error(
        `POST /v2/employments/${employmentId}/engagement-agreement-details -> ${JSON.stringify(engagement.error)}`,
      );
    }
  }

  return employmentId;
}

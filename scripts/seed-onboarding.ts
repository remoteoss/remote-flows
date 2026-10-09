#!/usr/bin/env tsx
/**
 * Creates a fresh onboarding employment, up to (but not including)
 * contract_details, purely through the API - no browser involved.
 *
 * Field sets for basic_information/engagement_agreement_details vary per
 * country and schema version (see buildSteps() in src/flows/Onboarding/utils.ts),
 * so this does not hardcode field names the way
 * example/e2e/helpers/onboarding.ts's Spain-specific helpers do. Instead it:
 *
 *   1. Fetches the real JSON Schema from GET /v1/countries/{country}/{form}
 *      (the same endpoint src/flows/Onboarding/api.ts's useJSONSchemaForm /
 *      useEngagementAgreementDetailsSchema call).
 *   2. Runs it through createHeadlessForm() from
 *      @remoteoss/remote-json-schema-form-kit - the exact function the real
 *      form uses to compute which fields are `required`/`isVisible` given
 *      the values chosen so far (including all the if/then conditionals,
 *      e.g. Germany's has_seniority_date gating seniority_date).
 *   3. Loops: fill whatever's currently required+visible with a
 *      faker-generated value matched to the field's inputType, recompute,
 *      repeat until nothing new appears.
 *   4. POSTs the result to the same endpoints hooks.tsx's onboarding hook
 *      calls: POST /v1/employments, POST .../contract-eligibility, POST
 *      /v2/employments/{id}/engagement-agreement-details.
 *
 * This is a seeding/debug tool, not a correctness test - it does not assert
 * on specific values, and it makes real API calls, so keep it out of
 * example/e2e/ (Playwright's testDir / CI).
 *
 * Usage (from repo root):
 *   pnpm run seed:onboarding --country=DEU
 *   pnpm run seed:onboarding --country=ESP --basic-info-version=4
 *
 * Pass --type=contractor to instead create a contractor employment from the
 * contractor_basic_information schema and stop there, mirroring the
 * basic_information step of src/flows/ContractorOnboarding/hooks.tsx.
 * ir35 (GBR) and nationality_status (SAU/KWT/OMN/QAT/BHR) aren't in that
 * schema - ContractorOnboarding's jsfModify adds them client-side and the
 * hook writes them to the contractor contract document after creating the
 * employment - so this does the same with fixed answers that avoid the IR35
 * SDS upload and the non-national warning.
 *
 *   pnpm run seed:onboarding --country=GBR --type=contractor --env=sandbox
 *
 * By default this proxies through a locally running `example` dev server
 * (BASE_URL, `example/.env`'s VITE_REMOTE_GATEWAY decides which gateway that
 * is - easy to lose track of).
 *
 * Pass --env=<name> to instead talk to a gateway directly, with no dev server
 * required: credentials come from .env.<name> at the repo root
 * (VITE_CLIENT_ID, VITE_CLIENT_SECRET, VITE_REMOTE_GATEWAY, VITE_REFRESH_TOKEN
 * - same shape as example/.env). The file name only picks the credentials;
 * VITE_REMOTE_GATEWAY inside it picks the gateway. So .env.sandbox (local-dev
 * sandbox client) and .env.review (the deployed demo app's sandbox client)
 * both point at sandbox but create employments under different companies -
 * seed with --env=review for anything you'll open on the deployed app. Auth
 * reuses example/api/{utils,get_token,proxy}.js verbatim so there's one
 * source of truth for how tokens get minted. Optional VITE_APP_URL=<deployed
 * app URL> in that same file gets you a ready-to-click link (with
 * ?employmentId= prefilled) in the final output.
 *
 *   pnpm run seed:onboarding --country=DEU --env=sandbox
 *   pnpm run seed:onboarding --country=DEU --env=review
 */
import dotenv from 'dotenv';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY } from '../example/src/flows/Onboarding/jsonSchemaVersions';
import { fillSchema, findSafeStartDate, HolidayDate } from './fill-schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

type FormSchema = Record<string, unknown>;
type HttpMethod = 'GET' | 'POST' | 'PATCH';
type AuthHeaders = Record<string, string>;

interface ApiOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
  }
}

function parseArgs(argv: string[]): Record<string, string | true> {
  const args: Record<string, string | true> = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) args[match[1]] = match[2] ?? true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const stringArg = (key: string): string | undefined => {
  const value = args[key];
  return typeof value === 'string' ? value : undefined;
};
const COUNTRY = (stringArg('country') || 'DEU').toUpperCase();
const TYPE = stringArg('type') || 'employee';
if (TYPE !== 'employee' && TYPE !== 'contractor') {
  throw new Error(`--type must be employee or contractor (got ${TYPE}).`);
}
const BASIC_INFO_VERSION = Number(
  stringArg('basic-info-version') || (TYPE === 'contractor' ? 1 : 4),
);
if ('env' in args && stringArg('env') === undefined) {
  throw new Error(
    '--env requires a value, e.g. --env=sandbox (got a bare --env flag).',
  );
}
const ENV = stringArg('env');
const FILL_CONTRACT_DETAILS = args['contract-details'] === true;

let BASE_URL: string;
let getAuthHeaders = async (
  _method: HttpMethod,
  _urlPath: string,
): Promise<AuthHeaders> => ({});

if (ENV) {
  const envFile = path.resolve(__dirname, '..', `.env.${ENV}`);
  dotenv.config({ path: envFile });
  const { buildGatewayURL } = require('../example/api/utils.js') as {
    buildGatewayURL: () => string | undefined;
  };
  const { fetchAccessToken, fetchClientCredentialsAccessToken } =
    require('../example/api/get_token.js') as {
      fetchAccessToken: () => Promise<{ accessToken: string }>;
      fetchClientCredentialsAccessToken: () => Promise<{
        accessToken: string;
      }>;
    };
  const { getTokenType } = require('../example/api/proxy.js') as {
    getTokenType: (method: string, path: string) => string;
  };

  const gatewayURL = buildGatewayURL();
  if (!gatewayURL) {
    throw new Error(
      `Unknown --env=${ENV}, or ${envFile} is missing/doesn't set VITE_REMOTE_GATEWAY.`,
    );
  }
  BASE_URL = gatewayURL;
  console.log(`Environment: ${ENV} -> ${BASE_URL} (from ${envFile})`);

  getAuthHeaders = async (method, urlPath) => {
    const { accessToken } =
      getTokenType(method, urlPath) === 'client-credentials'
        ? await fetchClientCredentialsAccessToken()
        : await fetchAccessToken();
    return { Authorization: `Bearer ${accessToken}` };
  };
} else {
  dotenv.config({ path: path.resolve(__dirname, '..', 'example', '.env') });
  const PORT = process.env.PORT || 3001;
  BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
}

async function api<T = unknown>(
  method: HttpMethod,
  urlPath: string,
  { query, body }: ApiOptions = {},
): Promise<T> {
  const url = new URL(BASE_URL + urlPath);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders(method, urlPath)),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new ApiError(
      `${method} ${urlPath} -> ${res.status}`,
      res.status,
      json,
    );
  }
  return json as T;
}

async function fetchSchema(
  form: string,
  jsonSchemaVersion?: number,
): Promise<FormSchema> {
  return api<{ data: FormSchema }>('GET', `/v1/countries/${COUNTRY}/${form}`, {
    query: { skip_benefits: true, json_schema_version: jsonSchemaVersion },
  }).then((res) => res.data);
}

function fetchHolidays(country: string, year: string): Promise<HolidayDate[]> {
  return api<{ data?: HolidayDate[] }>(
    'GET',
    `/v1/countries/${country}/holidays/${year}`,
  ).then((res) => res.data ?? []);
}

const CONTRACTOR_NATIONALITY_COUNTRIES = ['SAU', 'KWT', 'OMN', 'QAT', 'BHR'];

function contractorContractDocumentSeed(): Record<string, string> | undefined {
  if (COUNTRY === 'GBR') return { ir_35: 'exempt' };
  if (CONTRACTOR_NATIONALITY_COUNTRIES.includes(COUNTRY)) {
    return { nationality: 'national' };
  }
  return undefined;
}

const CONTRACT_DETAILS_SEEDS: Record<string, Record<string, unknown>> = {
  CHN: { province_of_residency: 'SH' },
  JAM: { work_hours_per_week: 40 },
  ROU: { compensation_currency_code: 'RON' },
};

async function seedContractor() {
  console.log(`Fetching contractor_basic_information schema for ${COUNTRY}...`);
  const basicInfoSchema = await fetchSchema(
    'contractor_basic_information',
    BASIC_INFO_VERSION,
  );
  const startDate = await findSafeStartDate(COUNTRY, fetchHolidays);
  const { values: basicInformation, skipped } = fillSchema(basicInfoSchema, {
    provisional_start_date: startDate,
  });
  console.log(
    'basic_information payload:',
    JSON.stringify(basicInformation, null, 2),
  );
  if (skipped.length) {
    console.log('Skipped (unfillable) fields:', skipped.join(', '));
  }

  console.log('\nCreating contractor employment...');
  const created = await api<{ data?: { employment?: { id?: string } } }>(
    'POST',
    '/v1/employments',
    {
      query: { json_schema_version: BASIC_INFO_VERSION },
      body: {
        basic_information: basicInformation,
        type: 'contractor',
        country_code: COUNTRY,
      },
    },
  );
  const employmentId = created?.data?.employment?.id;
  if (!employmentId) {
    throw new Error(
      `Could not find employment id in response: ${JSON.stringify(created)}`,
    );
  }
  console.log(`Employment created: ${employmentId}`);

  const contractDocument = contractorContractDocumentSeed();
  if (contractDocument) {
    console.log(
      `\nSetting ${Object.keys(contractDocument).join(', ')} on the contract document...`,
    );
    await api(
      'POST',
      `/v1/contractors/employments/${employmentId}/contract-documents`,
      { body: { contract_document: contractDocument } },
    );
  }

  console.log(
    `\nDone. Contractor employment ${employmentId} for ${COUNTRY} has basic_information filled in.`,
  );
  const appUrl = process.env.VITE_APP_URL || (ENV ? undefined : BASE_URL);
  if (appUrl) {
    console.log(
      `\nOpen this link (Employment ID is prefilled via ?employmentId=):\n\n` +
        `  ${appUrl}/?demo=contract-onboarding&employmentId=${employmentId}\n`,
    );
  } else {
    console.log(
      `\nOpen your app's contractor onboarding demo and enter this Employment ID ` +
        `(?employmentId=${employmentId} also works as a query param).\n` +
        `Tip: set VITE_APP_URL=<your deployed app URL> in .env.${ENV} to get a ready-to-click link next time.`,
    );
  }
}

async function seedEmployee() {
  console.log(`Fetching employment_basic_information schema for ${COUNTRY}...`);
  const basicInfoSchema = await fetchSchema(
    'employment_basic_information',
    BASIC_INFO_VERSION,
  );
  const startDate = await findSafeStartDate(COUNTRY, fetchHolidays);
  const { values: basicInformation, skipped: basicSkipped } = fillSchema(
    basicInfoSchema,
    { provisional_start_date: startDate },
  );
  console.log(
    'basic_information payload:',
    JSON.stringify(basicInformation, null, 2),
  );
  if (basicSkipped.length) {
    console.log('Skipped (unfillable) fields:', basicSkipped.join(', '));
  }

  console.log('\nCreating employment...');
  const created = await api<{ data?: { employment?: { id?: string } } }>(
    'POST',
    '/v1/employments',
    {
      query: { json_schema_version: BASIC_INFO_VERSION },
      body: {
        basic_information: basicInformation,
        type: 'employee',
        country_code: COUNTRY,
      },
    },
  );
  const employmentId = created?.data?.employment?.id;
  if (!employmentId) {
    throw new Error(
      `Could not find employment id in response: ${JSON.stringify(created)}`,
    );
  }
  console.log(`Employment created: ${employmentId}`);

  console.log('\nSetting contract eligibility...');
  await api('POST', `/v1/employments/${employmentId}/contract-eligibility`, {
    body: {
      eligible_to_work_in_residing_country: 'citizen',
      employer_or_work_restrictions: false,
    },
  });

  console.log('\nChecking for an engagement_agreement_details step...');
  let engagementSchema: FormSchema | undefined;
  try {
    engagementSchema = await fetchSchema('engagement_agreement_details');
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      console.log(
        `No engagement_agreement_details schema for ${COUNTRY} - skipping.`,
      );
    } else {
      throw err;
    }
  }

  if (
    engagementSchema &&
    Object.keys((engagementSchema as { properties?: object }).properties || {})
      .length > 0
  ) {
    const { values: engagementDetails, skipped } = fillSchema(engagementSchema);
    console.log(
      'engagement_agreement_details payload:',
      JSON.stringify(engagementDetails, null, 2),
    );
    if (skipped.length)
      console.log('Skipped (unfillable) fields:', skipped.join(', '));

    await api(
      'POST',
      `/v2/employments/${employmentId}/engagement-agreement-details`,
      {
        body: { engagement_agreement_details: engagementDetails },
      },
    );
    console.log('engagement_agreement_details submitted.');
  }

  if (FILL_CONTRACT_DETAILS) {
    await submitContractDetails(employmentId);
  }

  console.log(
    `\nDone. Employment ${employmentId} for ${COUNTRY} is now ${FILL_CONTRACT_DETAILS ? 'past' : 'sitting at'} contract_details.`,
  );
  const appUrl = process.env.VITE_APP_URL || (ENV ? undefined : BASE_URL);
  if (appUrl) {
    console.log(
      `\nOpen this link (Employment ID is prefilled via ?employmentId=) - just fill in the\n` +
        `company id and click Continue through Select Country and Basic Information to land\n` +
        `on Contract Details:\n\n  ${appUrl}/?demo=onboarding-basic&employmentId=${employmentId}\n`,
    );
  } else {
    console.log(
      `\nOpen your app's onboarding demo, enter this Employment ID (?employmentId=${employmentId}\n` +
        'also works as a query param) with the usual company id, and click Continue through\n' +
        'Select Country and Basic Information to land on Contract Details.\n' +
        `Tip: set VITE_APP_URL=<your deployed app URL> in .env.${ENV} to get a ready-to-click link next time.`,
    );
  }
}

async function submitContractDetails(employmentId: string) {
  const version =
    ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY[
      COUNTRY as keyof typeof ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY
    ]?.contract_details ?? 1;
  console.log(
    `\nFetching contract_details v${version} schema for ${COUNTRY}...`,
  );
  const schema = await api<{ data: FormSchema }>(
    'GET',
    `/v1/countries/${COUNTRY}/contract_details`,
    {
      query: {
        skip_benefits: true,
        employment_id: employmentId,
        json_schema_version: version,
      },
    },
  ).then((res) => res.data);
  const { values, skipped, errors } = fillSchema(
    schema,
    CONTRACT_DETAILS_SEEDS[COUNTRY],
  );
  console.log('contract_details payload:', JSON.stringify(values, null, 2));
  if (skipped.length) {
    console.log('Skipped (unfillable) fields:', skipped.join(', '));
  }
  if (Object.keys(errors).length) {
    throw new Error(
      `Could not fill contract_details values that pass validation: ${JSON.stringify(errors)}`,
    );
  }

  await api('PATCH', `/v1/employments/${employmentId}`, {
    query: {
      skip_benefits: true,
      employment_basic_information_json_schema_version: BASIC_INFO_VERSION,
      contract_details_json_schema_version: version,
    },
    body: {
      contract_details: values,
      pricing_plan_details: { frequency: 'monthly' },
    },
  });
  console.log('contract_details submitted.');
}

function main() {
  return TYPE === 'contractor' ? seedContractor() : seedEmployee();
}

main().catch((err: unknown) => {
  console.error('\nFailed:', err instanceof Error ? err.message : err);
  if (err instanceof ApiError && err.body) {
    console.error(JSON.stringify(err.body, null, 2));
  }
  process.exit(1);
});

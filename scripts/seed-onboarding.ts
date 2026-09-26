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
 *   npm run seed:onboarding -- --country=DEU
 *   npm run seed:onboarding -- --country=ESP --basic-info-version=4
 *
 * By default this proxies through a locally running `example` dev server
 * (BASE_URL, `example/.env`'s VITE_REMOTE_GATEWAY decides which gateway that
 * is - easy to lose track of).
 *
 * Pass --env=sandbox|production|staging|partners to instead talk to that
 * gateway directly, with no dev server required: credentials come from
 * .env.<env> at the repo root (VITE_CLIENT_ID, VITE_CLIENT_SECRET,
 * VITE_REMOTE_GATEWAY=<env>, VITE_REFRESH_TOKEN - same shape as
 * example/.env), and auth reuses example/api/{utils,get_token,proxy}.js
 * verbatim so there's one source of truth for how tokens get minted. Optional
 * VITE_APP_URL=<deployed app URL> in that same file gets you a ready-to-click
 * link (with ?employmentId= prefilled) in the final output.
 *
 *   npm run seed:onboarding -- --country=DEU --env=sandbox
 */
import dotenv from 'dotenv';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillSchema, pickSafeDate, safeStartDateYears } from './fill-schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

type FormSchema = Record<string, unknown>;
type HttpMethod = 'GET' | 'POST';
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
const BASIC_INFO_VERSION = Number(stringArg('basic-info-version') || 4);
const ENV = stringArg('env');

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

/** See pickSafeDate in fill-schema.ts for why a fixed offset alone isn't
 * enough - falls back to the unchecked minimum-lead date if the holidays
 * lookup itself fails. */
async function findSafeStartDate(): Promise<string> {
  const holidayDates = new Set<string>();
  try {
    for (const year of safeStartDateYears()) {
      const holidays = await api<{
        data?: { day: string; observed_day?: string }[];
      }>('GET', `/v1/countries/${COUNTRY}/holidays/${year}`);
      for (const holiday of holidays.data ?? []) {
        holidayDates.add(holiday.day);
        if (holiday.observed_day) holidayDates.add(holiday.observed_day);
      }
    }
  } catch {
    return pickSafeDate(new Set());
  }
  return pickSafeDate(holidayDates);
}

async function main() {
  console.log(`Fetching employment_basic_information schema for ${COUNTRY}...`);
  const basicInfoSchema = await fetchSchema(
    'employment_basic_information',
    BASIC_INFO_VERSION,
  );
  const startDate = await findSafeStartDate();
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

  console.log(
    `\nDone. Employment ${employmentId} for ${COUNTRY} is now sitting at contract_details.`,
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

main().catch((err: unknown) => {
  console.error('\nFailed:', err instanceof Error ? err.message : err);
  if (err instanceof ApiError && err.body) {
    console.error(JSON.stringify(err.body, null, 2));
  }
  process.exit(1);
});

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
import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

type FormSchema = Parameters<typeof createHeadlessForm>[0];
type HeadlessFormOptions = NonNullable<
  Parameters<typeof createHeadlessForm>[1]
>;
type FormValues = Record<string, unknown>;
type HttpMethod = 'GET' | 'POST';
type AuthHeaders = Record<string, string>;

interface FieldOption {
  value: unknown;
  meta?: { countryCode?: string };
}

interface SeedField {
  name: string;
  inputType?: string;
  required?: boolean;
  isVisible?: boolean;
  multiple?: boolean;
  options?: FieldOption[];
  const?: unknown;
}

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

/** First option whose value/label reads as "no" - collapses conditional sub-fields (file
 * uploads, free-text detail boxes) that a generic filler can't produce plausible data for. */
function preferNoOption(options: FieldOption[]): FieldOption {
  return (
    options.find((o) => String(o.value).toLowerCase() === 'no') || options[0]
  );
}

function fakeValueFor(field: SeedField): unknown {
  const { inputType, options, multiple, name, const: constValue } = field;

  if (options?.length) {
    if (inputType === 'radio' || inputType === 'select') {
      return preferNoOption(options).value;
    }
    if (inputType === 'countries' || multiple) {
      return [faker.helpers.arrayElement(options).value];
    }
    if (inputType === 'tel') {
      // options here are per-country dialing patterns (e.g. pattern:
      // '^(+49)[0-9]{6,}$', meta.countryCode: '49'), not user-facing choices -
      // any one produces a validly-formatted number, regardless of the
      // employment's own country.
      const option = options.find((o) => o.meta?.countryCode) || options[0];
      return `+${option.meta?.countryCode}${faker.string.numeric(9)}`;
    }
    return preferNoOption(options).value;
  }

  switch (inputType) {
    case 'email':
      return name === 'work_email'
        ? faker.internet.email({ provider: 'remote-e2e-test.com' })
        : faker.internet.email();
    case 'tel':
      return `+1${faker.string.numeric(9)}`;
    case 'date': {
      const d = new Date();
      d.setDate(d.getDate() + 21);
      return d.toISOString().slice(0, 10);
    }
    case 'number':
      return faker.number.int({ min: 5, max: 30 });
    case 'money':
      return faker.number.int({ min: 3_000_000, max: 8_000_000 });
    case 'textarea':
      return faker.lorem.sentence();
    case 'checkbox':
      // No enumerated options: this is a single acknowledgement toggle. RHF
      // holds a plain `true` here, which parseFormValuesToAPI (src/components/
      // form/utils.ts) swaps for `field.const` (e.g. "acknowledged") at submit
      // time when the schema is const-based - mirror that instead of sending
      // the raw RHF value, or the API rejects it as a type mismatch.
      return constValue ?? true;
    case 'file':
      return null;
    default:
      return faker.lorem.words({ min: 2, max: 4 });
  }
}

/** Progressively fills a JSF schema: fill whatever's required+visible, recompute (new
 * conditionally-required fields may appear), repeat until stable. Mirrors what the real
 * multi-step form does field-by-field, but against the schema directly instead of the DOM. */
function fillSchema(
  schema: FormSchema,
  seedValues: FormValues = {},
): { values: FormValues; skipped: string[] } {
  const values: FormValues = { ...seedValues };
  const skipped: string[] = [];
  for (let round = 0; round < 8; round++) {
    const { fields } = createHeadlessForm(schema, {
      initialValues: values as HeadlessFormOptions['initialValues'],
    });
    const missing = (fields as unknown as SeedField[]).filter(
      (f) => f.required && f.isVisible && values[f.name] === undefined,
    );
    if (missing.length === 0) break;
    for (const field of missing) {
      if (field.inputType === 'file') {
        skipped.push(field.name);
        continue;
      }
      values[field.name] = fakeValueFor(field);
    }
  }
  return { values, skipped };
}

async function main() {
  console.log(`Fetching employment_basic_information schema for ${COUNTRY}...`);
  const basicInfoSchema = await fetchSchema(
    'employment_basic_information',
    BASIC_INFO_VERSION,
  );
  const { values: basicInformation, skipped: basicSkipped } =
    fillSchema(basicInfoSchema);
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

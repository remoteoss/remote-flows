#!/usr/bin/env node
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
 * Usage (from example/):
 *   npm run seed:onboarding -- --country=DEU
 *   npm run seed:onboarding -- --country=ESP --basic-info-version=4
 */
import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (match) args[match[1]] = match[2] ?? true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const COUNTRY = (args.country || 'DEU').toUpperCase();
const BASIC_INFO_VERSION = Number(args['basic-info-version'] || 4);
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

async function api(method, urlPath, { query, body } = {}) {
  const url = new URL(BASE_URL + urlPath);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${urlPath} -> ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function fetchSchema(form, jsonSchemaVersion) {
  return api('GET', `/v1/countries/${COUNTRY}/${form}`, {
    query: { skip_benefits: true, json_schema_version: jsonSchemaVersion },
  }).then((res) => res.data);
}

/** First option whose value/label reads as "no" - collapses conditional sub-fields (file
 * uploads, free-text detail boxes) that a generic filler can't produce plausible data for. */
function preferNoOption(options) {
  return options.find((o) => String(o.value).toLowerCase() === 'no') || options[0];
}

function fakeValueFor(field) {
  const { inputType, options, multiple, name } = field;

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
      return `+${option.meta.countryCode}${faker.string.numeric(9)}`;
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
      return [];
    case 'file':
      return null;
    default:
      return faker.lorem.words({ min: 2, max: 4 });
  }
}

/** Progressively fills a JSF schema: fill whatever's required+visible, recompute (new
 * conditionally-required fields may appear), repeat until stable. Mirrors what the real
 * multi-step form does field-by-field, but against the schema directly instead of the DOM. */
function fillSchema(schema, seedValues = {}) {
  let values = { ...seedValues };
  const skipped = [];
  for (let round = 0; round < 8; round++) {
    const { fields } = createHeadlessForm(schema, { initialValues: values });
    const missing = fields.filter(
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
  const basicInfoSchema = await fetchSchema('employment_basic_information', BASIC_INFO_VERSION);
  const { values: basicInformation, skipped: basicSkipped } = fillSchema(basicInfoSchema);
  console.log('basic_information payload:', JSON.stringify(basicInformation, null, 2));
  if (basicSkipped.length) {
    console.log('Skipped (unfillable) fields:', basicSkipped.join(', '));
  }

  console.log('\nCreating employment...');
  const created = await api('POST', '/v1/employments', {
    query: { json_schema_version: BASIC_INFO_VERSION },
    body: {
      basic_information: basicInformation,
      type: 'employee',
      country_code: COUNTRY,
    },
  });
  const employmentId = created?.data?.employment?.id;
  if (!employmentId) {
    throw new Error(`Could not find employment id in response: ${JSON.stringify(created)}`);
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
  let engagementSchema;
  try {
    engagementSchema = await fetchSchema('engagement_agreement_details');
  } catch (err) {
    if (err.status === 404) {
      console.log(`No engagement_agreement_details schema for ${COUNTRY} - skipping.`);
    } else {
      throw err;
    }
  }

  if (engagementSchema && Object.keys(engagementSchema.properties || {}).length > 0) {
    const { values: engagementDetails, skipped } = fillSchema(engagementSchema);
    console.log('engagement_agreement_details payload:', JSON.stringify(engagementDetails, null, 2));
    if (skipped.length) console.log('Skipped (unfillable) fields:', skipped.join(', '));

    await api('POST', `/v2/employments/${employmentId}/engagement-agreement-details`, {
      body: { engagement_agreement_details: engagementDetails },
    });
    console.log('engagement_agreement_details submitted.');
  }

  console.log(`\nDone. Employment ${employmentId} for ${COUNTRY} is now sitting at contract_details.`);
  console.log(
    `Open ${BASE_URL}/?demo=onboarding-basic , enter this Employment ID (with the usual\n` +
      'company id) on the intro form, and click Continue through Select Country and Basic\n' +
      'Information (both already prefilled from what this script created) to land on Contract Details.',
  );
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});

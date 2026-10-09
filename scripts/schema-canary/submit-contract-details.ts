import { isDeepStrictEqual } from 'node:util';
import { FieldValues } from 'react-hook-form';
import {
  getV1EmploymentsEmploymentId,
  patchV1EmploymentsEmploymentId2,
} from '@/src/client';
import { Client } from '@/src/client/client';
import {
  buildHeadlessForm,
  HeadlessFormStrategy,
  parseValuesForValidation,
  withFieldsetObjects,
} from '@/src/common/headlessForm';
import {
  checkFieldHasForcedValue,
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { fillSchema } from '../fill-schema';

export type SubmitResult =
  | { ok: true; sent: FieldValues }
  | { ok: false; error: string };

type SdkPayloadResult =
  | { ok: true; payload: FieldValues; forcedFields: string[] }
  | { ok: false; error: string };

export function seedFor(country: string): number {
  let hash = 0;
  for (const char of country) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

const MAX_REBUILD_PASSES = 5;

export async function sdkPayloadFor(
  schema: Record<string, unknown>,
  strategy: HeadlessFormStrategy,
  savedValues: FieldValues,
  skipped: string[] = [],
): Promise<SdkPayloadResult> {
  const initialForm = buildHeadlessForm(
    schema,
    strategy,
    strategy === 'buildOnce' ? savedValues : {},
  );
  let formValues = getInitialValues(initialForm.fields, savedValues);
  let form = initialForm;
  if (strategy === 'rebuild') {
    for (let pass = 0; pass < MAX_REBUILD_PASSES; pass++) {
      form = buildHeadlessForm(schema, strategy, formValues);
      const nextValues = getInitialValues(form.fields, savedValues);
      if (isDeepStrictEqual(nextValues, formValues)) break;
      formValues = nextValues;
    }
  }
  const parsed = await parseValuesForValidation(form, strategy, formValues);
  const formErrors = Object.fromEntries(
    Object.entries(
      form.handleValidation(withFieldsetObjects(parsed, form.fields))
        ?.formErrors ?? {},
    ).filter(([name]) => !skipped.includes(name)),
  );
  if (Object.keys(formErrors).length > 0) {
    return {
      ok: false,
      error: `the SDK form rejects values the schema accepts: ${JSON.stringify(formErrors)}`,
    };
  }
  return {
    ok: true,
    payload: await parseJSFToValidate(formValues, form.fields),
    forcedFields: form.fields
      .filter((field) => checkFieldHasForcedValue(field))
      .map((field) => String(field.name)),
  };
}

export function differencesFromSaved(
  sent: FieldValues,
  saved: FieldValues | null | undefined,
  ignored: string[] = [],
): string[] {
  return Object.keys(sent)
    .filter((key) => !ignored.includes(key))
    .filter((key) => !isDeepStrictEqual(sent[key], saved?.[key]))
    .map(
      (key) =>
        `${key}: sent ${JSON.stringify(sent[key])}, saved ${JSON.stringify(saved?.[key])}`,
    );
}

export async function submitContractDetails(
  client: Client,
  employmentId: string,
  schema: Record<string, unknown> | null,
  version: number | 'latest',
  {
    strategy,
    seed,
    seedValues = {},
    knownUnsavedFields = {},
  }: {
    strategy: HeadlessFormStrategy;
    seed?: number;
    seedValues?: Record<string, unknown>;
    knownUnsavedFields?: Record<string, string>;
  },
): Promise<SubmitResult> {
  if (!schema) {
    return { ok: false, error: 'no contract_details schema to fill' };
  }
  const { values, skipped, errors } = fillSchema(schema, seedValues, { seed });
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: `could not fill values that pass validation: ${JSON.stringify(errors)}`,
    };
  }
  const sdk = await sdkPayloadFor(schema, strategy, values, skipped);
  if (!sdk.ok) return sdk;

  const response = await patchV1EmploymentsEmploymentId2({
    client,
    headers: { Authorization: '' },
    path: { employment_id: employmentId },
    query: {
      skip_benefits: true,
      contract_details_json_schema_version: version,
    },
    body: {
      contract_details: sdk.payload,
      pricing_plan_details: { frequency: 'monthly' },
    },
  });
  if (response.error) {
    const skippedNote =
      skipped.length > 0
        ? ` (file fields left empty: ${skipped.join(', ')})`
        : '';
    return {
      ok: false,
      error: `PATCH /v1/employments/{id} -> ${JSON.stringify(response.error)}${skippedNote}`,
    };
  }

  const saved = await getV1EmploymentsEmploymentId({
    client,
    headers: { Authorization: '' },
    path: { employment_id: employmentId },
  });
  if (saved.error || !saved.data) {
    return {
      ok: false,
      error: `GET /v1/employments/{id} after the PATCH -> ${JSON.stringify(saved.error)}`,
    };
  }
  const savedDetails = saved.data.data.employment?.contract_details as
    | FieldValues
    | undefined;
  const knownUnsaved = Object.keys(knownUnsavedFields);
  const differences = differencesFromSaved(sdk.payload, savedDetails, [
    ...sdk.forcedFields.filter((key) => savedDetails?.[key] === undefined),
    ...knownUnsaved,
  ]);
  if (differences.length > 0) {
    return {
      ok: false,
      error: `saved contract_details differ from what was sent: ${differences.join('; ')}`,
    };
  }
  const nowSaved = knownUnsaved.filter(
    (key) =>
      key in sdk.payload &&
      isDeepStrictEqual(sdk.payload[key], savedDetails?.[key]),
  );
  if (nowSaved.length > 0) {
    return {
      ok: false,
      error: `known unsaved field(s) are saved now, remove them from KNOWN_UNSAVED_FIELDS: ${nowSaved.join(', ')}`,
    };
  }
  return { ok: true, sent: sdk.payload };
}

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
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { fillSchema } from '../fill-schema';

export type SubmitResult = { ok: true } | { ok: false; error: string };

type SdkPayloadResult =
  | { ok: true; payload: FieldValues }
  | { ok: false; error: string };

export function seedFor(country: string): number {
  let hash = 0;
  for (const char of country) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

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
  const formValues = getInitialValues(initialForm.fields, savedValues);
  const form =
    strategy === 'buildOnce'
      ? initialForm
      : buildHeadlessForm(schema, strategy, formValues);
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
  };
}

// Tiger saves these on the compensation record, and GET /v1/employments/{id} doesn't return them.
const NOT_RETURNED_AFTER_SAVE = new Set(['overtime_eligible']);

export function differencesFromSaved(
  sent: FieldValues,
  saved: FieldValues | null | undefined,
): string[] {
  return Object.keys(sent)
    .filter((key) => !NOT_RETURNED_AFTER_SAVE.has(key))
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
  version: number,
  {
    strategy,
    seed,
    seedValues = {},
  }: {
    strategy: HeadlessFormStrategy;
    seed?: number;
    seedValues?: Record<string, unknown>;
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
  const differences = differencesFromSaved(
    sdk.payload,
    saved.data.data.employment?.contract_details as FieldValues | undefined,
  );
  if (differences.length > 0) {
    return {
      ok: false,
      error: `saved contract_details differ from what was sent: ${differences.join('; ')}`,
    };
  }
  return { ok: true };
}

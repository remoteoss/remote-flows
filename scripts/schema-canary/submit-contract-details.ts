import { patchV1EmploymentsEmploymentId2 } from '@/src/client';
import { Client } from '@/src/client/client';
import { fillSchema } from '../fill-schema';

export type SubmitResult = { ok: true } | { ok: false; error: string };

export function seedFor(country: string): number {
  let hash = 0;
  for (const char of country) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

export async function submitContractDetails(
  client: Client,
  employmentId: string,
  schema: Record<string, unknown> | null,
  version: number,
  seed?: number,
): Promise<SubmitResult> {
  if (!schema) {
    return { ok: false, error: 'no contract_details schema to fill' };
  }
  const { values, skipped, errors } = fillSchema(schema, {}, { seed });
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: `could not fill values that pass validation: ${JSON.stringify(errors)}`,
    };
  }
  const response = await patchV1EmploymentsEmploymentId2({
    client,
    headers: { Authorization: '' },
    path: { employment_id: employmentId },
    query: {
      skip_benefits: true,
      contract_details_json_schema_version: version,
    },
    body: {
      contract_details: values,
      pricing_plan_details: { frequency: 'monthly' },
    },
  });
  if (!response.error) {
    return { ok: true };
  }
  const skippedNote =
    skipped.length > 0
      ? ` (file fields left empty: ${skipped.join(', ')})`
      : '';
  return {
    ok: false,
    error: `PATCH /v1/employments/{id} -> ${JSON.stringify(response.error)}${skippedNote}`,
  };
}

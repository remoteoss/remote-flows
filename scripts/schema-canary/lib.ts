import {
  buildHeadlessForm,
  HeadlessFormStrategy,
  parseValuesForValidation,
} from '@/src/common/headlessForm';
import { findSkipEntry, SchemaCanarySkipEntry } from './skip-list';

export type SchemaCheckType = 'pinned' | 'latest' | 'submit';

export const SCHEMA_CHECK_ORDER: SchemaCheckType[] = [
  'pinned',
  'latest',
  'submit',
];
export type SchemaCheckOutcome = 'pass' | 'fail' | 'seed-error' | 'skip';

export type SchemaCanaryRow = {
  country: string;
  version: number | 'latest';
  strategy: HeadlessFormStrategy;
  check: SchemaCheckType;
  outcome: SchemaCheckOutcome;
  error?: string;
};

export function firstStackFrame(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) {
    return undefined;
  }
  return error.stack.split('\n')[1]?.trim();
}

export function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const frame = firstStackFrame(error);
  return frame ? `${message} (${frame})` : message;
}

export async function checkSchemaBuildsAndValidates(
  schema: Record<string, unknown> | null,
  strategy: HeadlessFormStrategy,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const form = buildHeadlessForm(
      schema as Record<string, unknown>,
      strategy,
      {},
    );
    await form.handleValidation(
      await parseValuesForValidation(form, strategy, {}),
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await run(items[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export function isSkipped(
  skipList: SchemaCanarySkipEntry[],
  country: string,
  check: SchemaCheckType,
): SchemaCanarySkipEntry | undefined {
  return findSkipEntry(skipList, country, check);
}

export function decideExitCode(rows: SchemaCanaryRow[]): 0 | 1 {
  const hasGatingFailure = rows.some(
    (row) => row.check !== 'latest' && row.outcome === 'fail',
  );
  const hasSeedError = rows.some((row) => row.outcome === 'seed-error');
  return hasGatingFailure || hasSeedError ? 1 : 0;
}

const OUTCOME_LABEL: Record<SchemaCheckOutcome, string> = {
  pass: '✅ pass',
  fail: '❌ fail',
  'seed-error': '⚠️ seed error',
  skip: '⏭️ skip',
};

export type SchemaCanaryReport = {
  _meta: {
    title: string;
    description: string;
    source: string;
  };
  checks: SchemaCanaryRow[];
};

export function buildReport(rows: SchemaCanaryRow[]): SchemaCanaryReport {
  return {
    _meta: {
      title: 'Contract details schema canary',
      description:
        'Per-country contract_details schema checks against the sandbox gateway. "pinned" is the version this library currently ships against (see example/src/flows/Onboarding/jsonSchemaVersions.ts); "latest" is whatever version the gateway currently serves as newest. Both build the schema with the useHeadlessForm strategy the Onboarding flow uses for that country (buildOnce for jsf v1 contract details countries, rebuild otherwise), validate empty values the same way the hook does, and record whether it throws. "submit" fills the pinned schema with fake values (fixed per country, see scripts/contract-details-seeds.ts), runs them through the same SDK form build, validation and parsing the Onboarding flow uses, sends the result in the same PATCH /v1/employments/{id}, and then reads the employment back to check the saved contract_details match what was sent. "seed-error" means the sandbox employment for that country could not be created, so its schemas were not checked.',
      source:
        'scripts/schema-canary.ts, run nightly against the sandbox gateway',
    },
    checks: rows,
  };
}

export function formatSummaryTable(rows: SchemaCanaryRow[]): string {
  const header = '| Country | Version | Strategy | Check | Result | Error |';
  const divider = '| --- | --- | --- | --- | --- | --- |';
  const body = rows.map((row) => {
    const error = (row.error ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return `| ${row.country} | ${row.version} | ${row.strategy} | ${row.check} | ${OUTCOME_LABEL[row.outcome]} | ${error} |`;
  });
  return [header, divider, ...body].join('\n');
}

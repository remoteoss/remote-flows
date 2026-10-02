import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { usesJsfV1ContractDetails } from '@/src/flows/Onboarding/utils';
import { findSkipEntry, SchemaCanarySkipEntry } from './skip-list';

export type SchemaEngine = 'jsf-v0' | 'jsf-v1';
export type SchemaCheckType = 'pinned' | 'latest';
export type SchemaCheckOutcome = 'pass' | 'fail' | 'skip';

export type SchemaCanaryRow = {
  country: string;
  version: number | 'latest';
  engine: SchemaEngine;
  check: SchemaCheckType;
  outcome: SchemaCheckOutcome;
  error?: string;
};

export function resolveEngine(countryCode: string): SchemaEngine {
  return usesJsfV1ContractDetails(countryCode) ? 'jsf-v1' : 'jsf-v0';
}

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
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const form = createHeadlessForm(schema as Record<string, unknown>, {});
    await form.handleValidation({});
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

export function isSkipped(
  skipList: SchemaCanarySkipEntry[],
  country: string,
  check: SchemaCheckType,
): SchemaCanarySkipEntry | undefined {
  return findSkipEntry(skipList, country, check);
}

export function decideExitCode(rows: SchemaCanaryRow[]): 0 | 1 {
  const hasPinnedFailure = rows.some(
    (row) => row.check === 'pinned' && row.outcome === 'fail',
  );
  return hasPinnedFailure ? 1 : 0;
}

const OUTCOME_LABEL: Record<SchemaCheckOutcome, string> = {
  pass: '✅ pass',
  fail: '❌ fail',
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
        'Per-country contract_details schema checks against the sandbox gateway. "pinned" is the version this library currently ships against (see example/src/flows/Onboarding/jsonSchemaVersions.ts); "latest" is whatever version the gateway currently serves as newest. Both run createHeadlessForm(schema, {}) + handleValidation({}) and record whether it throws.',
      source:
        'scripts/schema-canary.ts, run nightly against the sandbox gateway',
    },
    checks: rows,
  };
}

export function formatSummaryTable(rows: SchemaCanaryRow[]): string {
  const header = '| Country | Version | Engine | Check | Result | Error |';
  const divider = '| --- | --- | --- | --- | --- | --- |';
  const body = rows.map((row) => {
    const error = (row.error ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return `| ${row.country} | ${row.version} | ${row.engine} | ${row.check} | ${OUTCOME_LABEL[row.outcome]} | ${error} |`;
  });
  return [header, divider, ...body].join('\n');
}

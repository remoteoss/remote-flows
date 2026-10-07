import {
  buildHeadlessForm,
  HeadlessFormStrategy,
  parseValuesForValidation,
} from '@/src/common/headlessForm';
import { usesJsfV1ContractDetails } from '@/src/flows/Onboarding/utils';
import { findSkipEntry, SchemaCanarySkipEntry } from './skip-list';

export type SchemaCheckType = 'pinned' | 'latest';
export type SchemaCheckOutcome = 'pass' | 'fail' | 'seed-error' | 'skip';

export type SchemaCanaryRow = {
  country: string;
  version: number | 'latest';
  strategy: HeadlessFormStrategy;
  check: SchemaCheckType;
  outcome: SchemaCheckOutcome;
  error?: string;
};

export function resolveStrategy(countryCode: string): HeadlessFormStrategy {
  return usesJsfV1ContractDetails(countryCode) ? 'buildOnce' : 'rebuild';
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
  const hasSeedError = rows.some((row) => row.outcome === 'seed-error');
  return hasPinnedFailure || hasSeedError ? 1 : 0;
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
        'Per-country contract_details schema checks against the sandbox gateway. "pinned" is the version this library currently ships against (see example/src/flows/Onboarding/jsonSchemaVersions.ts); "latest" is whatever version the gateway currently serves as newest. Both build the schema with the useHeadlessForm strategy the Onboarding flow uses for that country (buildOnce for jsf v1 contract details countries, rebuild otherwise), validate empty values the same way the hook does, and record whether it throws. "seed-error" means the sandbox employment for that country could not be created, so its schemas were not checked.',
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

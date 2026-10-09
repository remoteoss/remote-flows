import {
  buildHeadlessForm,
  HeadlessFormStrategy,
  parseValuesForValidation,
} from '@/src/common/headlessForm';
import { findSkipEntry, SchemaCanarySkipEntry } from './skip-list';

export type SchemaCheckType = 'build' | 'submit';

export const SCHEMA_CHECK_ORDER: SchemaCheckType[] = ['build', 'submit'];

export type SchemaCanaryCheck = SchemaCheckType | 'browser';

export type SchemaVersionTrack = 'pinned' | 'latest';

export const SCHEMA_VERSION_TRACKS: SchemaVersionTrack[] = ['pinned', 'latest'];

export type SchemaCheckOutcome = 'pass' | 'fail' | 'seed-error' | 'skip';

export type SchemaCanaryRow = {
  country: string;
  version: number | 'latest';
  strategy: HeadlessFormStrategy;
  check: SchemaCanaryCheck;
  outcome: SchemaCheckOutcome;
  error?: string;
};

export function trackOf(version: number | 'latest'): SchemaVersionTrack {
  return version === 'latest' ? 'latest' : 'pinned';
}

function isProblem(row: SchemaCanaryRow) {
  return row.outcome === 'fail' || row.outcome === 'seed-error';
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
  track: SchemaVersionTrack,
): SchemaCanarySkipEntry | undefined {
  return findSkipEntry(skipList, country, check, track);
}

export function decideExitCode(rows: SchemaCanaryRow[]): 0 | 1 {
  return rows.some((row) => trackOf(row.version) === 'pinned' && isProblem(row))
    ? 1
    : 0;
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

const CHECK_RANK: Record<SchemaCanaryCheck, number> = {
  build: 0,
  submit: 1,
  browser: 2,
};

function compareRows(a: SchemaCanaryRow, b: SchemaCanaryRow) {
  return (
    a.country.localeCompare(b.country) ||
    SCHEMA_VERSION_TRACKS.indexOf(trackOf(a.version)) -
      SCHEMA_VERSION_TRACKS.indexOf(trackOf(b.version)) ||
    CHECK_RANK[a.check] - CHECK_RANK[b.check]
  );
}

export function buildReport(rows: SchemaCanaryRow[]): SchemaCanaryReport {
  return {
    _meta: {
      title: 'Contract details schema canary',
      description:
        'Per-country contract_details checks against the sandbox gateway, run once on the "pinned" version this library currently ships against (see example/src/flows/Onboarding/jsonSchemaVersions.ts) and once on "latest", whatever version the gateway currently serves as newest. Each version gets its own sandbox employment. "build" builds the schema with the useHeadlessForm strategy the Onboarding flow uses for that country (buildOnce for jsf v1 contract details countries, rebuild otherwise), validates empty values the same way the hook does, and records whether it throws. "submit" fills the schema with fake values (fixed per country, see scripts/contract-details-seeds.ts), runs them through the same SDK form build, validation and parsing the Onboarding flow uses, sends the result in the same PATCH /v1/employments/{id}, and then reads the employment back to check the saved contract_details match what was sent. "browser" opens that employment in the example app, presses Continue on contract details, and checks the browser sends the same contract_details. "seed-error" means the sandbox employment could not be created, so its checks did not run. Only pinned problems fail the nightly job; latest problems open their own issue.',
      source:
        'scripts/schema-canary.ts, run nightly against the sandbox gateway',
    },
    checks: [...rows].sort(compareRows),
  };
}

export function formatFailures(
  rows: SchemaCanaryRow[],
  track: SchemaVersionTrack,
): string {
  const failing = rows.filter(
    (row) => trackOf(row.version) === track && isProblem(row),
  );
  return failing.length > 0 ? formatSummaryTable(failing) : '';
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

export const SCHEMA_CANARY_GUIDE_URL =
  'https://github.com/remoteoss/remote-flows/blob/main/docs/SCHEMA_CANARY.md';

const FAILURE_HEADINGS: Record<SchemaVersionTrack, string> = {
  pinned: 'Pinned failures (these fail the check)',
  latest: 'Latest failures (warning only)',
};

export function formatStepSummary(
  heading: string,
  rows: SchemaCanaryRow[],
): string {
  const failureSections = SCHEMA_VERSION_TRACKS.flatMap((track) => {
    const failures = formatFailures(rows, track);
    return failures ? [`### ${FAILURE_HEADINGS[track]}`, failures] : [];
  });
  return [
    `## ${heading}`,
    ...(failureSections.length > 0
      ? [
          ...failureSections,
          `What each failure means and what to do: [schema canary guide](${SCHEMA_CANARY_GUIDE_URL})`,
        ]
      : ['No failures.']),
    `<details><summary>All ${rows.length} checks</summary>\n\n${formatSummaryTable([...rows].sort(compareRows))}\n\n</details>`,
  ].join('\n\n');
}

function escapeAnnotation(text: string) {
  return text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

export function formatAnnotations(rows: SchemaCanaryRow[]): string[] {
  return rows.filter(isProblem).map((row) => {
    const level = trackOf(row.version) === 'pinned' ? 'error' : 'warning';
    const title = `Schema canary ${row.country}@${row.version} ${row.check}`;
    return `::${level} title=${title}::${escapeAnnotation(row.error ?? row.outcome)}`;
  });
}

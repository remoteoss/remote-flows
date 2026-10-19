export type FailureKind =
  | 'format'
  | 'lint'
  | 'type'
  | 'test'
  | 'e2e'
  | 'coverage'
  | 'build'
  | 'flake'
  | 'unknown';

export type CheckRun = {
  name: string;
  workflow: string;
  link: string;
  runId: string | null;
  jobId: string | null;
};

const ESCAPE_CHAR = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(
  `(?:${ESCAPE_CHAR}|\\^\\[)\\[[0-9;]*[A-Za-z]`,
  'g',
);
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s?/;
const STRONG_ERROR_PATTERN =
  /##\[error\]|\bFAIL\b|AssertionError|error TS\d+|Test Files .*failed|Tests\s+.*failed|✗|×/;
const WEAK_ERROR_PATTERN = /\bError:|\bExpected\b|\bReceived\b|\bnot ok\b/;
const NOISE_PATTERN =
  /^##\[(group|endgroup|debug|warning)\]|^##\[error\]Process completed with exit code|^\s*$/;

const FLAKE_SIGNATURES = [
  /\b403\b.*(rate|blocked)/i,
  /rate.?limit/i,
  /ECONNRESET|ETIMEDOUT|EAI_AGAIN/,
  /socket hang up/i,
];

const PLAYWRIGHT_FAILURE_PATTERN =
  /([✘✓])\s+\d+\s+(\[[^\]]+\]\s+›\s+.+?)(?:\s+\(retry #\d+\))?(?:\s+\([\d.]+(?:ms|s|m)\))?$/;

export function extractPlaywrightFailures(log: string): string[] {
  const specs = new Set<string>();
  for (const line of log.split('\n').map(cleanLogLine)) {
    const match = line.trim().match(PLAYWRIGHT_FAILURE_PATTERN);
    if (!match) {
      continue;
    }
    if (match[1] === '✘') {
      specs.add(match[2]);
    } else {
      specs.delete(match[2]);
    }
  }
  return [...specs];
}

export type RunJob = {
  name: string;
  conclusion: string | null;
  url: string;
  databaseId: number;
};

export function jobsToChecks(
  workflow: string,
  jobs: RunJob[],
): {
  failed: Pick<CheckRun, 'name' | 'workflow' | 'link' | 'jobId'>[];
  passing: number;
} {
  const failed = jobs
    .filter(
      (job) => job.conclusion === 'failure' || job.conclusion === 'timed_out',
    )
    .map((job) => ({
      name: job.name,
      workflow,
      link: job.url,
      jobId: String(job.databaseId),
    }));
  return { failed, passing: jobs.length - failed.length };
}

export function parseCheckLink(
  link: string,
): Pick<CheckRun, 'runId' | 'jobId'> {
  const match = link.match(/\/actions\/runs\/(\d+)(?:\/job\/(\d+))?/);
  return { runId: match?.[1] ?? null, jobId: match?.[2] ?? null };
}

export function cleanLogLine(line: string): string {
  const fields = line.split('\t');
  const message = fields.length >= 3 ? fields.slice(2).join('\t') : line;
  return message
    .replace(ANSI_PATTERN, '')
    .replace(TIMESTAMP_PATTERN, '')
    .trimEnd();
}

export function extractErrorWindows(
  log: string,
  { context = 3, maxLines = 40 }: { context?: number; maxLines?: number } = {},
): string[] {
  const lines = log
    .split('\n')
    .map(cleanLogLine)
    .filter((line) => !NOISE_PATTERN.test(line));

  const pattern = lines.some((line) => STRONG_ERROR_PATTERN.test(line))
    ? STRONG_ERROR_PATTERN
    : WEAK_ERROR_PATTERN;
  const keep = new Set<number>();
  lines.forEach((line, index) => {
    if (!pattern.test(line)) {
      return;
    }
    for (
      let i = Math.max(0, index - context);
      i <= Math.min(lines.length - 1, index + context);
      i++
    ) {
      keep.add(i);
    }
  });

  const selected =
    keep.size === 0
      ? lines.slice(-maxLines)
      : [...keep].sort((a, b) => a - b).map((index) => lines[index]);

  const deduped = selected.filter(
    (line, index) => line !== selected[index - 1],
  );
  if (deduped.length <= maxLines) {
    return deduped;
  }
  const tailLines = Math.ceil((maxLines - 1) / 2);
  const headLines = maxLines - 1 - tailLines;
  return [
    ...deduped.slice(0, headLines),
    `… ${deduped.length - maxLines + 1} lines truncated`,
    ...deduped.slice(-tailLines),
  ];
}

export function classifyFailure(checkName: string, log: string): FailureKind {
  const failureText = extractErrorWindows(log, { maxLines: 200 }).join('\n');
  if (FLAKE_SIGNATURES.some((pattern) => pattern.test(failureText))) {
    return 'flake';
  }
  const name = checkName.toLowerCase();
  if (/error TS\d+/.test(log)) {
    return 'type';
  }
  if (/oxfmt|Format issues found|check-format/i.test(log)) {
    return 'format';
  }
  if (
    /oxlint|Found \d+ (warnings?|errors?)/i.test(log) ||
    name.includes('lint')
  ) {
    return 'lint';
  }
  if (/\bplaywright test\b/i.test(log) || name.includes('e2e')) {
    return 'e2e';
  }
  if (/\bFAIL\b|AssertionError/.test(log)) {
    return 'test';
  }
  if (/does not meet .*threshold|coverage threshold/i.test(log)) {
    return 'coverage';
  }
  if (/vitest/i.test(log) || name.includes('test')) {
    return 'test';
  }
  if (name.includes('build') || /tsdown|check-exports/i.test(log)) {
    return 'build';
  }
  return 'unknown';
}

const NEXT_STEP: Record<FailureKind, string> = {
  format: 'run `pnpm run format` and commit',
  lint: 'run `pnpm exec oxlint <changed files>` and fix',
  type: 'run `pnpm run type-check` locally',
  test: 'rerun only the failing file: `pnpm exec vitest run <path>`',
  e2e: 'rerun the failing spec from `example/` with `npm run test:e2e` (it hits the real sandbox)',
  coverage:
    'tests passed but a coverage threshold failed: run `pnpm run test:coverage` and cover the new lines',
  build: 'run `pnpm run build` / `pnpm run check-exports` locally',
  flake:
    'looks infra or rate-limit related: rerun the job after ~2 minutes before changing code',
  unknown: 'read the excerpt; fetch the full log only if it is not enough',
};

export function renderDigest(
  subject: string,
  failures: {
    check: CheckRun;
    kind: FailureKind;
    excerpt: string[];
    failingSpecs?: string[];
  }[],
  passing: number,
): string {
  if (failures.length === 0) {
    return `${subject}: no failing checks (${passing} passing or pending).`;
  }
  const sections = failures.map(({ check, kind, excerpt, failingSpecs }) =>
    [
      `## ${check.workflow} / ${check.name} [${kind}]`,
      check.link,
      `Next: ${NEXT_STEP[kind]}`,
      ...(failingSpecs?.length
        ? [
            `Failing specs (${failingSpecs.length}):`,
            ...failingSpecs.map((spec) => `- ${spec}`),
          ]
        : []),
      '```',
      ...excerpt,
      '```',
    ].join('\n'),
  );
  return [
    `${subject}: ${failures.length} failing, ${passing} other checks`,
    ...sections,
  ].join('\n\n');
}

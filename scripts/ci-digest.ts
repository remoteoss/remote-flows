import { execFileSync } from 'node:child_process';

import {
  classifyFailure,
  extractErrorWindows,
  extractPlaywrightFailures,
  jobsToChecks,
  parseCheckLink,
  renderDigest,
  type CheckRun,
} from './ci-digest-utils';

type RawCheck = {
  name: string;
  workflow: string;
  link: string;
  bucket: string;
  jobId?: string | null;
};

function gh(args: string[]): string {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const ANSI_ESCAPE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function fetchFailedLog(check: CheckRun): string {
  if (!check.runId) {
    return '';
  }
  const target = check.jobId ? ['--job', check.jobId] : [];
  try {
    return gh(['run', 'view', check.runId, ...target, '--log-failed']);
  } catch {
    if (!check.jobId) {
      return '';
    }
  }
  try {
    return gh([
      'api',
      '--allow-escape-sequences',
      `repos/{owner}/{repo}/actions/jobs/${check.jobId}/logs`,
    ]).replace(ANSI_ESCAPE, '');
  } catch {
    return '';
  }
}

type Checks = { subject: string; failed: RawCheck[]; passing: number };

function branchChecks(branch: string): Checks {
  const runs: { databaseId: number; workflowName: string; headSha: string }[] =
    JSON.parse(
      gh([
        'run',
        'list',
        '--branch',
        branch,
        '--limit',
        '30',
        '--json',
        'databaseId,workflowName,headSha',
      ]),
    );
  if (runs.length === 0) {
    throw new Error(`No workflow runs found on branch ${branch}`);
  }
  const headSha = runs[0].headSha;
  const failed: RawCheck[] = [];
  let passing = 0;
  const latestRunPerWorkflow = new Map<string, (typeof runs)[number]>();
  for (const run of runs) {
    if (
      run.headSha === headSha &&
      !latestRunPerWorkflow.has(run.workflowName)
    ) {
      latestRunPerWorkflow.set(run.workflowName, run);
    }
  }
  for (const run of latestRunPerWorkflow.values()) {
    const { jobs } = JSON.parse(
      gh(['run', 'view', String(run.databaseId), '--json', 'jobs']),
    );
    const result = jobsToChecks(run.workflowName, jobs);
    passing += result.passing;
    failed.push(
      ...result.failed.map((check) => ({ ...check, bucket: 'fail' })),
    );
  }
  return { subject: `${branch} @ ${headSha.slice(0, 7)}`, failed, passing };
}

function prChecks(prNumber: string): Checks {
  let raw: RawCheck[];
  try {
    raw = JSON.parse(
      gh(['pr', 'checks', prNumber, '--json', 'name,workflow,link,bucket']),
    );
  } catch (error) {
    const stdout = (error as { stdout?: string }).stdout;
    if (!stdout) {
      throw error;
    }
    raw = JSON.parse(stdout);
  }
  const failed = raw.filter((check) => check.bucket === 'fail');
  return {
    subject: `PR #${prNumber}`,
    failed,
    passing: raw.length - failed.length,
  };
}

function currentBranch(): string {
  return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

function prChecksOrBranch(): Checks {
  let prNumber: string;
  try {
    prNumber = JSON.parse(
      gh(['pr', 'view', '--json', 'number']),
    ).number.toString();
  } catch {
    return branchChecks(currentBranch());
  }
  return prChecks(prNumber);
}

function main() {
  const args = process.argv.slice(2);
  const maxLinesFlag = args.find((arg) => arg.startsWith('--max-lines='));
  const maxLines = maxLinesFlag ? Number(maxLinesFlag.split('=')[1]) : 40;
  if (!Number.isInteger(maxLines) || maxLines < 1) {
    throw new Error(
      `--max-lines must be a positive integer, got ${maxLinesFlag}`,
    );
  }
  const branchFlag = args.find((arg) => arg.startsWith('--branch='));
  const prArg = args.find((arg) => /^\d+$/.test(arg));
  const { subject, failed, passing } = branchFlag
    ? branchChecks(branchFlag.split('=')[1])
    : prArg
      ? prChecks(prArg)
      : prChecksOrBranch();

  const failures = failed.map((rawCheck) => {
    const parsed = parseCheckLink(rawCheck.link);
    const check: CheckRun = {
      ...rawCheck,
      ...parsed,
      jobId: rawCheck.jobId ?? parsed.jobId,
    };
    const log = fetchFailedLog(check);
    if (!log) {
      return {
        check,
        kind: 'unknown' as const,
        excerpt: [
          check.runId
            ? 'Could not fetch the job log from GitHub; open the link.'
            : 'No GitHub Actions log for this check (external service); open the link.',
        ],
      };
    }
    const kind = classifyFailure(check.name, log);
    return {
      check,
      kind,
      excerpt: extractErrorWindows(log, { maxLines }),
      failingSpecs: kind === 'e2e' ? extractPlaywrightFailures(log) : [],
    };
  });

  console.log(renderDigest(subject, failures, passing));
}

main();

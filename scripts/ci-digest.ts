import { execFileSync } from 'node:child_process';

import {
  classifyFailure,
  extractErrorWindows,
  parseCheckLink,
  renderDigest,
  type CheckRun,
} from './ci-digest-utils';

type RawCheck = {
  name: string;
  workflow: string;
  link: string;
  bucket: string;
};

function gh(args: string[]): string {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function fetchFailedLog(check: CheckRun): string {
  if (!check.runId) {
    return '';
  }
  const target = check.jobId ? ['--job', check.jobId] : [];
  try {
    return gh(['run', 'view', check.runId, ...target, '--log-failed']);
  } catch {
    return '';
  }
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
  const prNumber =
    args.find((arg) => /^\d+$/.test(arg)) ??
    JSON.parse(gh(['pr', 'view', '--json', 'number'])).number.toString();

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
  const failures = failed.map((rawCheck) => {
    const check: CheckRun = { ...rawCheck, ...parseCheckLink(rawCheck.link) };
    const log = fetchFailedLog(check);
    if (!log) {
      return {
        check,
        kind: 'unknown' as const,
        excerpt: [
          'No GitHub Actions log for this check (external service); open the link.',
        ],
      };
    }
    return {
      check,
      kind: classifyFailure(check.name, log),
      excerpt: extractErrorWindows(log, { maxLines }),
    };
  });

  console.log(renderDigest(prNumber, failures, raw.length - failed.length));
}

main();

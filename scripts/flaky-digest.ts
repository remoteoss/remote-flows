import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  aggregate,
  MAIN_WORKFLOW,
  renderFlakyDigest,
  type RunReport,
} from './flaky-digest-utils';
import type { FlakyEntry } from './flaky-reporter';
import { mapWithConcurrency } from './map-with-concurrency';

const NO_ARTIFACT_MESSAGE = /no artifact matches|no valid artifacts/i;

const WORKFLOWS = [MAIN_WORKFLOW, 'pr.yml'];

const DOWNLOAD_CONCURRENCY = 8;

const execFileAsync = promisify(execFile);

type RawRun = {
  databaseId: number;
  url: string;
  createdAt: string;
};

function gh(args: string[]): string {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function numberFlag(args: string[], name: string, fallback: number): number {
  const flag = args.find((arg) => arg.startsWith(`--${name}=`));
  const value = flag ? Number(flag.split('=')[1]) : fallback;
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`--${name} must be a positive integer, got ${flag}`);
  }
  return value;
}

async function fetchReport(
  run: RawRun,
  workflow: string,
): Promise<RunReport | null> {
  const dir = mkdtempSync(path.join(tmpdir(), 'flaky-'));
  try {
    await execFileAsync('gh', [
      'run',
      'download',
      String(run.databaseId),
      '-n',
      'flaky-tests',
      '-D',
      dir,
    ]);
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    const stderr = (error as { stderr?: string }).stderr ?? '';
    if (NO_ARTIFACT_MESSAGE.test(stderr)) {
      return null;
    }
    throw error;
  }
  try {
    const file = path.join(dir, 'flaky-tests.json');
    if (!existsSync(file)) {
      return null;
    }
    const entries: FlakyEntry[] = JSON.parse(readFileSync(file, 'utf8'));
    return {
      runId: String(run.databaseId),
      url: run.url,
      workflow,
      createdAt: run.createdAt,
      entries,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limit = numberFlag(args, 'runs', 30);
  const minHits = numberFlag(args, 'min-hits', 1);

  const reports: RunReport[] = [];
  for (const workflow of WORKFLOWS) {
    const runs: RawRun[] = JSON.parse(
      gh([
        'run',
        'list',
        '--workflow',
        workflow,
        '--status',
        'completed',
        '--limit',
        String(limit),
        '--json',
        'databaseId,url,createdAt',
      ]),
    );
    const fetched = await mapWithConcurrency(
      runs,
      DOWNLOAD_CONCURRENCY,
      (run) => fetchReport(run, workflow),
    );
    reports.push(...fetched.filter((report) => report !== null));
  }

  console.log(renderFlakyDigest(aggregate(reports), reports.length, minHits));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

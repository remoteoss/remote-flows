import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  aggregate,
  renderFlakyDigest,
  type RunReport,
} from './flaky-digest-utils';
import type { FlakyEntry } from './flaky-reporter';

const NO_ARTIFACT_MESSAGE = /no artifact matches/i;

const WORKFLOWS = ['ci-main.yml', 'pr.yml'];

type RawRun = {
  databaseId: number;
  url: string;
  headBranch: string;
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

function fetchReport(run: RawRun): RunReport | null {
  const dir = mkdtempSync(path.join(tmpdir(), 'flaky-'));
  try {
    gh([
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
      branch: run.headBranch,
      createdAt: run.createdAt,
      entries,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
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
        '--limit',
        String(limit),
        '--json',
        'databaseId,url,headBranch,createdAt',
      ]),
    );
    for (const run of runs) {
      const report = fetchReport(run);
      if (report) {
        reports.push(report);
      }
    }
  }

  console.log(renderFlakyDigest(aggregate(reports), reports.length, minHits));
}

main();

import type { FlakyEntry } from './flaky-reporter';

export type RunReport = {
  runId: string;
  url: string;
  branch: string;
  createdAt: string;
  entries: FlakyEntry[];
};

export type FlakyTest = {
  file: string;
  name: string;
  flakyRuns: number;
  failedRuns: number;
  lastSeen: string;
  lastRunUrl: string;
  error: string;
};

export function aggregate(reports: RunReport[]): FlakyTest[] {
  const byTest = new Map<string, FlakyTest>();
  for (const report of reports) {
    for (const entry of report.entries) {
      if (entry.outcome === 'failed' && report.branch !== 'main') {
        continue;
      }
      const key = `${entry.file}::${entry.name}`;
      const existing = byTest.get(key) ?? {
        file: entry.file,
        name: entry.name,
        flakyRuns: 0,
        failedRuns: 0,
        lastSeen: report.createdAt,
        lastRunUrl: report.url,
        error: entry.error,
      };
      if (entry.outcome === 'flaky') {
        existing.flakyRuns++;
      } else {
        existing.failedRuns++;
      }
      if (report.createdAt >= existing.lastSeen) {
        existing.lastSeen = report.createdAt;
        existing.lastRunUrl = report.url;
        existing.error = entry.error || existing.error;
      }
      byTest.set(key, existing);
    }
  }
  return [...byTest.values()].sort(
    (a, b) =>
      b.flakyRuns + b.failedRuns - (a.flakyRuns + a.failedRuns) ||
      b.lastSeen.localeCompare(a.lastSeen),
  );
}

export function renderFlakyDigest(
  tests: FlakyTest[],
  runsScanned: number,
  minHits: number,
): string {
  const hits = (test: FlakyTest) => test.flakyRuns + test.failedRuns;
  const reported = tests.filter((test) => hits(test) >= minHits);
  if (reported.length === 0) {
    return `Scanned ${runsScanned} runs: no test hit ${minHits}+ times.`;
  }
  const sections = reported.map((test) =>
    [
      `## ${test.file} > ${test.name}`,
      `${test.flakyRuns} flaky (passed on retry), ${test.failedRuns} failed in ${runsScanned} runs; last seen ${test.lastSeen}`,
      test.lastRunUrl,
      `Error: ${test.error || '(none captured)'}`,
      `Next: read the test for synchronous lookups right after a heading/step wait or an unawaited async update; rerun only this file with \`npx vitest run ${test.file}\``,
    ].join('\n'),
  );
  return [
    `Scanned ${runsScanned} runs: ${reported.length} test(s) hit ${minHits}+ times`,
    ...sections,
  ].join('\n\n');
}

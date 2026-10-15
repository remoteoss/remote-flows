import {
  aggregate,
  renderFlakyDigest,
  type RunReport,
} from './flaky-digest-utils';

const entry = (outcome: 'flaky' | 'failed', error = 'boom') => ({
  file: 'src/a.test.tsx',
  name: 'A > does a thing',
  outcome,
  retries: 1,
  error,
});

const report = (
  runId: string,
  createdAt: string,
  entries: RunReport['entries'],
): RunReport => ({
  runId,
  url: `https://example.test/runs/${runId}`,
  workflow: 'ci-main.yml',
  createdAt,
  entries,
});

describe('aggregate', () => {
  it('counts flaky and failed runs per test and keeps the latest run', () => {
    const [test] = aggregate([
      report('1', '2026-10-10T00:00:00Z', [entry('flaky', 'old')]),
      report('2', '2026-10-12T00:00:00Z', [entry('failed', 'new')]),
      report('3', '2026-10-11T00:00:00Z', [entry('flaky', 'mid')]),
    ]);
    expect(test).toEqual({
      file: 'src/a.test.tsx',
      name: 'A > does a thing',
      flakyRuns: 2,
      failedRuns: 1,
      lastSeen: '2026-10-12T00:00:00Z',
      lastRunUrl: 'https://example.test/runs/2',
      error: 'new',
    });
  });

  it('ignores hard failures from the pr workflow, even when the head branch is main', () => {
    const result = aggregate([
      {
        ...report('1', '2026-10-10T00:00:00Z', [entry('failed')]),
        workflow: 'pr.yml',
      },
      report('2', '2026-10-11T00:00:00Z', [entry('failed')]),
    ]);
    expect(result[0].failedRuns).toBe(1);
  });

  it('sorts the most frequent test first', () => {
    const rare = { ...entry('flaky'), name: 'rare' };
    const common = { ...entry('flaky'), name: 'common' };
    const result = aggregate([
      report('1', '2026-10-10T00:00:00Z', [rare, common]),
      report('2', '2026-10-11T00:00:00Z', [common]),
    ]);
    expect(result.map((test) => test.name)).toEqual(['common', 'rare']);
  });
});

describe('renderFlakyDigest', () => {
  const tests = aggregate([
    report('1', '2026-10-10T00:00:00Z', [entry('flaky')]),
  ]);

  it('lists tests at or above the hit threshold', () => {
    const output = renderFlakyDigest(tests, 5, 1);
    expect(output).toContain('Scanned 5 runs: 1 test(s) hit 1+ times');
    expect(output).toContain('## src/a.test.tsx > A > does a thing');
    expect(output).toContain('1 flaky (passed on retry), 0 failed in 5 runs');
  });

  it('says so when nothing reaches the threshold', () => {
    expect(renderFlakyDigest(tests, 5, 2)).toBe(
      'Scanned 5 runs: no test hit 2+ times.',
    );
  });
});

import {
  classifyFailure,
  cleanLogLine,
  extractErrorWindows,
  parseCheckLink,
  renderDigest,
} from './ci-digest-utils';

describe('parseCheckLink', () => {
  it('extracts run and job ids', () => {
    expect(
      parseCheckLink(
        'https://github.com/remoteoss/remote-flows/actions/runs/123/job/456',
      ),
    ).toEqual({ runId: '123', jobId: '456' });
  });

  it('returns nulls for non-actions links', () => {
    expect(parseCheckLink('https://vercel.com/deploy/abc')).toEqual({
      runId: null,
      jobId: null,
    });
  });
});

describe('cleanLogLine', () => {
  it('strips job/step prefix, timestamp and ansi codes', () => {
    const line = `Tests\tRun tests\t2026-10-14T10:00:00.1234567Z \u001b[31mFAIL\u001b[0m src/a.test.ts`;
    expect(cleanLogLine(line)).toBe('FAIL src/a.test.ts');
  });

  it('strips the caret form CI logs use for escape codes', () => {
    expect(cleanLogLine('^[[41m^[[1m FAIL ^[[22m^[[49m src/a.test.ts')).toBe(
      ' FAIL  src/a.test.ts',
    );
  });
});

describe('extractErrorWindows', () => {
  it('ignores weak Error: noise when a strong failure marker exists', () => {
    const log = [
      'Error: expected noise from a test',
      'filler',
      'FAIL src/a.test.ts > breaks',
      'filler 2',
    ].join('\n');
    expect(extractErrorWindows(log, { context: 0 })).toEqual([
      'FAIL src/a.test.ts > breaks',
    ]);
  });

  it('drops the Actions exit-code footer so the real error stays visible', () => {
    const log = [
      'Error: real boom',
      'filler 1',
      'filler 2',
      'filler 3',
      'filler 4',
      '##[error]Process completed with exit code 1.',
    ].join('\n');
    expect(extractErrorWindows(log, { context: 0 })).toEqual([
      'Error: real boom',
    ]);
  });

  it('uses weak markers when there is nothing stronger', () => {
    const log = ['filler', 'Error: boom', 'filler 2'].join('\n');
    expect(extractErrorWindows(log, { context: 0 })).toEqual(['Error: boom']);
  });

  const noisy = Array.from(
    { length: 200 },
    (_, i) => `Job\tStep\t2026-10-14T10:00:00Z line ${i}`,
  );
  noisy[100] =
    'Job\tStep\t2026-10-14T10:00:00Z FAIL src/a.test.ts > does a thing';

  it('keeps only the lines around an error', () => {
    expect(extractErrorWindows(noisy.join('\n'), { context: 1 })).toEqual([
      'line 99',
      'FAIL src/a.test.ts > does a thing',
      'line 101',
    ]);
  });

  it('falls back to the tail when nothing looks like an error', () => {
    const quiet = Array.from({ length: 10 }, (_, i) => `line ${i}`).join('\n');
    expect(extractErrorWindows(quiet, { maxLines: 3 })).toEqual([
      'line 7',
      'line 8',
      'line 9',
    ]);
  });

  it('truncates long output and says how much was dropped', () => {
    const many = Array.from(
      { length: 50 },
      (_, i) => `error TS${1000 + i}: bad`,
    ).join('\n');
    const result = extractErrorWindows(many, { context: 0, maxLines: 5 });
    expect(result).toEqual([
      'error TS1000: bad',
      'error TS1001: bad',
      '… 46 lines truncated',
      'error TS1048: bad',
      'error TS1049: bad',
    ]);
  });
});

describe('classifyFailure', () => {
  it('flags rate-limit signatures as flakes before anything else', () => {
    expect(
      classifyFailure('Tests', 'FAIL a.test.ts\nHTTP 403 rate limit exceeded'),
    ).toBe('flake');
  });

  it('ignores rate-limit wording that is not part of a failure', () => {
    const log = [
      'rate limit handled in a passing test',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'FAIL a.test.ts > breaks',
      'done',
    ].join('\n');
    expect(classifyFailure('Tests', log)).toBe('test');
  });

  it('does not treat a plain 403 forbidden as a flake', () => {
    expect(classifyFailure('Tests', 'FAIL a.test.ts\nHTTP 403 forbidden')).toBe(
      'test',
    );
  });

  it('does not treat a Playwright timeout as a flake', () => {
    expect(
      classifyFailure(
        'E2E Tests',
        'playwright\nTest timeout of 30000ms exceeded',
      ),
    ).toBe('e2e');
  });

  it('reports a coverage-threshold failure when every test passed', () => {
    expect(
      classifyFailure(
        'Tests with Coverage',
        'ERROR: Coverage for lines (80%) does not meet global threshold (90%)',
      ),
    ).toBe('coverage');
  });

  it('does not call a crashed coverage job a threshold miss', () => {
    expect(
      classifyFailure('Tests with Coverage', 'npm ERR! install failed'),
    ).toBe('test');
  });

  it('detects type errors', () => {
    expect(
      classifyFailure('Lint and Format', 'src/a.ts(1,1): error TS2322: nope'),
    ).toBe('type');
  });

  it('falls back to the check name', () => {
    expect(classifyFailure('Build and Check Exports', 'something broke')).toBe(
      'build',
    );
  });

  it('returns unknown when nothing matches', () => {
    expect(classifyFailure('Deploy', 'oops')).toBe('unknown');
  });
});

describe('renderDigest', () => {
  it('reports a clean PR in one line', () => {
    expect(renderDigest('7', [], 12)).toBe(
      'PR #7: no failing checks (12 passing or pending).',
    );
  });

  it('renders each failure with kind, next step and excerpt', () => {
    const output = renderDigest(
      '7',
      [
        {
          check: {
            name: 'Tests',
            workflow: 'PR Checks',
            link: 'https://x/y',
            runId: '1',
            jobId: '2',
          },
          kind: 'test',
          excerpt: ['FAIL a.test.ts'],
        },
      ],
      3,
    );
    expect(output).toBe(
      [
        'PR #7: 1 failing, 3 other checks',
        '## PR Checks / Tests [test]\nhttps://x/y\nNext: rerun only the failing file: `npx vitest run <path>`\n```\nFAIL a.test.ts\n```',
      ].join('\n\n'),
    );
  });
});

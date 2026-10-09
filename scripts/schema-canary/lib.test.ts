import {
  buildReport,
  checkSchemaBuildsAndValidates,
  decideExitCode,
  formatFailures,
  formatSummaryTable,
  isSkipped,
  mapWithConcurrency,
  SchemaCanaryRow,
} from './lib';
import { SchemaCanarySkipEntry } from './skip-list';

describe.each(['buildOnce', 'rebuild'] as const)(
  'checkSchemaBuildsAndValidates with %s',
  (strategy) => {
    it('passes for a valid schema', async () => {
      const result = await checkSchemaBuildsAndValidates(
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
              'x-jsf-presentation': { inputType: 'text' },
            },
          },
          required: ['name'],
        },
        strategy,
      );
      expect(result.ok).toBe(true);
    });

    it('fails and captures the error for an unusable schema', async () => {
      const result = await checkSchemaBuildsAndValidates(null, strategy);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('properties');
      }
    });
  },
);

describe('isSkipped', () => {
  const skipList: SchemaCanarySkipEntry[] = [
    { country: 'XYZ', check: 'submit', reason: 'known gap' },
    { country: 'ABC', check: 'all', reason: 'no contract_details form' },
    {
      country: 'FRA',
      check: 'build',
      version: 'latest',
      reason: 'latest only',
    },
  ];

  it('matches a check-specific skip entry on both versions', () => {
    expect(isSkipped(skipList, 'XYZ', 'submit', 'pinned')?.reason).toBe(
      'known gap',
    );
    expect(isSkipped(skipList, 'XYZ', 'submit', 'latest')?.reason).toBe(
      'known gap',
    );
    expect(isSkipped(skipList, 'XYZ', 'build', 'pinned')).toBeUndefined();
  });

  it('matches an "all" skip entry for every check', () => {
    expect(isSkipped(skipList, 'ABC', 'build', 'pinned')?.reason).toBe(
      'no contract_details form',
    );
    expect(isSkipped(skipList, 'ABC', 'submit', 'latest')?.reason).toBe(
      'no contract_details form',
    );
  });

  it('matches a version-specific skip entry only on that version', () => {
    expect(isSkipped(skipList, 'FRA', 'build', 'latest')?.reason).toBe(
      'latest only',
    );
    expect(isSkipped(skipList, 'FRA', 'build', 'pinned')).toBeUndefined();
  });

  it('returns undefined for a country not in the skip list', () => {
    expect(isSkipped(skipList, 'DEU', 'build', 'pinned')).toBeUndefined();
  });
});

describe('decideExitCode', () => {
  const passingRow: SchemaCanaryRow = {
    country: 'DEU',
    version: 7,
    strategy: 'buildOnce',
    check: 'build',
    outcome: 'pass',
  };

  it('returns 0 when nothing failed', () => {
    expect(decideExitCode([passingRow])).toBe(0);
  });

  it.each(['build', 'submit', 'browser'] as const)(
    'returns 1 when a pinned "%s" check failed',
    (check) => {
      const rows: SchemaCanaryRow[] = [
        passingRow,
        { ...passingRow, check, outcome: 'fail', error: 'boom' },
      ];
      expect(decideExitCode(rows)).toBe(1);
    },
  );

  it('returns 1 when seeding failed on the pinned version', () => {
    const rows: SchemaCanaryRow[] = [
      passingRow,
      { ...passingRow, outcome: 'seed-error', error: 'seeding failed' },
    ];
    expect(decideExitCode(rows)).toBe(1);
  });

  it.each(['fail', 'seed-error'] as const)(
    'returns 0 when only latest checks have outcome "%s"',
    (outcome) => {
      const rows: SchemaCanaryRow[] = [
        passingRow,
        { ...passingRow, version: 'latest', outcome, error: 'boom' },
        {
          ...passingRow,
          version: 'latest',
          check: 'browser',
          outcome,
          error: 'boom',
        },
      ];
      expect(decideExitCode(rows)).toBe(0);
    },
  );
});

describe('buildReport', () => {
  it('wraps the rows with report metadata', () => {
    const rows: SchemaCanaryRow[] = [
      {
        country: 'DEU',
        version: 7,
        strategy: 'buildOnce',
        check: 'build',
        outcome: 'pass',
      },
    ];

    const report = buildReport(rows);

    expect(report.checks).toEqual(rows);
    expect(report._meta.title).toBe('Contract details schema canary');
  });

  it('sorts the rows by country, then pinned before latest, then check', () => {
    const row: SchemaCanaryRow = {
      country: 'FRA',
      version: 1,
      strategy: 'buildOnce',
      check: 'build',
      outcome: 'pass',
    };
    const rows: SchemaCanaryRow[] = [
      { ...row, version: 'latest', check: 'browser' },
      { ...row, country: 'DEU', check: 'submit' },
      { ...row, version: 'latest', check: 'build' },
      { ...row, check: 'browser' },
      { ...row, check: 'build' },
    ];

    expect(buildReport(rows).checks).toEqual([
      { ...row, country: 'DEU', check: 'submit' },
      { ...row, check: 'build' },
      { ...row, check: 'browser' },
      { ...row, version: 'latest', check: 'build' },
      { ...row, version: 'latest', check: 'browser' },
    ]);
  });

  it('produces byte-identical output for identical rows on different days', () => {
    const rows: SchemaCanaryRow[] = [
      {
        country: 'DEU',
        version: 7,
        strategy: 'buildOnce',
        check: 'build',
        outcome: 'pass',
      },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01'));
    const first = buildReport(rows);
    vi.setSystemTime(new Date('2026-01-02'));
    const second = buildReport(rows);
    vi.useRealTimers();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('formatSummaryTable', () => {
  it('renders a markdown table with one row per check', () => {
    const rows: SchemaCanaryRow[] = [
      {
        country: 'DEU',
        version: 7,
        strategy: 'buildOnce',
        check: 'build',
        outcome: 'pass',
      },
      {
        country: 'FRA',
        version: 'latest',
        strategy: 'buildOnce',
        check: 'build',
        outcome: 'fail',
        error: 'Cannot read properties of null',
      },
      {
        country: 'ISL',
        version: 3,
        strategy: 'rebuild',
        check: 'build',
        outcome: 'seed-error',
        error: 'employment seeding failed: POST /v1/employments -> 422',
      },
    ];

    const table = formatSummaryTable(rows);

    expect(table).toBe(
      [
        '| Country | Version | Strategy | Check | Result | Error |',
        '| --- | --- | --- | --- | --- | --- |',
        '| DEU | 7 | buildOnce | build | ✅ pass |  |',
        '| FRA | latest | buildOnce | build | ❌ fail | Cannot read properties of null |',
        '| ISL | 3 | rebuild | build | ⚠️ seed error | employment seeding failed: POST /v1/employments -> 422 |',
      ].join('\n'),
    );
  });
});

describe('mapWithConcurrency', () => {
  it('keeps the input order and never runs more than the limit at once', async () => {
    let running = 0;
    let peak = 0;
    const results = await mapWithConcurrency(
      [30, 10, 20, 0, 5],
      2,
      async (delay) => {
        running++;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, delay));
        running--;
        return delay * 2;
      },
    );

    expect(results).toEqual([60, 20, 40, 0, 10]);
    expect(peak).toBe(2);
  });
});

describe('formatFailures', () => {
  const row: SchemaCanaryRow = {
    country: 'FRA',
    version: 1,
    strategy: 'buildOnce',
    check: 'build',
    outcome: 'pass',
  };
  const rows: SchemaCanaryRow[] = [
    row,
    { ...row, country: 'ESP', check: 'submit', outcome: 'fail', error: 'boom' },
    { ...row, country: 'GBR', outcome: 'seed-error', error: 'no seed' },
    { ...row, country: 'ITA', outcome: 'skip', error: 'known' },
    {
      ...row,
      country: 'PHL',
      version: 'latest',
      check: 'browser',
      outcome: 'fail',
      error: 'latest boom',
    },
  ];

  it('lists only the pinned failures and seed errors for "pinned"', () => {
    expect(formatFailures(rows, 'pinned')).toBe(
      formatSummaryTable([rows[1], rows[2]]),
    );
  });

  it('lists only the latest failures for "latest"', () => {
    expect(formatFailures(rows, 'latest')).toBe(formatSummaryTable([rows[4]]));
  });

  it('is empty when nothing failed on that version', () => {
    expect(formatFailures([row, { ...row, outcome: 'skip' }], 'pinned')).toBe(
      '',
    );
    expect(formatFailures(rows.slice(0, 4), 'latest')).toBe('');
  });
});

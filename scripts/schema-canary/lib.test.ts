import {
  buildReport,
  checkSchemaBuildsAndValidates,
  decideExitCode,
  formatSummaryTable,
  isSkipped,
  resolveStrategy,
  SchemaCanaryRow,
} from './lib';
import { SchemaCanarySkipEntry } from './skip-list';

describe('resolveStrategy', () => {
  it('returns buildOnce for countries on the jsf v1 contract details path', () => {
    expect(resolveStrategy('DEU')).toBe('buildOnce');
    expect(resolveStrategy('FRA')).toBe('buildOnce');
  });

  it('returns jsf-v0 for every other country', () => {
    expect(resolveStrategy('GBR')).toBe('rebuild');
  });
});

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
    { country: 'XYZ', check: 'latest', reason: 'known gap' },
    { country: 'ABC', check: 'all', reason: 'no contract_details form' },
  ];

  it('matches a check-specific skip entry', () => {
    expect(isSkipped(skipList, 'XYZ', 'latest')?.reason).toBe('known gap');
    expect(isSkipped(skipList, 'XYZ', 'pinned')).toBeUndefined();
  });

  it('matches an "all" skip entry for either check', () => {
    expect(isSkipped(skipList, 'ABC', 'pinned')?.reason).toBe(
      'no contract_details form',
    );
    expect(isSkipped(skipList, 'ABC', 'latest')?.reason).toBe(
      'no contract_details form',
    );
  });

  it('returns undefined for a country not in the skip list', () => {
    expect(isSkipped(skipList, 'DEU', 'pinned')).toBeUndefined();
  });
});

describe('decideExitCode', () => {
  const passingRow: SchemaCanaryRow = {
    country: 'DEU',
    version: 7,
    strategy: 'buildOnce',
    check: 'pinned',
    outcome: 'pass',
  };

  it('returns 0 when nothing failed', () => {
    expect(decideExitCode([passingRow])).toBe(0);
  });

  it('returns 0 when only a "latest" check failed', () => {
    const rows: SchemaCanaryRow[] = [
      passingRow,
      { ...passingRow, check: 'latest', outcome: 'fail', error: 'boom' },
    ];
    expect(decideExitCode(rows)).toBe(0);
  });

  it('returns 1 when a "pinned" check failed', () => {
    const rows: SchemaCanaryRow[] = [
      passingRow,
      { ...passingRow, outcome: 'fail', error: 'boom' },
    ];
    expect(decideExitCode(rows)).toBe(1);
  });

  it.each(['pinned', 'latest'] as const)(
    'returns 1 when seeding failed for a "%s" check',
    (check) => {
      const rows: SchemaCanaryRow[] = [
        passingRow,
        {
          ...passingRow,
          check,
          outcome: 'seed-error',
          error: 'employment seeding failed: boom',
        },
      ];
      expect(decideExitCode(rows)).toBe(1);
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
        check: 'pinned',
        outcome: 'pass',
      },
    ];

    const report = buildReport(rows);

    expect(report.checks).toBe(rows);
    expect(report._meta.title).toBe('Contract details schema canary');
  });

  it('produces byte-identical output for identical rows on different days', () => {
    const rows: SchemaCanaryRow[] = [
      {
        country: 'DEU',
        version: 7,
        strategy: 'buildOnce',
        check: 'pinned',
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
        check: 'pinned',
        outcome: 'pass',
      },
      {
        country: 'FRA',
        version: 'latest',
        strategy: 'buildOnce',
        check: 'latest',
        outcome: 'fail',
        error: 'Cannot read properties of null',
      },
      {
        country: 'ISL',
        version: 3,
        strategy: 'rebuild',
        check: 'pinned',
        outcome: 'seed-error',
        error: 'employment seeding failed: POST /v1/employments -> 422',
      },
    ];

    const table = formatSummaryTable(rows);

    expect(table).toBe(
      [
        '| Country | Version | Strategy | Check | Result | Error |',
        '| --- | --- | --- | --- | --- | --- |',
        '| DEU | 7 | buildOnce | pinned | ✅ pass |  |',
        '| FRA | latest | buildOnce | latest | ❌ fail | Cannot read properties of null |',
        '| ISL | 3 | rebuild | pinned | ⚠️ seed error | employment seeding failed: POST /v1/employments -> 422 |',
      ].join('\n'),
    );
  });
});

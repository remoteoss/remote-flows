import {
  browserRows,
  EMPLOYMENT_ANNOTATION,
  PlaywrightJsonReport,
} from './browser-results';
import { KeptEmployment } from './kept-employments';

function kept(country: string, version: number | 'latest'): KeptEmployment {
  return {
    country,
    employmentId: `${country}-${version}`,
    companyId: 'company-1',
    version,
    strategy: 'buildOnce',
    sent: {},
    knownUnsavedFields: [],
  };
}

function playwrightTest(
  employmentId: string,
  status: 'expected' | 'unexpected' | 'flaky' | 'skipped',
  message?: string,
) {
  return {
    annotations: [{ type: EMPLOYMENT_ANNOTATION, description: employmentId }],
    status,
    results: [{ errors: message ? [{ message }] : [] }],
  };
}

describe('browserRows', () => {
  it('maps each kept employment to the outcome of its Playwright test', () => {
    const report: PlaywrightJsonReport = {
      suites: [
        {
          specs: [{ tests: [playwrightTest('GBR-7', 'expected')] }],
          suites: [
            {
              specs: [
                { tests: [playwrightTest('GBR-latest', 'flaky')] },
                {
                  tests: [
                    playwrightTest(
                      'MKD-latest',
                      'unexpected',
                      '\u001b[31mError: Select Country did not move on.\u001b[39m\n\nCall log: ...',
                    ),
                  ],
                },
                { tests: [playwrightTest('NOR-1', 'skipped')] },
              ],
            },
          ],
        },
      ],
    };

    expect(
      browserRows(
        [
          kept('GBR', 7),
          kept('GBR', 'latest'),
          kept('MKD', 'latest'),
          kept('NOR', 1),
        ],
        [report],
      ),
    ).toEqual([
      {
        country: 'GBR',
        version: 7,
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'pass',
      },
      {
        country: 'GBR',
        version: 'latest',
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'pass',
      },
      {
        country: 'MKD',
        version: 'latest',
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'fail',
        error: 'Error: Select Country did not move on.',
      },
      {
        country: 'NOR',
        version: 1,
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'skip',
        error: 'the browser test was skipped',
      },
    ]);
  });

  it('fails every kept employment when Playwright wrote no results', () => {
    expect(browserRows([kept('GBR', 7)], [])).toEqual([
      {
        country: 'GBR',
        version: 7,
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'fail',
        error: 'the browser test did not run',
      },
    ]);
  });

  it('takes the result of the rerun for a test that ran twice', () => {
    const firstRun: PlaywrightJsonReport = {
      suites: [
        {
          specs: [
            { tests: [playwrightTest('GBR-7', 'unexpected', 'Error: 403')] },
            { tests: [playwrightTest('FRA-1', 'expected')] },
          ],
        },
      ],
    };
    const rerun: PlaywrightJsonReport = {
      suites: [{ specs: [{ tests: [playwrightTest('GBR-7', 'expected')] }] }],
    };

    expect(
      browserRows([kept('GBR', 7), kept('FRA', 1)], [firstRun, rerun]),
    ).toEqual([
      {
        country: 'GBR',
        version: 7,
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'pass',
      },
      {
        country: 'FRA',
        version: 1,
        strategy: 'buildOnce',
        check: 'browser',
        outcome: 'pass',
      },
    ]);
  });
});

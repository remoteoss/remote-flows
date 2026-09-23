import {
  describeSubmitError,
  flattenFormErrors,
  formatResultsTable,
  hasFailures,
  VerifyResult,
} from '@/scripts/verify-contract-details-version/report';
import { MutationErrorStructure } from '@/src/lib/mutations';

describe('flattenFormErrors', () => {
  it('returns an empty array when there are no errors', () => {
    expect(flattenFormErrors(undefined)).toEqual([]);
    expect(flattenFormErrors({})).toEqual([]);
  });

  it('flattens leaf string errors with a dotted path', () => {
    expect(
      flattenFormErrors({
        job_title: 'is required',
        daily_schedule: { schedule_type: 'is invalid' },
      }),
    ).toEqual([
      'job_title: is required',
      'daily_schedule.schedule_type: is invalid',
    ]);
  });

  it('flattens array entries with an index in the path', () => {
    expect(
      flattenFormErrors({
        equity_grants: [null, { amount: 'must be positive' }],
      }),
    ).toEqual(['equity_grants[1].amount: must be positive']);
  });
});

describe('describeSubmitError', () => {
  it('reports field errors from a mutation error', () => {
    const error: MutationErrorStructure = {
      error: new Error('Validation failed'),
      rawError: {},
      normalizedErrors: {},
      fieldErrors: [{ field: 'annual_gross_salary', messages: ['too low'] }],
    };
    expect(describeSubmitError(error)).toEqual([
      'annual_gross_salary: too low',
    ]);
  });

  it('falls back to the mutation error message when there are no field errors', () => {
    const error: MutationErrorStructure = {
      error: new Error('Something went wrong'),
      rawError: {},
      normalizedErrors: {},
      fieldErrors: [],
    };
    expect(describeSubmitError(error)).toEqual(['Something went wrong']);
  });

  it('falls back to a plain Error message', () => {
    expect(describeSubmitError(new Error('boom'))).toEqual(['boom']);
  });

  it('stringifies anything else', () => {
    expect(describeSubmitError('unexpected')).toEqual(['unexpected']);
  });
});

describe('hasFailures / formatResultsTable', () => {
  const passing: VerifyResult = {
    country: 'DEU',
    version: 7,
    pass: 'required',
    status: 'passed',
    errors: [],
    skipped: [],
  };
  const failing: VerifyResult = {
    country: 'ESP',
    version: 7,
    pass: 'full',
    status: 'failed',
    errors: ['annual_gross_salary: too low'],
    skipped: [],
  };

  it('reports failures only when a result failed', () => {
    expect(hasFailures([passing])).toBe(false);
    expect(hasFailures([passing, failing])).toBe(true);
  });

  it('formats a markdown table with one row per result', () => {
    const table = formatResultsTable([passing, failing]);
    expect(table).toBe(
      [
        '| Country | Version | Pass | Result | Errors |',
        '| --- | --- | --- | --- | --- |',
        '| DEU | 7 | required | passed | - |',
        '| ESP | 7 | full | failed | annual_gross_salary: too low |',
      ].join('\n'),
    );
  });
});

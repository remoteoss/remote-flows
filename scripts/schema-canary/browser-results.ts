import { stripVTControlCharacters } from 'node:util';
import { KeptEmployment } from './kept-employments';
import { SchemaCanaryRow } from './lib';

export const EMPLOYMENT_ANNOTATION = 'schema-canary-employment';

type PlaywrightJsonTest = {
  annotations?: { type: string; description?: string }[];
  status: 'expected' | 'unexpected' | 'flaky' | 'skipped';
  results: { errors?: { message?: string }[] }[];
};

type PlaywrightJsonSuite = {
  specs?: { tests: PlaywrightJsonTest[] }[];
  suites?: PlaywrightJsonSuite[];
};

export type PlaywrightJsonReport = { suites?: PlaywrightJsonSuite[] };

function collectTests(
  suites: PlaywrightJsonSuite[] = [],
): PlaywrightJsonTest[] {
  return suites.flatMap((suite) => [
    ...(suite.specs ?? []).flatMap((spec) => spec.tests),
    ...collectTests(suite.suites),
  ]);
}

function firstLine(message: string) {
  return stripVTControlCharacters(message).trim().split('\n')[0];
}

export function browserRows(
  kept: KeptEmployment[],
  report: PlaywrightJsonReport | undefined,
): SchemaCanaryRow[] {
  const testsByEmployment = new Map<string, PlaywrightJsonTest>();
  for (const test of collectTests(report?.suites)) {
    const employmentId = test.annotations?.find(
      (annotation) => annotation.type === EMPLOYMENT_ANNOTATION,
    )?.description;
    if (employmentId) testsByEmployment.set(employmentId, test);
  }

  return kept.map(
    ({ country, employmentId, version, strategy }): SchemaCanaryRow => {
      const row = { country, version, strategy, check: 'browser' as const };
      const test = testsByEmployment.get(employmentId);
      if (!test) {
        return {
          ...row,
          outcome: 'fail',
          error: 'the browser test did not run',
        };
      }
      if (test.status === 'expected' || test.status === 'flaky') {
        return { ...row, outcome: 'pass' };
      }
      if (test.status === 'skipped') {
        return {
          ...row,
          outcome: 'skip',
          error: 'the browser test was skipped',
        };
      }
      const message =
        test.results[test.results.length - 1]?.errors?.[0]?.message;
      return {
        ...row,
        outcome: 'fail',
        error: message ? firstLine(message) : 'the browser test failed',
      };
    },
  );
}

import { isMutationError } from '@/src/lib/mutations';
import { FillPass } from '@/scripts/verify-contract-details-version/fill';
import { $TSFixMe } from '@/src/types/remoteFlows';

export type PassStatus = 'passed' | 'failed';

export type VerifyResult = {
  country: string;
  version: number;
  pass: FillPass;
  status: PassStatus;
  errors: string[];
  skipped: string[];
};

export function flattenFormErrors(
  formErrors: Record<string, unknown> | undefined,
  prefix = '',
): string[] {
  if (!formErrors) return [];

  return Object.entries(formErrors).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      return [`${path}: ${value}`];
    }
    if (Array.isArray(value)) {
      return value.flatMap((entry, index) =>
        entry ? flattenFormErrors(entry as $TSFixMe, `${path}[${index}]`) : [],
      );
    }
    if (value && typeof value === 'object') {
      return flattenFormErrors(value as $TSFixMe, path);
    }
    return [`${path}: ${String(value)}`];
  });
}

export function describeSubmitError(error: unknown): string[] {
  if (isMutationError(error)) {
    if (error.fieldErrors.length > 0) {
      return error.fieldErrors.map(
        (fieldError) =>
          `${fieldError.field}: ${fieldError.messages.join(', ')}`,
      );
    }
    return [error.error.message];
  }
  if (error instanceof Error) return [error.message];
  return [String(error)];
}

export function hasFailures(results: VerifyResult[]): boolean {
  return results.some((result) => result.status === 'failed');
}

export function formatResultsTable(results: VerifyResult[]): string {
  const header = '| Country | Version | Pass | Result | Errors |';
  const divider = '| --- | --- | --- | --- | --- |';
  const rows = results.map((result) => {
    const errors = result.errors.length > 0 ? result.errors.join('; ') : '-';
    return `| ${result.country} | ${result.version} | ${result.pass} | ${result.status} | ${errors} |`;
  });
  return [header, divider, ...rows].join('\n');
}

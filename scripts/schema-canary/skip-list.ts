import type { SchemaCheckType, SchemaVersionTrack } from './lib';

export type SchemaCanarySkipEntry = {
  country: string;
  check: SchemaCheckType | 'all';
  version?: SchemaVersionTrack;
  reason: string;
};

export const SCHEMA_CANARY_SKIP_LIST: SchemaCanarySkipEntry[] = [];

export function findSkipEntry(
  skipList: SchemaCanarySkipEntry[],
  country: string,
  check: SchemaCheckType,
  track: SchemaVersionTrack,
): SchemaCanarySkipEntry | undefined {
  return skipList.find(
    (entry) =>
      entry.country === country &&
      (entry.check === 'all' || entry.check === check) &&
      (entry.version === undefined || entry.version === track),
  );
}

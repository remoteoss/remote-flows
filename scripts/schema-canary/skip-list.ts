export type SchemaCanaryCheckScope = 'pinned' | 'latest' | 'all';

export type SchemaCanarySkipEntry = {
  country: string;
  check: SchemaCanaryCheckScope;
  reason: string;
};

export const SCHEMA_CANARY_SKIP_LIST: SchemaCanarySkipEntry[] = [];

export function findSkipEntry(
  skipList: SchemaCanarySkipEntry[],
  country: string,
  check: Exclude<SchemaCanaryCheckScope, 'all'>,
): SchemaCanarySkipEntry | undefined {
  return skipList.find(
    (entry) =>
      entry.country === country &&
      (entry.check === 'all' || entry.check === check),
  );
}

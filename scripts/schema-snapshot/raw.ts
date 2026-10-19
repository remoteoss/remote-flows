import { isDeepStrictEqual } from 'node:util';

export type RawSchemaStatus = 'unchanged' | 'changed' | 'missing';

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, sortKeysDeep(entry)]),
    );
  }
  return value;
}

export function serializeRawSchema(schema: unknown): string {
  return `${JSON.stringify(sortKeysDeep(schema), null, 2)}\n`;
}

export function compareRawSchema(
  committed: unknown | undefined,
  served: unknown,
): RawSchemaStatus {
  if (committed === undefined) {
    return 'missing';
  }
  return isDeepStrictEqual(committed, served) ? 'unchanged' : 'changed';
}

export function describeRawStatus(
  status: RawSchemaStatus,
  fingerprintChanged: boolean,
): string | undefined {
  if (status === 'missing') {
    return 'No raw schema committed for this version yet. Run `pnpm run schema-snapshot --update` to add it.';
  }
  if (status === 'changed') {
    return fingerprintChanged
      ? 'The raw schema the API serves also differs from the committed one, so the backend changed this version.'
      : 'The raw schema the API serves differs from the committed one, but it does not change how the form behaves.';
  }
  return fingerprintChanged
    ? 'The raw schema the API serves is identical to the committed one, so this difference comes from how this library builds the form, not from the backend.'
    : undefined;
}

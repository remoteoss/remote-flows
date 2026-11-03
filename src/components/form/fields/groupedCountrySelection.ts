import { CountryOption } from '@/src/types/fields';

export function isGroupedCountryOptions(options?: CountryOption[]) {
  return Boolean(options?.some((option) => option.$meta?.type));
}

const stripPrefix = (value: string) =>
  value.replace(/^(region|subregion)-/, '');

/** The API returns saved values as display labels; swap them for option values. */
export function matchSavedCountryValues(
  value: unknown,
  options: CountryOption[],
) {
  const match = (item: unknown) =>
    options.find((option) => option.value === item || option.label === item)
      ?.value ?? item;
  return Array.isArray(value) ? value.map(match) : match(value);
}

/**
 * Choosing Global replaces everything, choosing a region drops its own
 * subregions and countries, and choosing anything narrower drops Global.
 */
export function applyGroupedCountryRules(
  previous: string[],
  next: string[],
  options: CountryOption[],
) {
  const byValue = (value: string) =>
    options.find((option) => option.value === value);
  const addedValue = next.find((value) => !previous.includes(value));
  const added = addedValue === undefined ? undefined : byValue(addedValue);
  const type = added?.$meta?.type;
  if (!added || !type) {
    return next;
  }
  if (type === 'global') {
    return [added.value];
  }

  const withoutGlobal = next.filter(
    (value) => byValue(value)?.$meta?.type !== 'global',
  );
  if (type !== 'region') {
    return withoutGlobal;
  }

  const regionName = stripPrefix(added.value);
  return withoutGlobal.filter((value) => {
    if (value === added.value) {
      return true;
    }
    const meta = byValue(value)?.$meta;
    return !(
      (meta?.type === 'subregion' || meta?.type === 'country') &&
      meta.region === regionName
    );
  });
}

import { CountryOption } from '@/src/types/fields';
import { JSFFields } from '@/src/types/remoteFlows';

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

/** Swaps saved display labels for option values on every grouped countries field. */
export function matchSavedCountryFields(
  fields: JSFFields,
  values: Record<string, unknown>,
) {
  const matched = { ...values };
  fields.forEach((field) => {
    const options = field.options as CountryOption[] | undefined;
    if (field.inputType === 'countries' && isGroupedCountryOptions(options)) {
      const name = field.name as string;
      matched[name] = matchSavedCountryValues(
        values[name],
        options as CountryOption[],
      );
    }
  });
  return matched;
}

/**
 * Same rules as Dragon's tax servicing countries field, applied to the whole
 * new selection so every added value is handled (select-all, paste):
 * Global replaces everything, a region drops its own subregions and countries,
 * and a subregion drops its own countries. A narrower option added while its
 * region or subregion is already selected is dropped, so the selection never
 * overlaps. Dragon also greys out such options; the default component does not.
 * Values that match no option are kept.
 */
export function applyGroupedCountryRules(
  next: string[],
  options: CountryOption[],
) {
  const byValue = (value: string) =>
    options.find((option) => option.value === value);
  const selected = next.map((value) => ({ value, option: byValue(value) }));

  const global = selected.find(
    ({ option }) => option?.$meta?.type === 'global',
  );
  if (global) {
    return [global.value];
  }

  const namesOf = (type: string) =>
    new Set(
      selected
        .filter(({ option }) => option?.$meta?.type === type)
        .map(({ value }) => stripPrefix(value)),
    );
  const regions = namesOf('region');
  const subregions = namesOf('subregion');

  return selected
    .filter(({ option }) => {
      const meta = option?.$meta;
      if (meta?.type === 'subregion') {
        return !(meta.region && regions.has(meta.region));
      }
      if (meta?.type === 'country') {
        const inRegion = meta.region && regions.has(meta.region);
        const inSubregion = meta.subregion && subregions.has(meta.subregion);
        return !inRegion && !inSubregion;
      }
      return true;
    })
    .map(({ value }) => value);
}

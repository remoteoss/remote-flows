import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit';
import { faker } from '@faker-js/faker';
import RandExp from 'randexp';
import { $TSFixMe } from '@/src/types/remoteFlows';

type FormValues = Record<string, unknown>;
type HeadlessFormOptions = NonNullable<
  Parameters<typeof createHeadlessForm>[1]
>;

export interface FieldOption {
  value: unknown;
  disabled?: boolean;
  meta?: { countryCode?: string };
}

export interface SeedField {
  name: string;
  inputType?: string;
  jsonType?: string | string[];
  required?: boolean;
  isVisible?: boolean;
  multiple?: boolean;
  deprecated?: unknown;
  readOnly?: boolean;
  options?: FieldOption[];
  const?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  fields?: SeedField[];
}

type FormErrors = Record<string, unknown>;

function isPlainObject(value: unknown): value is FormValues {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function acceptsType(field: SeedField, type: string): boolean {
  return Array.isArray(field.jsonType)
    ? field.jsonType.includes(type)
    : field.jsonType === type;
}

// x-jsf-logic-computedAttrs surface as a string naming the computed value, not the value.
function isComputedBinding(field: SeedField, value: unknown): boolean {
  return typeof value === 'string' && acceptsType(field, 'number');
}

function enabledOptions(options: FieldOption[]): FieldOption[] {
  const enabled = options.filter((o) => !o.disabled);
  return enabled.length > 0 ? enabled : options;
}

/** First option whose value/label reads as "no" - collapses conditional sub-fields (file
 * uploads, free-text detail boxes) that a generic filler can't produce plausible data for. */
export function preferNoOption(options: FieldOption[]): FieldOption {
  const pool = enabledOptions(options);
  return pool.find((o) => String(o.value).toLowerCase() === 'no') || pool[0];
}

function fakeNumber(
  field: SeedField,
  fallback: { min: number; max: number },
): number {
  const span = fallback.max - fallback.min;
  let min = Math.max(field.minimum ?? -Infinity, fallback.min);
  let max = Math.min(field.maximum ?? Infinity, fallback.max);
  if (min > max) {
    min = field.minimum ?? (field.maximum ?? fallback.max) - span;
    max = field.maximum ?? min + span;
  }
  if (min > max) {
    return min;
  }
  return faker.number.int({ min: Math.ceil(min), max: Math.floor(max) });
}

function fakeText(field: SeedField): string {
  if (field.pattern && field.pattern !== '\\S') {
    const randexp = new RandExp(field.pattern);
    randexp.randInt = (min, max) => faker.number.int({ min, max });
    const generated = randexp.gen();
    return field.maxLength ? generated.slice(0, field.maxLength) : generated;
  }
  let text =
    field.inputType === 'textarea'
      ? faker.lorem.sentence()
      : faker.lorem.words({ min: 2, max: 4 });
  while (text.length < (field.minLength ?? 0)) {
    text = `${text} ${faker.lorem.sentence()}`;
  }
  return field.maxLength ? text.slice(0, field.maxLength) : text;
}

function fakeDate(field: SeedField): string {
  // Some countries require more lead time than a fixed short offset
  // covers (e.g. Iceland: 20 working days, ~28 calendar days) - 35
  // calendar days clears that with margin. Doesn't dodge country-specific
  // holidays (e.g. Georgia) on its own; findSafeStartDate below seeds
  // provisional_start_date directly for that.
  const date = new Date();
  date.setDate(date.getDate() + 35);
  const iso = toIsoDate(date);
  if (field.minDate && iso < field.minDate) {
    return field.minDate;
  }
  if (field.maxDate && iso > field.maxDate) {
    return field.maxDate;
  }
  return iso;
}

export function fakeValueFor(field: SeedField, retry = false): unknown {
  const { inputType, options, multiple, name } = field;

  if (field.const !== undefined && !isComputedBinding(field, field.const)) {
    return field.const;
  }
  if (field.jsonType === 'null') {
    return null;
  }
  if (inputType === 'hidden') {
    return field.default ?? undefined;
  }
  if (
    !retry &&
    field.default !== undefined &&
    field.default !== null &&
    !isComputedBinding(field, field.default)
  ) {
    return field.default;
  }

  if (options?.length) {
    const pick = retry
      ? faker.helpers.arrayElement(enabledOptions(options))
      : preferNoOption(options);
    if (inputType === 'tel') {
      // options here are per-country dialing patterns (e.g. pattern:
      // '^(+49)[0-9]{6,}$', meta.countryCode: '49'), not user-facing choices -
      // any one produces a validly-formatted number, regardless of the
      // employment's own country.
      const option = options.find((o) => o.meta?.countryCode) || options[0];
      return `+${option.meta?.countryCode}${faker.string.numeric(9)}`;
    }
    if (inputType === 'countries' || multiple || acceptsType(field, 'array')) {
      return [pick.value];
    }
    return pick.value;
  }

  switch (inputType) {
    case 'email':
      return name === 'work_email'
        ? faker.internet.email({ provider: 'remote-e2e-test.com' })
        : faker.internet.email();
    case 'tel':
      return `+1${faker.string.numeric(9)}`;
    case 'date':
      return fakeDate(field);
    case 'number':
      return fakeNumber(
        field,
        retry ? { min: 1, max: 60 } : { min: 5, max: 30 },
      );
    case 'money':
      return fakeNumber(field, { min: 3_000_000, max: 8_000_000 });
    case 'checkbox':
      return true;
    case 'file':
      return null;
    default:
      return fakeText(field);
  }
}

const UNFILLED_FIELDS = new Set(['employer_acknowledges_risk']);

function fillFields(
  fields: SeedField[],
  values: FormValues,
  errors: FormErrors | undefined,
  locked: ReadonlySet<string>,
  skipped: Set<string>,
): FormValues {
  const next = { ...values };
  for (const field of fields) {
    if (
      !field.isVisible ||
      locked.has(field.name) ||
      UNFILLED_FIELDS.has(field.name)
    ) {
      continue;
    }
    const fieldError = errors?.[field.name];

    if (field.inputType === 'fieldset' && field.fields) {
      const current = next[field.name];
      next[field.name] = fillFields(
        field.fields,
        isPlainObject(current) && typeof fieldError !== 'string' ? current : {},
        isPlainObject(fieldError) ? fieldError : undefined,
        new Set(),
        skipped,
      );
      continue;
    }

    if (field.inputType === 'file') {
      if (field.required) {
        skipped.add(field.name);
      }
      continue;
    }
    if (next[field.name] !== undefined && fieldError === undefined) {
      continue;
    }
    if (
      (field.readOnly || field.deprecated) &&
      field.const === undefined &&
      fieldError === undefined
    ) {
      if (field.default !== undefined) {
        next[field.name] = field.default;
      }
      continue;
    }
    next[field.name] = fakeValueFor(field, fieldError !== undefined);
  }
  return next;
}

function keepVisibleValues(
  fields: SeedField[],
  values: FormValues,
  locked: ReadonlySet<string>,
): FormValues {
  const visible = new Map(
    fields.filter((f) => f.isVisible !== false).map((f) => [f.name, f]),
  );
  const kept: FormValues = {};
  for (const [name, value] of Object.entries(values)) {
    const field = visible.get(name);
    if (locked.has(name)) {
      kept[name] = value;
    } else if (field?.inputType === 'fieldset' && field.fields) {
      kept[name] = isPlainObject(value)
        ? keepVisibleValues(field.fields, value, new Set())
        : value;
    } else if (field && value !== undefined) {
      kept[name] = value;
    }
  }
  return kept;
}

export const SAFE_START_DATE_MIN_LEAD_DAYS = 35;
export const SAFE_START_DATE_SEARCH_WINDOW_DAYS = 60;
const START_WEEKDAYS = new Set([1, 2, 3, 4]);

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Years to fetch public holidays for, covering the whole
 * [minLeadDays, minLeadDays + windowDays] candidate range. */
export function safeStartDateYears(
  minLeadDays = SAFE_START_DATE_MIN_LEAD_DAYS,
  windowDays = SAFE_START_DATE_SEARCH_WINDOW_DAYS,
): string[] {
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + minLeadDays);
  const latest = new Date();
  latest.setDate(latest.getDate() + minLeadDays + windowDays);
  return [
    String(earliest.getUTCFullYear()),
    ...(latest.getUTCFullYear() !== earliest.getUTCFullYear()
      ? [String(latest.getUTCFullYear())]
      : []),
  ];
}

/**
 * Picks the earliest date at least `minLeadDays` out that isn't in
 * `holidayDates` - a fixed offset alone isn't enough: with ~90 countries
 * checked nightly, some will always land on one of their own holidays by
 * chance (real data: CYP/CZE/GRC/GEO all hit "cannot be in a holiday" in a
 * single schema-canary run). Only Monday-Thursday is considered because
 * Tiger blocks some weekdays per country (ISL: Friday/Saturday, much of
 * LATAM: Saturday/Sunday) and the public API doesn't expose that table.
 * Falls back to the unchecked minimum-lead date if nothing in the search
 * window qualifies.
 */
export function pickSafeDate(
  holidayDates: ReadonlySet<string>,
  minLeadDays = SAFE_START_DATE_MIN_LEAD_DAYS,
  windowDays = SAFE_START_DATE_SEARCH_WINDOW_DAYS,
): string {
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + minLeadDays);
  const latest = new Date();
  latest.setDate(latest.getDate() + minLeadDays + windowDays);

  const candidate = new Date(earliest);
  while (candidate <= latest) {
    const iso = toIsoDate(candidate);
    if (START_WEEKDAYS.has(candidate.getUTCDay()) && !holidayDates.has(iso)) {
      return iso;
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return toIsoDate(earliest);
}

export type HolidayDate = { day: string; observed_day?: string | null };

/** Picks a holiday-free provisional_start_date for `country` with
 * pickSafeDate. A year whose holidays lookup fails is skipped rather than
 * discarding the years that did load. */
export async function findSafeStartDate(
  country: string,
  fetchHolidays: (country: string, year: string) => Promise<HolidayDate[]>,
): Promise<string> {
  const holidayDates = new Set<string>();
  for (const year of safeStartDateYears()) {
    try {
      for (const holiday of await fetchHolidays(country, year)) {
        holidayDates.add(holiday.day);
        if (holiday.observed_day) {
          holidayDates.add(holiday.observed_day);
        }
      }
    } catch (error) {
      console.warn(`Could not load ${year} holidays for ${country}:`, error);
    }
  }
  return pickSafeDate(holidayDates);
}

export type FillSchemaResult = {
  values: FormValues;
  skipped: string[];
  errors: FormErrors;
};

/** Fills every visible field except `employer_acknowledges_risk`, then validates and regenerates only the fields that failed,
 * until the form has no errors or `maxAttempts` runs out. Each pass rebuilds the form so
 * fields that a new value makes visible (or hidden) are picked up. Required file fields
 * can't be faked: they are reported in `skipped` and left out of `errors`. Seed values are
 * kept as given. The same `seed` always produces the same values for the same schema. */
export function fillSchema(
  schema: Parameters<typeof createHeadlessForm>[0],
  seedValues: FormValues = {},
  { maxAttempts = 50, seed }: { maxAttempts?: number; seed?: number } = {},
): FillSchemaResult {
  if (seed === undefined) {
    return fill(schema, seedValues, maxAttempts);
  }
  faker.seed(seed);
  try {
    return fill(schema, seedValues, maxAttempts);
  } finally {
    faker.seed();
  }
}

function fill(
  schema: Parameters<typeof createHeadlessForm>[0],
  seedValues: FormValues,
  maxAttempts: number,
): FillSchemaResult {
  const build = (values: FormValues) =>
    createHeadlessForm(schema, {
      initialValues: values as HeadlessFormOptions['initialValues'],
    });
  const locked = new Set(Object.keys(seedValues));
  const skipped = new Set<string>();
  let values: FormValues = { ...seedValues };
  let errors: FormErrors | undefined;
  let fields: SeedField[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    values = fillFields(
      build(values).fields as unknown as SeedField[],
      values,
      errors,
      locked,
      skipped,
    );
    const form = build(values);
    fields = form.fields as unknown as SeedField[];
    errors = Object.fromEntries(
      Object.entries(
        (form.handleValidation(values as $TSFixMe).formErrors ??
          {}) as FormErrors,
      ).filter(([name]) => !skipped.has(name)),
    );
    if (Object.keys(errors).length === 0) {
      break;
    }
  }

  return {
    values: keepVisibleValues(fields, values, locked),
    skipped: [...skipped],
    errors: errors ?? {},
  };
}

import { createHeadlessForm } from '@remoteoss/remote-json-schema-form-kit';
import { faker } from '@faker-js/faker';

type FormValues = Record<string, unknown>;
type HeadlessFormOptions = NonNullable<
  Parameters<typeof createHeadlessForm>[1]
>;

export interface FieldOption {
  value: unknown;
  meta?: { countryCode?: string };
}

export interface SeedField {
  name: string;
  inputType?: string;
  required?: boolean;
  isVisible?: boolean;
  multiple?: boolean;
  options?: FieldOption[];
  const?: unknown;
}

/** First option whose value/label reads as "no" - collapses conditional sub-fields (file
 * uploads, free-text detail boxes) that a generic filler can't produce plausible data for. */
export function preferNoOption(options: FieldOption[]): FieldOption {
  return (
    options.find((o) => String(o.value).toLowerCase() === 'no') || options[0]
  );
}

export function fakeValueFor(field: SeedField): unknown {
  const { inputType, options, multiple, name, const: constValue } = field;

  if (options?.length) {
    if (inputType === 'radio' || inputType === 'select') {
      return preferNoOption(options).value;
    }
    if (inputType === 'countries' || multiple) {
      return [faker.helpers.arrayElement(options).value];
    }
    if (inputType === 'tel') {
      // options here are per-country dialing patterns (e.g. pattern:
      // '^(+49)[0-9]{6,}$', meta.countryCode: '49'), not user-facing choices -
      // any one produces a validly-formatted number, regardless of the
      // employment's own country.
      const option = options.find((o) => o.meta?.countryCode) || options[0];
      return `+${option.meta?.countryCode}${faker.string.numeric(9)}`;
    }
    return preferNoOption(options).value;
  }

  switch (inputType) {
    case 'email':
      return name === 'work_email'
        ? faker.internet.email({ provider: 'remote-e2e-test.com' })
        : faker.internet.email();
    case 'tel':
      return `+1${faker.string.numeric(9)}`;
    case 'date': {
      // Some countries require more lead time than a fixed short offset
      // covers (e.g. Iceland: 20 working days, ~28 calendar days) - 35
      // calendar days clears that with margin. Doesn't dodge country-specific
      // holidays (e.g. Georgia) on its own; seed-onboarding.ts's
      // findSafeStartDate seeds provisional_start_date directly for that.
      const d = new Date();
      d.setDate(d.getDate() + 35);
      return d.toISOString().slice(0, 10);
    }
    case 'number':
      return faker.number.int({ min: 5, max: 30 });
    case 'money':
      return faker.number.int({ min: 3_000_000, max: 8_000_000 });
    case 'textarea':
      return faker.lorem.sentence();
    case 'checkbox':
      // No enumerated options: this is a single acknowledgement toggle. RHF
      // holds a plain `true` here, which parseFormValuesToAPI (src/components/
      // form/utils.ts) swaps for `field.const` (e.g. "acknowledged") at submit
      // time when the schema is const-based - mirror that instead of sending
      // the raw RHF value, or the API rejects it as a type mismatch.
      return constValue ?? true;
    case 'file':
      return null;
    default:
      return faker.lorem.words({ min: 2, max: 4 });
  }
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

/** Progressively fills a JSF schema: fill whatever's required+visible, recompute (new
 * conditionally-required fields may appear), repeat until stable. Mirrors what the real
 * multi-step form does field-by-field, but against the schema directly instead of the DOM. */
export function fillSchema(
  schema: Parameters<typeof createHeadlessForm>[0],
  seedValues: FormValues = {},
): { values: FormValues; skipped: string[] } {
  const values: FormValues = { ...seedValues };
  const skipped: string[] = [];
  for (let round = 0; round < 8; round++) {
    const { fields } = createHeadlessForm(schema, {
      initialValues: values as HeadlessFormOptions['initialValues'],
    });
    const missing = (fields as unknown as SeedField[]).filter(
      (f) => f.required && f.isVisible && values[f.name] === undefined,
    );
    if (missing.length === 0) break;
    for (const field of missing) {
      if (field.inputType === 'file') {
        skipped.push(field.name);
        continue;
      }
      values[field.name] = fakeValueFor(field);
    }
  }
  return { values, skipped };
}

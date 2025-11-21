import { getSingularPluralUnit } from '@/src/lib/i18n';
import { format } from 'date-fns';

export type DaysAndHours = {
  hours: number;
  days: number;
};
type FormatDaysAndHoursSuffixFormat = 'short' | 'long';

const DEFAULT_SUFFIX_FORMAT: FormatDaysAndHoursSuffixFormat = 'long';

/**
 * Threshold below which decimal day values should be displayed in hours instead
 * of days. Very small day values are more meaningful when shown as hours.
 */
const DECIMAL_DAYS_DISPLAY_THRESHOLD = 0.01;

/**
 * Default number of hours in a work day.
 */
const DEFAULT_WORK_HOURS = 8;

/**
 * Default number of decimal places to round to.
 */
const DEFAULT_DECIMAL_PLACES = 3;

/**
 * Determines whether a decimal day value should be displayed as hours for
 * better readability.
 */
function shouldDisplayAsHours(decimal: number): boolean {
  return Math.abs(decimal) < DECIMAL_DAYS_DISPLAY_THRESHOLD && decimal !== 0;
}

/**
 * Converts days and hours into a decimal representation.
 * Designed to handle integer hours (-7 to 7) and future integer minutes (-59 to 59).
 *
 * @example
 * getDaysAndHoursAsDecimal({ days: 1, hours: 4 }) // 1.5
 * getDaysAndHoursAsDecimal({ days: 0, hours: 3 }) // 0.375
 */
function getDaysAndHoursAsDecimal({ days, hours }: DaysAndHours): number {
  return days + hours / DEFAULT_WORK_HOURS;
}

/**
 * Rounds a number to 2 decimal places using symmetric rounding (away from zero).
 */
function roundToDecimals(value: number): number {
  const multiplier = 10 ** DEFAULT_DECIMAL_PLACES;

  // Math.round() uses "Round half toward positive infinity", so we round using
  // absolute value to achieve symmetric rounding
  const rounded = Math.round(Math.abs(value) * multiplier) / multiplier;
  // preserve original sign
  return value < 0 ? -rounded : rounded;
}

/**
 * Formats a time duration as hours with the specified suffix format.
 */
function formatAsHours(
  hours: number,
  suffixFormat: FormatDaysAndHoursSuffixFormat,
): string {
  const roundedHours = roundToDecimals(hours);

  if (suffixFormat === 'short') return `${roundedHours}h`;

  const hoursText = getSingularPluralUnit({
    number: hours,
    singular: 'hour',
    plural: 'hours',
    followCopyGuidelines: false,
    showNumber: false,
  });
  return `${roundedHours} ${hoursText}`;
}

/**
 *  Converts days and hours into total hours based on standard work day
 */
export function convertToTotalHours(days: number, hours: number): number {
  return days * DEFAULT_WORK_HOURS + hours;
}

export function convertTotalHoursToDaysAndHours(
  totalHours: number,
): DaysAndHours {
  return {
    days: Math.floor(totalHours / DEFAULT_WORK_HOURS),
    hours: totalHours % DEFAULT_WORK_HOURS,
  };
}

/**
 * Formats a time duration as decimal days with the specified suffix format.
 */
function formatAsDays(
  decimal: number,
  suffixFormat: FormatDaysAndHoursSuffixFormat,
): string {
  const roundedDecimal = roundToDecimals(decimal);

  if (suffixFormat === 'short') return `${roundedDecimal}d`;

  const daysText = getSingularPluralUnit({
    number: decimal,
    singular: 'day',
    plural: 'days',
    followCopyGuidelines: false,
    showNumber: false,
  });
  return `${roundedDecimal} ${daysText}`;
}

/**
 * Converts time off quantities into decimal format for display.
 *
 * Always returns a formatted decimal string with appropriate units.
 * Useful when you need a precise decimal representation of any time duration.
 *
 * @example
 * formatAsDecimal({ days: 1, hours: 4 }) // "1.5 days"
 * formatAsDecimal({ days: 2, hours: 0 }) // "2 days"
 * formatAsDecimal({ days: 0, hours: -3 }) // "-0.38 days"
 */
export function formatAsDecimal(
  daysAndHours: DaysAndHours,
  suffixFormat: FormatDaysAndHoursSuffixFormat = DEFAULT_SUFFIX_FORMAT,
): string {
  const decimal = getDaysAndHoursAsDecimal(daysAndHours);

  if (shouldDisplayAsHours(decimal)) {
    return formatAsHours(
      convertToTotalHours(daysAndHours.days, daysAndHours.hours),
      suffixFormat,
    );
  }

  return formatAsDays(decimal, suffixFormat);
}

export function clampNegativeValuesIfApplicable(
  daysAndHours: DaysAndHours,
): DaysAndHours {
  return {
    days: Math.max(daysAndHours.days, 0),
    hours: Math.max(daysAndHours.hours, 0),
  };
}

export const formatMonthDayInLocalTime = (datetime: Date) =>
  format(datetime, 'MMM d');

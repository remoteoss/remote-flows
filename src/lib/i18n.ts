import isNil from 'lodash/isNil';

type Locale = keyof typeof copyAdjustedNumbers;

const LOCALE_DEFAULT = 'en';

/**
 * Copy adjusted numbers for the default locale
 */
const copyAdjustedNumbers: Record<string, string[]> = {
  en: [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
  ],
};

/**
 * Get text for a number in accordance with our copywriting guidelines
 * @param {number} number The number
 * @param {string} [locale=en] The locale
 * @returns {string} The text for the number
 */
function getCopyAdjustedNumber(
  number: number,
  locale = LOCALE_DEFAULT,
): string {
  const localeCopyAdjustedNumbers = copyAdjustedNumbers[locale];
  const totalLocaleCopyAdjustedNumbers = Object.keys(
    localeCopyAdjustedNumbers,
  ).length;

  return Number.isInteger(number) &&
    number > 0 &&
    number <= totalLocaleCopyAdjustedNumbers
    ? localeCopyAdjustedNumbers[number - 1]
    : number.toString();
}

/**
 * Get the singular/plural variant for a given number
 */
export function getSingularPluralUnit({
  number,
  singular,
  plural,
  followCopyGuidelines = true,
  showNumber = true,
  locale = LOCALE_DEFAULT,
}: {
  /**
   * The number
   */
  number?: number | null;
  /**
   * The singular variant of the unit
   * */
  singular?: string;
  /**
   * The plural variant of the unit
   * */
  plural?: string;
  /**
   * Should numbers be transformed according to copywriting guidelines
   * @default true
   */
  followCopyGuidelines?: boolean;
  /**
   * Should final text display the number or just the singular/plural variant
   * @default true
   */
  showNumber?: boolean;
  /**
   * The locale
   * @default "en"
   */
  locale?: Locale;
}) {
  if (isNil(number) || !singular || !plural) {
    return '';
  }

  const currentNumber = followCopyGuidelines
    ? getCopyAdjustedNumber(number, locale)
    : number.toString();
  const currentVariant = number === 1 || number === -1 ? singular : plural;

  return showNumber ? `${currentNumber} ${currentVariant}` : currentVariant;
}

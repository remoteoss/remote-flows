import { Employment, OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'benefits'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: {
    index: 0,
    name: 'select_country',
  },
  basic_information: { index: 1, name: 'basic_information' },
  contract_details: { index: 2, name: 'contract_details' },
  benefits: { index: 3, name: 'benefits' },
  review: { index: 4, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  contract_details: { index: 1, name: 'contract_details' },
  benefits: { index: 2, name: 'benefits' },
  review: { index: 3, name: 'review' },
} as const;

/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
export const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];

export const disabledInviteButtonEmploymentStatus: Employment['status'][] = [
  'created_awaiting_reserve',
  'invited',
];

export const DEFAULT_VERSION = 1;
export const BASIC_INFORMATION_SCHEMA_VERSION = DEFAULT_VERSION;

/**
 * Defines allowed JSON schema versions per country for contract_details
 * Key: country code, Value: array of allowed versions (first is default/recommended)
 */
const COUNTRY_CONTRACT_DETAILS_VERSION_ALLOWLIST: Record<string, number[]> = {
  DEU: [1, 2], // Germany: allows v1 (default) and v2
};

/**
 * Gets the default (recommended) contract details schema version for a country
 */
const getDefaultContractDetailsSchemaVersion = (
  countryCode: string | null,
): number => {
  if (!countryCode) return DEFAULT_VERSION;
  const allowedVersions =
    COUNTRY_CONTRACT_DETAILS_VERSION_ALLOWLIST[countryCode];
  return allowedVersions?.[0] ?? DEFAULT_VERSION; // First version is the default
};

/**
 * Validates if a version is allowed for a given country
 * Returns the version if valid, otherwise returns the default
 */
const getValidatedContractDetailsSchemaVersion = (
  requestedVersion: number | undefined,
  countryCode: string | null,
): number => {
  const defaultVersion = getDefaultContractDetailsSchemaVersion(countryCode);

  // If there is no country code, no allowlist for country, or no requested version, return the default version
  if (
    !countryCode ||
    !COUNTRY_CONTRACT_DETAILS_VERSION_ALLOWLIST[countryCode] ||
    !requestedVersion
  ) {
    return defaultVersion;
  }

  const allowedVersions =
    COUNTRY_CONTRACT_DETAILS_VERSION_ALLOWLIST[countryCode];

  // Check if requested version is allowed
  if (allowedVersions.includes(requestedVersion)) {
    return requestedVersion;
  }

  // Version not allowed, return default with console warning
  console.warn(
    `[RemoteFlows] JSON Schema version ${requestedVersion} is not allowed for country ${countryCode}. ` +
      `Allowed versions: [${allowedVersions.join(', ')}]. Using default version ${defaultVersion}.`,
  );

  return defaultVersion;
};

/**
 * Resolves the effective contract details schema version for a country
 * Priority: country-specific > global > default by country
 *
 * @param options - The flow options containing version configurations
 * @param countryCode - The country code to resolve version for
 * @returns The effective jsonSchemaVersion configuration
 */
export const getContractDetailsSchemaVersion = (
  options: OnboardingFlowProps['options'],
  countryCode: string | null,
) => {
  const jsonSchemaVersionByCountry = options?.jsonSchemaVersionByCountry;
  const countrySpecificVersion = countryCode
    ? jsonSchemaVersionByCountry?.[countryCode]?.contract_details
    : undefined;

  const requestedVersion = countrySpecificVersion
    ? countrySpecificVersion
    : getDefaultContractDetailsSchemaVersion(countryCode);
  const effectiveVersion = getValidatedContractDetailsSchemaVersion(
    requestedVersion,
    countryCode,
  );

  return effectiveVersion;
};

import { Employment, OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { Step } from '@/src/flows/useStepState';

export type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'engagement_agreement_details'
  | 'contract_details'
  | 'benefits'
  | 'review';

type StepConfig = {
  includeSelectCountry?: boolean;
  includeEngagementAgreementDetails?: boolean;
};

export function buildSteps(config: StepConfig = {}) {
  const stepDefinitions: Array<{
    name: StepKeys;
    label: string;
    visible: boolean;
  }> = [
    {
      name: 'select_country',
      label: 'Select Country',
      visible: Boolean(config?.includeSelectCountry),
    },
    {
      name: 'basic_information',
      label: 'Basic Information',
      visible: true,
    },
    {
      name: 'engagement_agreement_details',
      label: 'Engagement Agreement Details',
      visible: Boolean(config?.includeEngagementAgreementDetails),
    },
    {
      name: 'contract_details',
      label: 'Contract Details',
      visible: true,
    },
    {
      name: 'benefits',
      label: 'Benefits',
      visible: true,
    },
    {
      name: 'review',
      label: 'Review',
      visible: true,
    },
  ];

  const stepsArray = stepDefinitions.map((step, index) => ({
    name: step.name,
    index,
    label: step.label,
    visible: step.visible,
  }));

  const steps = stepsArray.reduce(
    (acc, step) => {
      acc[step.name] = {
        index: step.index,
        name: step.name,
        visible: step.visible,
      };
      return acc;
    },
    {} as Record<string, Step<StepKeys>>,
  );

  return { steps, stepsArray };
}

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

/**
 * Gets the default (recommended) contract details schema version for a country
 */
const getDefaultContractDetailsSchemaVersion = (): number => {
  return DEFAULT_VERSION;
};

/**
 * Resolves the effective contract details schema version for a country
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
    : getDefaultContractDetailsSchemaVersion();

  return requestedVersion;
};

/**
 * Gets the basic information schema version from options
 * @param options - The flow options containing version configurations
 * @returns The jsonSchemaVersion for basic information or default
 */
export const getBasicInformationSchemaVersion = (
  options: OnboardingFlowProps['options'],
): number | 'latest' => {
  return (
    options?.jsonSchemaVersion?.employment_basic_information || DEFAULT_VERSION
  );
};

/**
 * Gets the benefit offers schema version from options
 * @param options - The flow options containing version configurations
 * @returns The jsonSchemaVersion for benefit offers or undefined if not set
 */
export const getBenefitOffersSchemaVersion = (
  options: OnboardingFlowProps['options'],
): number | 'latest' => {
  return (
    options?.jsonSchemaVersion?.benefit_offers_form_schema || DEFAULT_VERSION
  );
};

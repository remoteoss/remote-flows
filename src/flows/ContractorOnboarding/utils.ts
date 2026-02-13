import { Step } from '@/src/flows/useStepState';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
} from '@/src/flows/ContractorOnboarding/constants';
import { Employment } from '@/src/flows/Onboarding/types';

export type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'eligibility_questionnaire'
  | 'contract_preview'
  | 'pricing_plan'
  | 'review';

type StepConfig = {
  includeSelectCountry?: boolean;
  includeEligibilityQuestionnaire?: boolean;
};

export function buildSteps(config: StepConfig = {}) {
  const stepDefinitions: Array<{
    name: StepKeys;
    label: string;
    include: boolean;
  }> = [
    {
      name: 'select_country',
      label: 'Select Country',
      include: Boolean(config?.includeSelectCountry),
    },
    {
      name: 'basic_information',
      label: 'Basic Information',
      include: true,
    },
    {
      name: 'pricing_plan',
      label: 'Pricing Plan',
      include: true,
    },
    {
      name: 'eligibility_questionnaire',
      label: 'Eligibility Questionnaire',
      include: Boolean(config?.includeEligibilityQuestionnaire),
    },
    {
      name: 'contract_details',
      label: 'Contract Details',
      include: true,
    },
    {
      name: 'contract_preview',
      label: 'Contract Preview',
      include: true,
    },
    {
      name: 'review',
      label: 'Review',
      include: true,
    },
  ];

  const activeSteps = stepDefinitions.filter((step) => step.include);

  const stepsArray = activeSteps.map((step, index) => ({
    name: step.name,
    index,
    label: step.label,
  }));

  const steps = stepsArray.reduce(
    (acc, step) => {
      acc[step.name] = { index: step.index, name: step.name };
      return acc;
    },
    {} as Record<string, Step<StepKeys>>,
  );

  return { steps, stepsArray };
}

/**
 * Calculates the description for the provisional start date field
 * based on whether the dates match between basic information and contract details steps
 */
export const calculateProvisionalStartDateDescription = (
  employmentProvisionalStartDate: string | undefined,
  fieldProvisionalStartDate: string | undefined,
): string | undefined => {
  const datesNotMatching =
    employmentProvisionalStartDate &&
    fieldProvisionalStartDate &&
    employmentProvisionalStartDate !== fieldProvisionalStartDate;

  if (datesNotMatching) {
    const datesDontMatchWarning = `This date does not match the date you provided in the Basic Information step - ${
      employmentProvisionalStartDate
    } - and will override it only when both parties have signed the contract.`;
    return `When the contractor will start providing service to your company. ${datesDontMatchWarning}`;
  }
  return undefined;
};

/**
 * Checks if the selected pricing plan is CM (standard) or CM+ (plus)
 */
export const isCMOrCMPlus = (subscription: string | undefined): boolean => {
  return (
    subscription === contractorStandardProductIdentifier ||
    subscription === contractorPlusProductIdentifier
  );
};

/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
export const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'invited',
];

export const disabledInviteButtonEmploymentStatus: Employment['status'][] = [
  'invited',
];

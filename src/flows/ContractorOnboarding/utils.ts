import { Step } from '@/src/flows/useStepState';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
} from '@/src/flows/ContractorOnboarding/constants';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'contract_preview'
  | 'pricing_plan'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
  basic_information: { index: 1, name: 'basic_information' },
  pricing_plan: { index: 2, name: 'pricing_plan' },
  contract_details: { index: 3, name: 'contract_details' },
  contract_preview: { index: 4, name: 'contract_preview' },
  review: { index: 5, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  pricing_plan: { index: 1, name: 'pricing_plan' },
  contract_details: { index: 2, name: 'contract_details' },
  contract_preview: { index: 3, name: 'contract_preview' },
  review: { index: 4, name: 'review' },
} as const;

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

const NATIONALITY_COUNTRY_CODES = ['SAU', 'KWT', 'OMN', 'QAT'];

/**
 * Checks if the country code is a country code that requires nationality status field
 */
export const isNationalityCountryCode = (countryCode: string) => {
  return NATIONALITY_COUNTRY_CODES.includes(countryCode);
};

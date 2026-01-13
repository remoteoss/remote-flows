import { format } from 'date-fns';
import { JSFModify } from '@/src/flows/types';
import { Step } from '@/src/flows/useStepState';
import { FieldValues } from 'react-hook-form';
import { createStatementProperty } from '@/src/components/form/jsf-utils/createFields';
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

const isStandardPricingPlan = (pricingPlan: string | undefined) => {
  return pricingPlan === contractorStandardProductIdentifier;
};

const showBackDateWarning = (
  isStandardPricingPlanSelected: boolean,
  provisionalStartDate: string | undefined,
) => {
  const isStartDateBackdated =
    provisionalStartDate &&
    // Compare full days omitting time of the day
    provisionalStartDate < format(new Date(), 'yyyy-MM-dd');

  if (!isStandardPricingPlanSelected && isStartDateBackdated) {
    return createStatementProperty({
      severity: 'warning',
      description:
        'Backdating the service start date is not supported in the selected Contractor Management plan.',
    });
  }

  return undefined;
};
/**
 * Merges internal jsfModify modifications with user-provided options for contract_details step
 * This abstracts the logic of applying internal field modifications (like dynamic descriptions)
 * while preserving user customizations
 */
export const buildContractDetailsJsfModify = (
  userJsfModify: JSFModify | undefined,
  provisionalStartDateDescription: string | undefined,
  selectedPricingPlan: string | undefined,
  fieldValues: FieldValues,
): JSFModify => {
  const isStandardPricingPlanSelected =
    isStandardPricingPlan(selectedPricingPlan);
  const provisionalStartDate =
    fieldValues?.service_duration?.provisional_start_date;
  const statement = showBackDateWarning(
    isStandardPricingPlanSelected,
    provisionalStartDate,
  );
  return {
    ...userJsfModify,
    fields: {
      ...userJsfModify?.fields,
      ...{
        'service_duration.provisional_start_date': {
          description: provisionalStartDateDescription,
          'x-jsf-presentation': {
            minDate: !isStandardPricingPlanSelected
              ? format(new Date(), 'yyyy-MM-dd')
              : undefined,
            ...statement,
          },
        },
      },
    },
  };
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

import { JSFModify } from '@/src/flows/types';
import { Step } from '@/src/flows/useStepState';

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
  contract_details: { index: 2, name: 'contract_details' },
  contract_preview: { index: 3, name: 'contract_preview' },
  pricing_plan: { index: 4, name: 'pricing_plan' },
  review: { index: 5, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  contract_details: { index: 1, name: 'contract_details' },
  contract_preview: { index: 2, name: 'contract_preview' },
  pricing_plan: { index: 3, name: 'pricing_plan' },
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
 * Merges internal jsfModify modifications with user-provided options for contract_details step
 * This abstracts the logic of applying internal field modifications (like dynamic descriptions)
 * while preserving user customizations
 */
export const buildContractDetailsJsfModify = (
  userJsfModify: JSFModify | undefined,
  provisionalStartDateDescription: string | undefined,
): JSFModify => {
  return {
    ...userJsfModify,
    fields: {
      ...userJsfModify?.fields,
      ...(provisionalStartDateDescription
        ? {
            'service_duration.provisional_start_date': {
              description: provisionalStartDateDescription,
            },
          }
        : {}),
    },
  };
};

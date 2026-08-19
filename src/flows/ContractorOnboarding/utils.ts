import { Step } from '@/src/flows/useStepState';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
  ProductType,
  PRODUCT_IDENTIFIER_MAP,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE,
} from '@/src/flows/ContractorOnboarding/constants';
import { Employment } from '@/src/flows/Onboarding/types';

export type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_origin'
  | 'invoice_schedule'
  | 'create_invoice_schedule'
  | 'contract_details'
  | 'eligibility_questionnaire'
  | 'contract_preview'
  | 'pricing_plan'
  | 'review';

type StepConfig = {
  includeSelectCountry?: boolean;
  includeContractOrigin?: boolean;
  includeInvoiceSchedule?: boolean;
  includeCreateInvoiceSchedule?: boolean;
  includeEligibilityQuestionnaire?: boolean;
  includeContractDetails?: boolean;
  includeContractPreview?: boolean;
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
      name: 'pricing_plan',
      label: 'Pricing Plan',
      visible: true,
    },
    {
      name: 'eligibility_questionnaire',
      label: 'Eligibility Questionnaire',
      visible: Boolean(config?.includeEligibilityQuestionnaire),
    },
    {
      name: 'contract_origin',
      label: 'Contract Options',
      visible: Boolean(config?.includeContractOrigin ?? true),
    },
    {
      name: 'contract_details',
      label: 'Contract Details',
      visible: Boolean(config?.includeContractDetails ?? true),
    },
    {
      name: 'contract_preview',
      label: 'Contract Preview',
      visible: Boolean(config?.includeContractPreview),
    },
    {
      name: 'invoice_schedule',
      label: 'Invoice schedule',
      visible: Boolean(config?.includeInvoiceSchedule),
    },
    {
      name: 'create_invoice_schedule',
      label: 'Create Invoice Schedule',
      visible: Boolean(config?.includeCreateInvoiceSchedule),
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

const NATIONALITY_COUNTRY_CODES = ['SAU', 'KWT', 'OMN', 'QAT', 'BHR'];

/**
 * Checks if the country code is a country code that requires nationality status field
 */
export const isNationalityCountryCode = (countryCode: string) => {
  return NATIONALITY_COUNTRY_CODES.includes(countryCode);
};

/**
 * Checks if a product should be included based on the excludeProducts list
 * @param productIdentifier - The product identifier to check
 * @param excludeProducts - Array of products to exclude
 * @returns true if the product should be included, false otherwise
 */
export const shouldIncludeProduct = (
  productIdentifier: string,
  excludeProducts?: ProductType[],
): boolean => {
  if (!excludeProducts || excludeProducts.length === 0) {
    return true;
  }

  return !excludeProducts.some(
    (excluded) => PRODUCT_IDENTIFIER_MAP[excluded] === productIdentifier,
  );
};

/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
export const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'initiated',
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
  'active',
];

export const disabledInviteButtonEmploymentStatus: Employment['status'][] = [
  'initiated',
  'created_awaiting_reserve',
  'invited',
  'active',
];

/**
 * Transforms AI error messages to use default localized messages
 * @param isContractorOfRecord - Whether the contractor is a Contractor of Record
 * @param errors - Array of error messages from the API
 * @returns Array containing the appropriate default error message
 */
export function transformAiErrorResponse(
  isContractorOfRecord: boolean,
): string {
  const remoteAiErrorMessage = isContractorOfRecord
    ? REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE
    : REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE;
  return remoteAiErrorMessage;
}

const DEFAULT_VERSION = 1;

/**
 * Gets the basic information schema version from options
 * @param options - The flow options containing version configurations
 * @returns The jsonSchemaVersion for basic information or default (1)
 */
export const getBasicInformationSchemaVersion = (options?: {
  jsonSchemaVersion?: { employment_basic_information?: number | 'latest' };
}): number | 'latest' => {
  return (
    options?.jsonSchemaVersion?.employment_basic_information || DEFAULT_VERSION
  );
};

/**
 * Builds invoice items array from form values
 * Collects up to 10 invoice items (item_1 through item_10)
 * @param values - Form values containing item_N_description and item_N_amount fields
 * @returns Array of invoice items with description and amount
 */
export function buildInvoiceItems(values: Record<string, unknown>) {
  const items = [];
  for (let i = 1; i <= 10; i++) {
    const description = values[`item_${i}_description`];
    const amount = values[`item_${i}_amount`];
    if (description && amount != null) {
      items.push({
        description,
        amount: Number(amount),
      });
    }
  }
  return items;
}

/**
 * Builds the base invoice schedule payload from form values
 * @param values - Form values containing invoice schedule data
 * @returns Invoice schedule payload object
 */
export function buildInvoiceSchedulePayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    currency: values.currency,
    periodicity: values.periodicity,
    start_date: values.start_date,
    items: buildInvoiceItems(values),
  };

  if (values.number) {
    payload.number = values.number;
  }

  if (values.note) {
    payload.note = values.note;
  }

  if (values.nr_occurrences) {
    payload.nr_occurrences = Number(values.nr_occurrences);
  }

  return payload;
}

import { Step } from '@/src/flows/useStepState';
import {
  ProductType,
  PRODUCT_IDENTIFIER_MAP,
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

// Invoice-schedule payload builders are shared with the standalone InvoiceSchedule flow and
// live in src/common/invoice-schedules. Re-exported here so existing imports keep resolving.
export {
  buildInvoiceItems,
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
} from '@/src/common/invoice-schedules/utils';

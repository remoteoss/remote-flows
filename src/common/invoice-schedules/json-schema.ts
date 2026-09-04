import {
  INVOICE_ITEM_SLOTS,
  ONE_TIME_PERIODICITY_OPTION,
  RECURRING_PERIODICITY_OPTIONS,
} from '@/src/common/invoice-schedules/constants';

function invoiceItemProperties() {
  const properties: Record<string, object> = {};

  for (let slot = 1; slot <= INVOICE_ITEM_SLOTS; slot++) {
    properties[`item_${slot}_description`] = {
      title: `Item ${slot} description`,
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'text',
      },
    };
    properties[`item_${slot}_amount`] = {
      title: `Item ${slot} amount`,
      type: 'integer',
      'x-jsf-presentation': {
        inputType: 'money',
      },
      'x-jsf-logic-computedAttrs': {
        'x-jsf-presentation': {
          additionalProps: {
            currency: 'currency_selected',
          },
        },
      },
    };
  }

  return properties;
}

// Slot 1 is required (see the base required array below).
// Slots 2..N are optional and only revealed once the previous slot has been filled in,
// since the form-kit has no built-in "add another row" renderer for a true items array.
function invoiceItemRevealConditionals() {
  const conditionals = [];

  for (let slot = 2; slot <= INVOICE_ITEM_SLOTS; slot++) {
    const previousSlot = slot - 1;

    conditionals.push({
      if: {
        properties: {
          [`item_${previousSlot}_description`]: {
            type: 'string',
            minLength: 1,
          },
          [`item_${previousSlot}_amount`]: { type: 'integer', minimum: 1 },
        },
        required: [
          `item_${previousSlot}_description`,
          `item_${previousSlot}_amount`,
        ],
      },
      then: {},
      else: {
        properties: {
          [`item_${slot}_description`]: false,
          [`item_${slot}_amount`]: false,
        },
      },
    });
  }

  return conditionals;
}

// The two custom-day fields only mean anything for a semi-monthly schedule; the API rejects
// them for any other periodicity. Hide them unless semi-monthly is selected.
function semiMonthlyConditional() {
  return {
    if: {
      properties: { periodicity: { const: 'semi_monthly' } },
      required: ['periodicity'],
    },
    then: {},
    else: {
      properties: {
        custom_day_1: false,
        custom_day_2: false,
      },
    },
  };
}

// `nr_occurrences` is meaningless for a one-off — the payload builder pins it to 1 — so
// hide the field rather than letting a user contradict their own choice.
function occurrencesConditional() {
  return {
    if: {
      properties: {
        periodicity: { const: ONE_TIME_PERIODICITY_OPTION.const },
      },
      required: ['periodicity'],
    },
    then: {
      properties: {
        nr_occurrences: false,
      },
    },
    else: {},
  };
}

const itemFieldOrder = Array.from(
  { length: INVOICE_ITEM_SLOTS },
  (_, index) => index + 1,
).flatMap((slot) => [`item_${slot}_description`, `item_${slot}_amount`]);

/**
 * Options offered for `periodicity`.
 *
 * Contractor of Record only supports one-off invoicing, so a CoR contractor is offered
 * nothing else — matching the Remote platform. See the "How invoice scheduling works for
 * Contractor of Record" help centre article.
 *
 * Note this is a client-side restriction only: the public API does not currently reject a
 * recurring schedule for a CoR employment on the single-create path (the bulk CSV importer
 * does). Surfacing it here matches the platform; it is not a substitute for the API check.
 */
function periodicityOptions({
  includeOneTime,
  isContractorOfRecord,
}: {
  includeOneTime: boolean;
  isContractorOfRecord: boolean;
}) {
  if (isContractorOfRecord) {
    return [ONE_TIME_PERIODICITY_OPTION];
  }

  return includeOneTime
    ? [ONE_TIME_PERIODICITY_OPTION, ...RECURRING_PERIODICITY_OPTIONS]
    : [...RECURRING_PERIODICITY_OPTIONS];
}

export type ContractorOption = {
  /** Employment id, submitted as `employment_id`. */
  value: string;
  /** Contractor's name. */
  label: string;
};

type CreateInvoiceScheduleSchemaOptions = {
  /**
   * Currency codes the contractor can be invoiced in. Replaces the placeholder `oneOf`.
   */
  currencies?: string[];
  /**
   * Offer "One time" alongside the recurring cadences. Off by default so the in-flow
   * onboarding step keeps the field set it shipped with.
   */
  includeOneTime?: boolean;
  /**
   * Restrict to one-off only. Derive from the employment's `contractor_type === 'cor'`.
   */
  isContractorOfRecord?: boolean;
  /**
   * Prepend a contractor picker. This is the only structural difference between the in-flow
   * onboarding step, which already knows its employment, and the standalone screen, which
   * chooses the contractor in the form itself.
   */
  includeContractorSelect?: boolean;
  /**
   * Contractors to offer in the picker. Only read when `includeContractorSelect` is set.
   */
  contractors?: ContractorOption[];
  /**
   * Whether the contractor list is still loading. Distinguishes "not loaded yet" from
   * "loaded and empty", so the placeholder does not claim to be loading forever when the
   * company simply has no active contractors.
   */
  isLoadingContractors?: boolean;
};

/**
 * Builds the create-invoice-schedule JSON schema.
 *
 * Hardcoded rather than fetched: there is no JSON-schema endpoint for invoice schedules,
 * so this mirrors the shape the platform renders and the fields
 * `POST /v1/contractor-invoice-schedules` accepts.
 */
export function buildCreateInvoiceScheduleSchema({
  currencies,
  includeOneTime = false,
  isContractorOfRecord = false,
  includeContractorSelect = false,
  contractors,
  isLoadingContractors = false,
}: CreateInvoiceScheduleSchemaOptions = {}) {
  return {
    type: 'object',
    'x-jsf-presentation': {
      title: 'Create invoice schedule',
      description:
        'Fill out the invoice details and specify the recurrence options.',
    },
    properties: {
      ...(includeContractorSelect
        ? {
            employment_id: {
              description:
                'Who would you like to set up automatic invoicing with?',
              title: 'Contractor',
              type: 'string',
              oneOf: contractors?.length
                ? contractors.map(({ value, label }) => ({
                    const: value,
                    title: label,
                  }))
                : [
                    {
                      const: 'placeholder',
                      title: isLoadingContractors
                        ? 'Loading contractors…'
                        : 'No active contractors found',
                    },
                  ],
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
          }
        : {}),
      currency: {
        description: 'The currency this invoice schedule will be issued in.',
        title: 'Invoice currency',
        type: 'string',
        oneOf: currencies?.length
          ? currencies.map((code) => ({ const: code, title: code }))
          : [{ const: 'placeholder', title: 'Loading currencies…' }],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      periodicity: {
        description: 'How often invoices are generated for this schedule.',
        title: 'Frequency',
        type: 'string',
        oneOf: periodicityOptions({ includeOneTime, isContractorOfRecord }),
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      start_date: {
        description: 'Date the first invoice will be generated.',
        title: 'Start date',
        type: 'string',
        format: 'date',
        'x-jsf-presentation': {
          inputType: 'date',
        },
      },
      custom_day_1: {
        description:
          'First day of the month an invoice is generated. Leave both days blank to use the cycle derived from the start date. One of the two days must be the start date\u2019s day.',
        title: 'First invoice day',
        type: 'integer',
        minimum: 1,
        maximum: 31,
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      custom_day_2: {
        description: 'Second day of the month an invoice is generated.',
        title: 'Second invoice day',
        type: 'integer',
        minimum: 1,
        maximum: 31,
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      ...invoiceItemProperties(),
      number: {
        description: 'Optional identifier shown on generated invoices.',
        title: 'Invoice number',
        type: 'string',
        maxLength: 10,
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      note: {
        description: 'Shown on generated invoices.',
        title: 'Additional notes',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      nr_occurrences: {
        description:
          'Number of invoices to generate. Leave blank for the schedule to repeat indefinitely.',
        title: 'Number of occurrences',
        type: 'integer',
        minimum: 1,
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
    },
    required: [
      ...(includeContractorSelect ? ['employment_id'] : []),
      'currency',
      'periodicity',
      'start_date',
      'item_1_description',
      'item_1_amount',
    ],
    'x-jsf-order': [
      ...(includeContractorSelect ? ['employment_id'] : []),
      'currency',
      'periodicity',
      'start_date',
      'custom_day_1',
      'custom_day_2',
      ...itemFieldOrder,
      'number',
      'note',
      'nr_occurrences',
    ],
    'x-jsf-logic': {
      computedValues: {
        currency_selected: {
          rule: { var: 'currency' },
        },
      },
    },
    // Carried over when this schema moved here: the static ContractorOnboarding schemas
    // were migrated to JSF v1 on main.
    'x-rmt-meta': {
      jsfVersion: '1',
    },
    allOf: [
      ...invoiceItemRevealConditionals(),
      semiMonthlyConditional(),
      ...(includeOneTime || isContractorOfRecord
        ? [occurrencesConditional()]
        : []),
    ],
  };
}

/**
 * The schema as the in-flow onboarding step renders it (no one-off option).
 * Currencies are substituted at runtime — see `useGetCreateInvoiceScheduleSchema`.
 */
export const createInvoiceScheduleSchema = buildCreateInvoiceScheduleSchema();

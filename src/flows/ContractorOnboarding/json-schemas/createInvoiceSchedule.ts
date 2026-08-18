const INVOICE_ITEM_SLOTS = 10;

const PERIODICITY_OPTIONS = [
  { const: 'weekly', title: 'Weekly' },
  { const: 'bi_weekly', title: 'Bi-weekly' },
  { const: 'semi_monthly', title: 'Semi-monthly' },
  { const: 'monthly', title: 'Monthly' },
];

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

const itemFieldOrder = Array.from(
  { length: INVOICE_ITEM_SLOTS },
  (_, index) => index + 1,
).flatMap((slot) => [`item_${slot}_description`, `item_${slot}_amount`]);

export const createInvoiceScheduleSchema = {
  type: 'object',
  'x-jsf-presentation': {
    title: 'Create invoice schedule',
    description:
      'Fill out the invoice details and specify the recurrence options.',
  },
  properties: {
    currency: {
      description: 'The currency this invoice schedule will be issued in.',
      title: 'Invoice currency',
      type: 'string',
      // Replaced at runtime with the contractor's supported currencies
      // (see useGetCreateInvoiceScheduleSchema in ContractorOnboarding/api.ts).
      oneOf: [{ const: 'placeholder', title: 'Loading currencies…' }],
      'x-jsf-presentation': {
        inputType: 'select',
      },
    },
    periodicity: {
      description: 'How often invoices are generated for this schedule.',
      title: 'Frequency',
      type: 'string',
      oneOf: PERIODICITY_OPTIONS,
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
    'currency',
    'periodicity',
    'start_date',
    'item_1_description',
    'item_1_amount',
  ],
  'x-jsf-order': [
    'currency',
    'periodicity',
    'start_date',
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
  allOf: invoiceItemRevealConditionals(),
};

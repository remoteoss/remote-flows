import {
  END_TYPE_MULTIPLE,
  END_TYPE_NEVER,
  MAX_INVOICE_ITEMS,
  ONE_TIME_PERIODICITY_OPTION,
  PLACEHOLDER_OPTION,
  RECURRING_PERIODICITY_OPTIONS,
  SEMI_MONTHLY_CUSTOM_CYCLE,
  SEMI_MONTHLY_CYCLE_GAP_DAYS,
  SEMI_MONTHLY_DEFAULT_CYCLE,
  SEMI_MONTHLY_DEFAULT_CYCLE_DAYS,
  SEMI_MONTHLY_PERIODICITY,
} from '@/src/common/invoice-schedules/constants';
import { toOrdinal } from '@/src/common/invoice-schedules/utils';

function invoiceItemsProperty() {
  return {
    title: 'Invoice items',
    type: 'array',
    minItems: 1,
    maxItems: MAX_INVOICE_ITEMS,
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['description', 'amount'],
      properties: {
        description: {
          title: 'Description',
          type: 'string',
          minLength: 1,
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        amount: {
          title: 'Amount',
          type: 'integer',
          minimum: 1,
          'x-jsf-presentation': {
            inputType: 'money',
          },
        },
      },
      'x-jsf-order': ['description', 'amount'],
    },
    'x-jsf-presentation': {
      inputType: 'group-array',
      addFieldText: 'Add item',
      hideLabel: true,
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

// A custom cycle's second invoice is the first one plus a fixed gap, so it is derived in the
// schema rather than chosen. Only meaningful while the custom cycle fields are shown.
const SECOND_INVOICE_DAY_RULE = {
  '+': [
    { var: 'semi_monthly_settings.first_invoice_day' },
    SEMI_MONTHLY_CYCLE_GAP_DAYS,
  ],
};

const START_DATE_VAR = { var: 'start_date' };
const START_DATE_DAY = { '+': [{ substr: [START_DATE_VAR, 8, 2] }] };
const START_DATE_MONTH_DAY = { substr: [START_DATE_VAR, 5, 5] };
const START_DATE_YEAR = { '+': [{ substr: [START_DATE_VAR, 0, 4] }] };

const MONTH_END_DATES = [
  '01-31',
  '02-29',
  '03-31',
  '04-30',
  '05-31',
  '06-30',
  '07-31',
  '08-31',
  '09-30',
  '10-31',
  '11-30',
  '12-31',
];

const IS_LEAP_YEAR = {
  or: [
    { '==': [{ '%': [START_DATE_YEAR, 400] }, 0] },
    {
      and: [
        { '==': [{ '%': [START_DATE_YEAR, 4] }, 0] },
        { '!=': [{ '%': [START_DATE_YEAR, 100] }, 0] },
      ],
    },
  ],
};

const STARTS_ON_DEFAULT_CYCLE_DAY = {
  or: [
    { '==': [START_DATE_DAY, SEMI_MONTHLY_DEFAULT_CYCLE_DAYS[0]] },
    { in: [START_DATE_MONTH_DAY, MONTH_END_DATES] },
    {
      and: [{ '==': [START_DATE_MONTH_DAY, '02-28'] }, { '!': [IS_LEAP_YEAR] }],
    },
  ],
};

const STARTS_ON_CUSTOM_CYCLE_DAY = {
  or: [
    {
      '==': [
        START_DATE_DAY,
        { '+': [{ var: 'semi_monthly_settings.first_invoice_day' }] },
      ],
    },
    { '==': [START_DATE_DAY, SECOND_INVOICE_DAY_RULE] },
  ],
};

const START_DATE_MATCHES_CYCLE_VALIDATION = 'start_date_matches_cycle';

function dayOptions(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => ({
    const: String(from + index),
    title: `${toOrdinal(from + index)} of the month`,
  }));
}

function semiMonthlySettingsProperty() {
  return {
    title: 'Semi-monthly',
    type: 'object',
    'x-jsf-presentation': {
      inputType: 'fieldset',
    },
    properties: {
      invoicing_cycle: {
        title: 'Invoicing cycle',
        type: 'string',
        default: SEMI_MONTHLY_DEFAULT_CYCLE,
        oneOf: [
          {
            const: SEMI_MONTHLY_DEFAULT_CYCLE,
            title: '15th and last day of the month',
          },
          { const: SEMI_MONTHLY_CUSTOM_CYCLE, title: 'Custom cycle' },
        ],
        'x-jsf-presentation': {
          inputType: 'radio',
          direction: 'column',
        },
      },
      first_invoice_day: {
        title: 'First invoice raised on',
        type: 'string',
        default: '1',
        oneOf: dayOptions(1, 14),
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      second_invoice_day: {
        title: 'Second invoice raised on',
        type: 'string',
        readOnly: true,
        'x-jsf-presentation': {
          inputType: 'text',
        },
        'x-jsf-logic-computedAttrs': {
          const: 'second_invoice_day_value',
          default: 'second_invoice_day_value',
          'x-jsf-presentation': {
            statement: {
              description: '{{second_invoice_day_label}}',
            },
          },
        },
      },
    },
    required: ['invoicing_cycle'],
    'x-jsf-order': [
      'invoicing_cycle',
      'first_invoice_day',
      'second_invoice_day',
    ],
    allOf: [
      {
        if: {
          properties: { invoicing_cycle: { const: SEMI_MONTHLY_CUSTOM_CYCLE } },
          required: ['invoicing_cycle'],
        },
        then: { required: ['first_invoice_day', 'second_invoice_day'] },
        else: {
          properties: { first_invoice_day: false, second_invoice_day: false },
        },
      },
    ],
  };
}

// The cycle fieldset only means anything for a semi-monthly schedule; the API rejects
// custom days for any other periodicity. Hide it unless semi-monthly is selected.
function semiMonthlyConditional() {
  return {
    if: {
      properties: { periodicity: { const: 'semi_monthly' } },
      required: ['periodicity'],
    },
    then: { required: ['semi_monthly_settings'] },
    else: {
      properties: {
        semi_monthly_settings: false,
      },
    },
  };
}

function endDateConditionals() {
  return [
    {
      if: {
        properties: {
          periodicity: {
            enum: RECURRING_PERIODICITY_OPTIONS.map((option) => option.const),
          },
        },
        required: ['periodicity'],
      },
      then: {
        required: ['end_type'],
      },
      else: {
        properties: {
          end_type: false,
          nr_occurrences: false,
        },
      },
    },
    {
      if: {
        properties: { end_type: { const: END_TYPE_MULTIPLE } },
        required: ['end_type'],
      },
      then: {
        required: ['nr_occurrences'],
      },
      else: {
        properties: {
          nr_occurrences: false,
        },
      },
    },
  ];
}

const SUMMARY_PERIODICITIES = ['weekly', 'bi_weekly', 'monthly'];

function scheduleSummaryProperty() {
  return {
    type: 'null',
    title: 'Schedule summary',
    'x-jsf-presentation': {
      inputType: 'hidden',
      statement: {
        description: '',
        inputType: 'statement',
        severity: 'info',
      },
      meta: {
        ignoreValue: true,
      },
    },
    'x-jsf-logic-computedAttrs': {
      'x-jsf-presentation': {
        statement: {
          description:
            'This schedule will create a <strong>{{schedule_frequency}}</strong> recurring invoice{{schedule_end}}, starting <strong>{{schedule_start}}</strong>.',
        },
      },
    },
  };
}

const scheduleSummaryComputedValues = {
  schedule_frequency: {
    rule: {
      if: [
        { '==': [{ var: 'periodicity' }, 'bi_weekly'] },
        'bi-weekly',
        { var: 'periodicity' },
      ],
    },
  },
  schedule_end: {
    rule: {
      if: [
        { '==': [{ var: 'end_type' }, END_TYPE_NEVER] },
        ' <strong>with no end date</strong>',
        { '==': [{ var: 'end_type' }, END_TYPE_MULTIPLE] },
        {
          cat: [
            ' that <strong>ends after ',
            {
              if: [
                { var: 'nr_occurrences' },
                {
                  if: [
                    { '==': [{ var: 'nr_occurrences' }, 1] },
                    'one occurrence',
                    { cat: [{ var: 'nr_occurrences' }, ' occurrences'] },
                  ],
                },
                '\u2014',
              ],
            },
            '</strong>',
          ],
        },
        '',
      ],
    },
  },
  schedule_start: {
    rule: {
      if: [
        { var: 'start_date' },
        { date_format: [{ var: 'start_date' }, 'MMMM d, yyyy'] },
        '\u2014',
      ],
    },
  },
};

function scheduleSummaryConditional() {
  return {
    if: {
      properties: {
        periodicity: { enum: SUMMARY_PERIODICITIES },
      },
      required: ['periodicity'],
    },
    then: {},
    else: {
      properties: {
        schedule_summary: false,
      },
    },
  };
}

function startDateConditional() {
  return {
    if: {
      properties: {
        periodicity: {
          enum: RECURRING_PERIODICITY_OPTIONS.map(({ const: value }) => value),
        },
      },
      required: ['periodicity'],
    },
    then: {
      properties: {
        start_date: {
          title: 'Start date',
          description: 'The first invoice will be generated on this date.',
        },
      },
    },
    else: {},
  };
}

function invoiceFieldsets() {
  return {
    invoicing_details: {
      title: 'Invoicing details',
      propertiesByName: ['currency'],
    },
    invoice_items: {
      title: 'Invoice items',
      propertiesByName: ['items'],
    },
    invoicing_preferences: {
      title: 'Invoicing preferences',
      propertiesByName: [
        'invoice_date_note',
        'periodicity',
        'semi_monthly_settings',
        'start_date',
        'end_type',
        'nr_occurrences',
        'number',
        'schedule_summary',
      ],
    },
    summary: {
      title: 'Summary',
      propertiesByName: ['note'],
    },
  };
}

/**
 * Options offered for `periodicity`.
 *
 * Contractor of Record only supports one-off invoicing, so a CoR contractor is offered
 * nothing else — matching the Remote platform. See the "How invoice scheduling works for
 * Contractor of Record" help centre article.
 *
 * The public API rejects a recurring schedule for a CoR employment too; offering only one-off
 * here keeps the form from suggesting something the API will refuse.
 */
function periodicityOptions({
  isContractorOfRecord,
}: {
  isContractorOfRecord: boolean;
}) {
  if (isContractorOfRecord) {
    return [ONE_TIME_PERIODICITY_OPTION];
  }

  return [ONE_TIME_PERIODICITY_OPTION, ...RECURRING_PERIODICITY_OPTIONS];
}

type CreateInvoiceScheduleSchemaOptions = {
  /**
   * Currency codes the contractor can be invoiced in. Replaces the placeholder `oneOf`.
   */
  currencies?: string[];
  /**
   * Restrict to one-off only. Derive from the employment's `contractor_type === 'cor'`.
   */
  isContractorOfRecord?: boolean;
  /**
   * Group the fields under the platform's headings (Invoicing details, Invoice items,
   * Invoicing preferences, Summary). Off by default: the standalone flow renders them flat.
   */
  includeFieldsets?: boolean;
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
  isContractorOfRecord = false,
  includeFieldsets = false,
}: CreateInvoiceScheduleSchemaOptions = {}) {
  return {
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
        oneOf: currencies?.length
          ? currencies.map((code) => ({ const: code, title: code }))
          : [
              {
                const: PLACEHOLDER_OPTION,
                // An empty list is an answer — this contractor has no currencies to be
                // invoiced in — where no list at all means the fetch has not resolved. Both
                // states exist: the flows build the schema once currencies arrive, but the
                // static `createInvoiceScheduleSchema` fallback is built without any.
                // Labelling the empty case "loading" left it looking stuck forever.
                title: currencies
                  ? 'No currencies available'
                  : 'Loading currencies…',
                // Unselectable, so it cannot be submitted as a real currency. Nothing is
                // then selected, so the field's `required` rule reports a normal error on
                // submit.
                disabled: true,
              },
            ],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      invoice_date_note: {
        type: 'null',
        title: 'Invoice date note',
        'x-jsf-presentation': {
          inputType: 'hidden',
          statement: {
            description:
              'The invoice date specifies when the invoice will be created, not when the contractor gets paid. If the contractor needs payment on a specific date, please backdate the invoice date to account for processing time.',
            inputType: 'statement',
            severity: 'info',
          },
          meta: {
            ignoreValue: true,
          },
        },
      },
      periodicity: {
        description:
          'What is the frequency you want to invoice? <a href="https://support.remote.com/contractor/contractor-management/what-are-the-frequency-options-when-scheduling-a-contractors-invoice" target="_blank">Learn more about invoicing frequencies.</a>',
        title: 'Frequency',
        type: 'string',
        oneOf: periodicityOptions({ isContractorOfRecord }),
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      start_date: {
        description: 'The invoice will be generated on this date.',
        title: 'Invoice date',
        type: 'string',
        format: 'date',
        'x-jsf-presentation': {
          inputType: 'date',
          minDate: new Date().toISOString().slice(0, 10),
        },
        'x-jsf-logic-validations': [START_DATE_MATCHES_CYCLE_VALIDATION],
      },
      semi_monthly_settings: semiMonthlySettingsProperty(),
      items: invoiceItemsProperty(),
      number: {
        description: 'Optional identifier shown on generated invoices.',
        title: 'Invoice number',
        type: 'string',
        maxLength: 10,
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      schedule_summary: scheduleSummaryProperty(),
      note: {
        description: 'Shown on generated invoices.',
        title: 'Additional notes',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      end_type: {
        title: 'End date',
        type: 'string',
        oneOf: [
          { const: END_TYPE_NEVER, title: 'No end date' },
          {
            const: END_TYPE_MULTIPLE,
            title: 'End after a number of occurrences',
          },
        ],
        'x-jsf-presentation': {
          inputType: 'radio',
          direction: 'column',
        },
      },
      nr_occurrences: {
        description: 'Number of invoices to generate.',
        title: 'Number of occurrences',
        type: 'integer',
        minimum: 1,
        default: 1,
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
    },
    required: ['currency', 'periodicity', 'start_date', 'items'],
    ...(includeFieldsets ? { 'x-jsf-fieldsets': invoiceFieldsets() } : {}),
    'x-jsf-order': [
      'currency',
      'items',
      'invoice_date_note',
      'periodicity',
      'semi_monthly_settings',
      'start_date',
      'end_type',
      'nr_occurrences',
      'number',
      'schedule_summary',
      'note',
    ],
    'x-jsf-logic': {
      validations: {
        [START_DATE_MATCHES_CYCLE_VALIDATION]: {
          errorMessage:
            'Choose a date that matches the selected invoicing cycle',
          rule: {
            or: [
              { '!': [START_DATE_VAR] },
              {
                '!=': [{ var: 'periodicity' }, SEMI_MONTHLY_PERIODICITY],
              },
              {
                if: [
                  {
                    '==': [
                      { var: 'semi_monthly_settings.invoicing_cycle' },
                      SEMI_MONTHLY_CUSTOM_CYCLE,
                    ],
                  },
                  STARTS_ON_CUSTOM_CYCLE_DAY,
                  STARTS_ON_DEFAULT_CYCLE_DAY,
                ],
              },
            ],
          },
        },
      },
      computedValues: {
        currency_selected: {
          rule: { var: 'currency' },
        },
        second_invoice_day_value: {
          rule: { cat: [SECOND_INVOICE_DAY_RULE] },
        },
        second_invoice_day_label: {
          rule: {
            cat: [
              SECOND_INVOICE_DAY_RULE,
              {
                if: [
                  { '==': [SECOND_INVOICE_DAY_RULE, 21] },
                  'st',
                  { '==': [SECOND_INVOICE_DAY_RULE, 22] },
                  'nd',
                  { '==': [SECOND_INVOICE_DAY_RULE, 23] },
                  'rd',
                  'th',
                ],
              },
              ' of the month',
            ],
          },
        },
        ...scheduleSummaryComputedValues,
      },
    },
    // Carried over when this schema moved here: the static ContractorOnboarding schemas
    // were migrated to JSF v1 on main.
    'x-rmt-meta': {
      jsfVersion: '1',
    },
    allOf: [
      semiMonthlyConditional(),
      ...endDateConditionals(),
      scheduleSummaryConditional(),
      startDateConditional(),
    ],
  };
}

/**
 * The schema as the in-flow onboarding step renders it.
 * Currencies are substituted at runtime — see `useGetCreateInvoiceScheduleSchema`.
 */
export const createInvoiceScheduleSchema = buildCreateInvoiceScheduleSchema();

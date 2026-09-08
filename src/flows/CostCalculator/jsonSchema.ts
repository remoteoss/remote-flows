import { BASE_RATES } from '@/src/flows/CostCalculator/constants';
import type { CurrencyKey } from '@/src/flows/CostCalculator/types';

const staticProperties = {
  country: {
    title: 'Country',
    description: '',
    type: 'string',
    oneOf: [],
    'x-jsf-presentation': {
      inputType: 'select',
    },
  },
  region: {
    title: 'Region',
    description: '',
    type: 'string',
    oneOf: [],
    'x-jsf-presentation': {
      inputType: 'select',
    },
  },
  currency: {
    title: 'Currency',
    description: '',
    type: 'string',
    oneOf: [],
    'x-jsf-presentation': {
      inputType: 'select',
    },
  },
  currency_statement: {
    type: 'null',
    title: 'Company statement',
    'x-jsf-presentation': {
      inputType: 'hidden',
      hidden: true,
      statement: {
        title: '<TITLE_PLACEHOLDER>',
        description: '<DESCRIPTION_PLACEHOLDER>',
        inputType: 'statement',
        severity: 'warning',
      },
      meta: {
        ignoreValue: true,
      },
    },
  },
  hiring_budget: {
    title: 'How would you like to estimate the cost of hiring?',
    enum: ['employee_annual_salary', 'my_hiring_budget'],
    type: 'string',
    oneOf: [
      {
        title: "With the employee's annual salary",
        const: 'employee_annual_salary',
      },
      {
        title: 'With my hiring budget for this role',
        const: 'my_hiring_budget',
      },
    ],
    'x-jsf-presentation': {
      inputType: 'radio',
    },
  },
  salary: {
    description: '',
    title: 'Salary',
    type: 'integer',
    'x-jsf-presentation': {
      inputType: 'money',
    },
  },
  estimation_title: {
    title: 'Estimation title',
    description: 'Employee title. e.g; "Software Engineer".',
    type: 'string',
    'x-jsf-presentation': {
      inputType: 'text',
      hidden: true,
    },
  },
  salary_conversion: {
    description: '',
    title: 'Salary',
    type: 'integer',
    'x-jsf-presentation': {
      inputType: 'money',
      hidden: true,
    },
  },
  salary_converted: {
    description:
      'Whether the salary is expressed in regional or employer currency',
    title: 'Salary in employer currency',
    type: 'string',
    'x-jsf-presentation': {
      inputType: 'hidden',
      hidden: true,
    },
  },
  management: {
    title: 'Management fee',
    type: 'object',
    properties: {
      management_fee: {
        title: 'Desired monthly management fee',
        type: 'integer',
        'x-jsf-presentation': {
          inputType: 'money',
        },
      },
      _expanded: {
        type: 'boolean',
        default: false,
        'x-jsf-presentation': {
          inputType: 'hidden',
          hidden: true,
        },
      },
    },
    'x-jsf-presentation': {
      inputType: 'fieldset',
      hidden: true,
    },
  },
};

// `salary`/`salary_conversion` are deliberately NOT listed here — they're mutually
// exclusive (see `salaryRequiredWhenSelected` below), and `required` entries only ever
// add requiredness on top of this base list, never remove it. Listing either one here
// unconditionally would make it always required regardless of `salary_converted`.
const staticRequired = ['country', 'currency', 'salary_converted'];

// `management` is always last so region-fetched fields (benefits, age, etc.) render
// between the base fields and the management fee fieldset, matching the platform's layout.
const staticOrderBeforeManagement = [
  'country',
  'region',
  'currency',
  'currency_statement',
  'salary',
  'estimation_title',
];

// Mirrors the message the removed Yup schema produced for `management.management_fee`'s
// `.max()` check — `displayValue` is the same maxValue-in-cents-to-major-units conversion.
function managementFeeMaxErrorMessage(employerBillingCurrency: string) {
  const maxValue =
    BASE_RATES[employerBillingCurrency as CurrencyKey] ?? BASE_RATES.USD;
  const displayValue = maxValue / 100;
  return `Management fee cannot exceed ${displayValue} ${employerBillingCurrency}`;
}

// `salary`/`salary_conversion` are mutually exclusive: whichever one the user is actively
// filling in (tracked by `salary_converted`) is the one that's actually required. Replaces
// the removed Yup `.when('salary_converted', ...)` conditional.
function salaryRequiredWhenSelected(fieldName: 'salary' | 'salary_conversion') {
  return {
    if: {
      properties: { salary_converted: { const: fieldName } },
      required: ['salary_converted'],
    },
    then: { required: [fieldName] },
  };
}

/**
 * Merges the static cost-calculator schema with the region-specific fields fetched from
 * `getV1CostCalculatorRegionsSlugFields` into ONE JSON Schema, so the form is built from a
 * single `createHeadlessForm` call instead of two separate ones spliced together afterwards.
 */
type SelectOption = { value: string; label: string };

// `field.options` (and `field.isVisible`) are derived by the library from the schema
// (`oneOf` / `x-jsf-presentation.hidden`) — they're recomputed internally whenever the form
// re-validates, which silently discards a post-hoc mutation like `field.options = countries`.
// Baking the real option list into the schema itself, like `hiring_budget` already does
// above, is what survives that recomputation.
function toOneOf(options?: SelectOption[]) {
  return (options ?? []).map(({ value, label }) => ({
    const: value,
    title: label,
  }));
}

export function buildCostCalculatorSchema({
  regionSchema,
  countries,
  currencies,
  regions,
  employerBillingCurrency,
  showEstimationTitleField,
  hasChildRegions,
}: {
  regionSchema?: Record<string, unknown>;
  /** Options for the `country` select, fetched from `useCostCalculatorCountries`. */
  countries?: SelectOption[];
  /** Options for the `currency` select, fetched from `useCompanyCurrencies`. */
  currencies?: SelectOption[];
  /** Options for the `region` select — the selected country's child regions, if any. */
  regions?: SelectOption[];
  /**
   * Currency the management fee's `maximum` is capped by. Defaults to USD's base rate,
   * matching the removed Yup validation's fallback.
   */
  employerBillingCurrency?: string;
  /**
   * Makes `estimation_title` required, mirroring `estimationOptions.includeEstimationTitle`.
   */
  showEstimationTitleField?: boolean;
  /**
   * Makes the top-level `region` select required (and visible) — true once the selected
   * country has child regions to choose from.
   */
  hasChildRegions?: boolean;
} = {}) {
  const regionProperties =
    (regionSchema?.properties as Record<string, unknown> | undefined) ?? {};
  const regionRequired = (regionSchema?.required as string[] | undefined) ?? [];
  const regionOrder =
    (regionSchema?.['x-jsf-order'] as string[] | undefined) ??
    Object.keys(regionProperties);
  const currency = employerBillingCurrency || 'USD';

  return {
    additionalProperties: false,
    type: 'object',
    properties: {
      ...staticProperties,
      ...regionProperties,
      country: {
        ...staticProperties.country,
        oneOf: toOneOf(countries),
      },
      currency: {
        ...staticProperties.currency,
        oneOf: toOneOf(currencies),
      },
      region: {
        ...staticProperties.region,
        oneOf: toOneOf(regions),
        'x-jsf-presentation': {
          ...staticProperties.region['x-jsf-presentation'],
          hidden: !hasChildRegions,
        },
      },
      management: {
        ...staticProperties.management,
        properties: {
          ...staticProperties.management.properties,
          management_fee: {
            ...staticProperties.management.properties.management_fee,
            minimum: 0,
            maximum: BASE_RATES[currency as CurrencyKey] ?? BASE_RATES.USD,
            'x-jsf-errorMessage': {
              maximum: managementFeeMaxErrorMessage(currency),
            },
          },
        },
      },
    },
    required: [
      ...staticRequired,
      ...regionRequired,
      ...(showEstimationTitleField ? ['estimation_title'] : []),
      ...(hasChildRegions ? ['region'] : []),
    ],
    'x-jsf-order': [
      ...staticOrderBeforeManagement,
      ...regionOrder,
      'management',
    ],
    // Opts into the library's v1 engine — every other hand-authored schema in this codebase
    // (Termination, ContractorOnboarding, CreateCompany, InvoiceSchedule) sets this. Without
    // it, `createHeadlessForm` silently falls back to the legacy v0 engine, which is
    // internally Yup-based — this schema never had the flag before this rewrite either.
    'x-rmt-meta': {
      jsfVersion: '1',
    },
    allOf: [
      salaryRequiredWhenSelected('salary'),
      salaryRequiredWhenSelected('salary_conversion'),
    ],
  };
}

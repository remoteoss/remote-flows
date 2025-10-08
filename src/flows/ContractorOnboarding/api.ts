import { getShowContractorContractDetailsCountry } from '@/src/client';
import { convertToCents } from '@/src/components/form/utils';
import { useClient } from '@/src/context';
import { FlowOptions } from '@/src/flows/types';
import { findFieldsByType } from '@/src/flows/utils';
import { JSFFieldset } from '@/src/types/remoteFlows';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';

export const useContractorDetailsData = ({
  countryCode,
  options,
}: {
  countryCode: string;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
}) => {
  const jsonSchemaQueryParam = options?.jsonSchemaVersion
    ?.contractor_contract_details_form_schema
    ? {
        json_schema_version:
          options.jsonSchemaVersion.contractor_contract_details_form_schema,
      }
    : {};
  const { client } = useClient();

  return useQuery({
    queryKey: ['contractor-details-data'],
    retry: false,
    queryFn: async () => {
      return getShowContractorContractDetailsCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { country_code: countryCode },
        query: {
          ...jsonSchemaQueryParam,
        },
      });
    },
    enabled: options?.queryOptions?.enabled,
  });
};

export const useContractorOnboardingDetailsSchema = ({
  countryCode,
  fieldValues,
  options,
}: {
  countryCode: string;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  query?: Record<string, unknown>;
}) => {
  // TODO: Implement with real query from the BE
  // TODO: Do we need jsonSchemaVersion?
  // TODO: Do we need any additional query params?
  return useQuery({
    queryKey: ['contractor-onboarding-details-schema', countryCode],
    retry: false,
    queryFn: async () => {
      return Promise.resolve({
        data: {
          data: {
            'x-jsf-order': [
              'services_and_deliverables',
              'service_duration',
              'termination',
              'payment_terms',
            ],
            type: 'object',
            additionalProperties: false,
            properties: {
              services_and_deliverables: {
                description:
                  'List of projects, project descriptions and deliverables that a Contractor shall provide',
                'x-jsf-presentation': {
                  inputType: 'textarea',
                },
                title: 'Services and Deliverables',
                type: 'string',
                maxLength: 3000,
                minLength: 10,
              },
              service_duration: {
                'x-jsf-order': ['provisional_start_date', 'expiration_date'],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
                properties: {
                  provisional_start_date: {
                    $template: 'templates/date_field.json',
                    title: 'Service start date',
                    description:
                      'When the contractor will start providing service to your company.',
                    type: 'string',
                  },
                  expiration_date: {
                    $template: 'common/contract_details/contract_end_date.json',
                    description: 'Expected date of completion of services',
                    'x-jsf-presentation': {
                      inputType: 'date',
                      description: 'Expected date of completion of services',
                    },
                    title: 'Service end date',
                    type: ['string', 'null'],
                  },
                },
                title: 'Service duration',
                required: ['provisional_start_date'],
                type: 'object',
              },
              termination: {
                title: 'Termination',
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
                properties: {
                  contractor_notice_period_amount: {
                    title: 'Contractor termination notice period, in days',
                    description:
                      'The notice period the contractor must give to your company before terminating the Statement of Work.',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                    type: 'number',
                  },
                  company_notice_period_amount: {
                    title: 'Company termination notice period, in days',
                    description:
                      'The notice period the company must give to the contractor before terminating the Statement of Work.',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                    type: 'number',
                  },
                },
                'x-jsf-order': [
                  'contractor_notice_period_amount',
                  'company_notice_period_amount',
                ],
                required: [
                  'contractor_notice_period_amount',
                  'company_notice_period_amount',
                ],
                type: 'object',
              },
              payment_terms: {
                title: 'Payment terms',
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
                properties: {
                  payment_terms_type: {
                    oneOf: [
                      { const: 'pay_period', title: 'Per pay period' },
                      {
                        const: 'completion_of_services',
                        title: 'Completion of services',
                      },
                    ],
                    'x-jsf-presentation': {
                      inputType: 'radio',
                    },
                    type: 'string',
                    title: '',
                    default: 'pay_period',
                  },
                  invoicing_frequency: {
                    'x-jsf-presentation': {
                      inputType: 'select',
                      description:
                        'How frequently you want to pay this contractor. <a href="https://support.remote.com/hc/en-us/articles/13291069350413-What-are-the-frequency-options-when-scheduling-a-contractor-s-invoice">Learn more about invoicing frequencies.</a>',
                    },
                    oneOf: [
                      { const: 'weekly', title: 'Weekly' },
                      { const: 'bi_weekly', title: 'Bi-weekly' },
                      { const: 'semi_monthly', title: 'Semi-monthly' },
                      { const: 'monthly', title: 'Monthly' },
                    ],
                    title: 'Contractor Invoicing Frequency',
                    description:
                      'How frequently you want to pay this contractor.',
                    type: 'string',
                  },
                  period_unit: {
                    'x-jsf-presentation': {
                      inputType: 'select',
                    },
                    oneOf: [
                      { const: 'hourly', title: 'Hour' },
                      { const: 'daily', title: 'Day' },
                      { const: 'weekly', title: 'Week' },
                      { const: 'monthly', title: 'Month' },
                    ],
                    title: 'Compensation period unit',
                    description:
                      'How compensation is calculated (e.g. per hour)',
                    type: 'string',
                  },
                  compensation_gross_amount: {
                    description: 'How much you like to pay this contractor',
                    $template:
                      'common/contract_details/annual_gross_salary.json',
                    title: 'Gross compensation amount',
                    minimum: 1,
                  },
                  compensation_currency_code: {
                    description: 'What currency will the compensation be in',
                    $template:
                      'common/contract_details/compensation_currency_code.json',
                    title: 'Gross compensation currency',
                  },
                },
                required: ['payment_terms_type', 'compensation_gross_amount'],
                'x-jsf-order': [
                  'payment_terms_type',
                  'invoicing_frequency',
                  'compensation_gross_amount',
                  'compensation_currency_code',
                  'period_unit',
                ],
                allOf: [
                  {
                    if: {
                      properties: {
                        payment_terms_type: {
                          const: 'pay_period',
                        },
                      },
                      required: ['payment_terms_type'],
                    },
                    then: {
                      required: ['period_unit', 'invoicing_frequency'],
                    },
                    else: {
                      properties: {
                        period_unit: false,
                        invoicing_frequency: false,
                      },
                    },
                  },
                ],
                type: 'object',
              },
            },
            required: [
              'services_and_deliverables',
              'service_duration',
              'termination',
              'payment_terms',
            ],
          },
        },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      let jsfSchema = data?.data || {};
      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }

      // Contract details contains x-jsf-logic that need to be calculated every time a form value changes
      // In particular there are calculations involving the annual_gross_salary field. However this field value doesn't get
      // here in cents. So we need to convert the money fields to cents, so that the calculations are correct.
      const moneyFields = findFieldsByType(jsfSchema.properties || {}, 'money');
      const moneyFieldsData = moneyFields.reduce<Record<string, number | null>>(
        (acc, field) => {
          acc[field] = convertToCents(fieldValues[field]);
          return acc;
        },
        {},
      );

      const initialValues = {
        ...fieldValues,
        ...moneyFieldsData,
      };

      return {
        meta: {
          'x-jsf-fieldsets': jsfSchema['x-jsf-fieldsets'] as JSFFieldset,
        },
        ...createHeadlessForm(jsfSchema, {
          initialValues,
        }),
      };
    },
  });
};

import { JSFModify } from '@/src/flows/types';

export const selectCountryStepSchema = {
  data: {
    version: 7,
    schema: {
      'x-rmt-meta': { jsfVersion: '1' },
      additionalProperties: false,
      properties: {
        country: {
          title: 'Country',
          description: '',
          type: 'string',
          oneOf: [],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
      },
      required: ['country'],
      type: 'object',
      'x-jsf-order': ['country'],
    },
  },
};

type CountryOption = { value: string; label: string };

export const buildSelectCountryJsfModify = (
  countries: CountryOption[] | undefined,
  jsfModify?: JSFModify,
): JSFModify => {
  const countryModification = jsfModify?.fields?.country;
  const resolvedCountryModification =
    typeof countryModification === 'function'
      ? countryModification(
          selectCountryStepSchema.data.schema.properties.country,
        )
      : countryModification;

  return {
    ...jsfModify,
    fields: {
      ...jsfModify?.fields,
      country: {
        ...resolvedCountryModification,
        oneOf: (countries ?? []).map(({ value, label }) => ({
          const: value,
          title: label,
        })),
      },
    },
  };
};

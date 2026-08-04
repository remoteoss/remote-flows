export const gpSelectCountrySchema = {
  additionalProperties: false,
  properties: {
    country_code: {
      title: 'Country',
      description: '',
      type: 'string',
      oneOf: [] as Array<{ const: string; title: string }>,
      'x-jsf-presentation': { inputType: 'select' },
    },
  },
  required: ['country_code'],
  type: 'object',
  'x-jsf-order': ['country_code'],
};

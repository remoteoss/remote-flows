export const selectCountryStepSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        country_code: {
          title: 'Country',
          description: '',
          type: 'string',
          oneOf: [],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
      },
      required: ['country_code'],
      type: 'object',
      'x-jsf-order': ['country_code'],
    },
  },
};

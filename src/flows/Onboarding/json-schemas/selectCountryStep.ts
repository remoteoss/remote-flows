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

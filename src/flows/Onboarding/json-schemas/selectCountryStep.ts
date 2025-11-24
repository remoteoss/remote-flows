export const selectCountryStepSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        country: {
          title: 'Country',
          description: '',
          type: 'string',
          minLength: 1,
          'x-jsf-errorMessage': {
            minLength: 'Country is required',
            required: 'Country is required',
          },
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

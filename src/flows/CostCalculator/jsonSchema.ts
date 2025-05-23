export const jsonSchema = {
  data: {
    version: 7,
    schema: {
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
        salary: {
          description: '',
          title: 'Salary',
          type: 'integer',
          'x-jsf-presentation': {
            inputType: 'money',
          },
          'x-jsf-errorMessage': {
            required: 'Salary is required',
          },
        },
      },
      required: ['country', 'currency', 'salary'],
      type: 'object',
      'x-jsf-order': ['country', 'region', 'currency', 'salary'],
    },
  },
};

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
        salary_converted: {
          description:
            'Whether the salary is expressed in regional or employer currency',
          title: 'Salary in employer currency',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
      },
      required: ['country', 'currency'],
      type: 'object',
      'x-jsf-order': ['country', 'region', 'currency', 'salary'],
    },
  },
};

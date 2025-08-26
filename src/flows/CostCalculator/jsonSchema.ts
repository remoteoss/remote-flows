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
        management_fee: {
          title: 'Desired monthly management fee',
          type: 'integer',
          'x-jsf-presentation': {
            inputType: 'money',
            hidden: true,
          },
        },
      },
      required: [
        'country',
        'currency',
        'salary',
        'salary_conversion',
        'salary_converted',
      ],
      type: 'object',
      'x-jsf-order': [
        'country',
        'region',
        'currency',
        'salary',
        'management_fee',
      ],
    },
  },
};

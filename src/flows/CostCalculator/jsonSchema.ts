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
        'currency_statement',
        'salary',
        'estimation_title',
        'management',
      ],
    },
  },
};

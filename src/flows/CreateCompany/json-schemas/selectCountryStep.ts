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
        company_owner_email: {
          title: 'Company Owner Email',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        company_owner_name: {
          title: 'Company Owner Name',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        desired_currency: {
          title: 'Desired Currency',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        name: {
          title: 'Name',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        phone_number: {
          title: 'Phone Number',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        tax_number: {
          title: 'Tax Number',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
        tax_job_category: {
          title: 'Tax Job Category',
          description: '',
          type: 'string',
           oneOf: [],
          'x-jsf-presentation': {
            inputType: 'text',
          },

        },
      },
      required: ['country_code', 'company_owner_email'],
      type: 'object',
      'x-jsf-order': ['country_code', 'company_owner_email'],
    },
  },
};

export const companyBasicInformationStepSchema = {
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
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        company_owner_name: {
          title: 'Company Owner Name',
          description: '',
          type: 'string',
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
            inputType: 'select',
          },
        },
        name: {
          title: 'Name',
          description: '',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        phone_number: {
          title: 'Phone Number',
          description: '',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        tax_number: {
          title: 'Tax Number',
          description: '',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
      },
      required: [
        'country_code',
        'company_owner_email',
        'phone_number',
        'name',
        'desired_currency',
        'company_owner_name',
      ],
      type: 'object',
      'x-jsf-order': [
        'country_code',
        'name',
        'phone_number',
        'desired_currency',
        'tax_number',
        'company_owner_name',
        'company_owner_email',
      ],
    },
  },
};

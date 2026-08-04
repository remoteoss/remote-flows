export const SIMPLE_USER_PROFILE_SCHEMA = {
  name: 'Simple User Profile Schema',
  description: 'A basic user profile form for testing basic field types',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        minLength: 2,
        maxLength: 50,
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      lastName: {
        type: 'string',
        title: 'Last Name',
        minLength: 2,
        maxLength: 50,
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      email: {
        type: 'string',
        title: 'Email Address',
        format: 'email',
        'x-jsf-presentation': {
          inputType: 'email',
        },
      },
      age: {
        type: 'number',
        title: 'Age',
        minimum: 18,
        maximum: 120,
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      country: {
        type: 'string',
        title: 'Country',
        oneOf: [
          { const: 'US', title: 'United States' },
          { const: 'CA', title: 'Canada' },
          { const: 'UK', title: 'United Kingdom' },
          { const: 'DE', title: 'Germany' },
          { const: 'FR', title: 'France' },
        ],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      subscribe: {
        type: 'boolean',
        title: 'Subscribe to newsletter',
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
    },
    required: ['firstName', 'lastName', 'email', 'country'],
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

export const chooseAlternativePlanSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        subscription: {
          title: 'Choose a plan',
          type: 'string',
          oneOf: [],
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
      },
      required: ['subscription'],
      type: 'object',
      'x-jsf-order': ['subscription'],
    },
  },
};

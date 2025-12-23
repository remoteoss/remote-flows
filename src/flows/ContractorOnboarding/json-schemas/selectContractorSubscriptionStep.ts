export const selectContractorSubscriptionStepSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        subscription: {
          title: 'Payment terms',
          description: 'Choose the plan that best fits your needs.',
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

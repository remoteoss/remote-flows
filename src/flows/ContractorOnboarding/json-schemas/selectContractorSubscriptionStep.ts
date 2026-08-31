export const selectContractorSubscriptionStepSchema = {
  data: {
    version: 7,
    schema: {
      'x-rmt-meta': { jsfOldVersion: true },
      additionalProperties: false,
      properties: {
        subscription: {
          title: 'Payment terms',
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

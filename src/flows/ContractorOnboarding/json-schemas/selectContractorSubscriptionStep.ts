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
          oneOf: [
            {
              const: 'urn:remotecom:resource:product:contractor:plus:monthly',
              title: 'Contractor Management Plus',
              description: 'Engage and pay contractors with indemnity coverage',
              'x-jsf-presentation': {
                meta: {
                  features: [
                    'Contract between you and contractor',
                    'Access to all Contractor Management features',
                    '$100K indemnity coverage for penalties',
                    '4X monetary coverage than our competitors  in case of penalties',
                  ],
                },
              },
            },
            {
              const:
                'urn:remotecom:resource:product:contractor:standard:monthly',
              title: 'Contractor Management',
              description: 'Engage and pay contractors compliantly',
              'x-jsf-presentation': {
                meta: {
                  features: [
                    'Contract between you and contractor',
                    'Contract service agreement template',
                    'Only pay for active contractors',
                    'Work with contractors in 200+ countries and jurisdictions',
                  ],
                },
              },
            },
          ],
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

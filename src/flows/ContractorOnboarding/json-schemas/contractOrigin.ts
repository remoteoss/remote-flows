export const contractOriginSchema = {
  type: 'object',
  properties: {
    contract_origin: {
      description: '',
      oneOf: [
        {
          const: 'provided_by_remote',
          description:
            'Create a new terms and conditions and statement of work. This should only be used if you do not have an agreement in place with a contractor or want to renegotiate an agreement.',
          title: 'Contractor services agreement',
        },
        {
          const: 'provided_by_customer',
          description: 'Use your own agreement outside Remote.',
          title: 'Without an agreement',
        },
      ],
      title: 'Contract options',
      type: 'string',
      'x-jsf-presentation': {
        direction: 'column',
        inputType: 'radio',
      },
    },
  },
  required: ['contract_origin'],
};

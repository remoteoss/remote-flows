export const additionalInformationSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [],
      properties: {
        acknowledge_termination_procedure: {
          description: '',
          title:
            'I, {{username}} have read and agree to the procedures as defined in the termination form.',
          type: 'boolean',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'checkbox',
          },
        },
      },
      required: ['acknowledge_termination_procedure'],
      type: 'object',
      'x-jsf-order': ['acknowledge_termination_procedure'],
    },
  },
};

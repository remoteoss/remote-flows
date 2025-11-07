export const additionalInformationSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [],
      properties: {
        acknowledge_termination_procedure_info: {
          type: 'null',
          title: 'Acknowledge termination procedure info',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
          meta: {
            ignoreValue: true,
          },
        },
        acknowledge_termination_procedure: {
          description: '',
          title: 'I agree to the procedures in this form',
          type: 'boolean',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'checkbox',
          },
        },
        acknowledge_termination_procedure_fees_info: {
          type: 'null',
          title: 'Acknowledge termination procedure fees info',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
      },
      required: ['acknowledge_termination_procedure'],
      type: 'object',
      'x-jsf-order': [
        'acknowledge_termination_procedure_info',
        'acknowledge_termination_procedure',
        'acknowledge_termination_procedure_fees_info',
      ],
    },
  },
};

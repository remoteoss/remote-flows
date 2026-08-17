export const invoiceScheduleSchema = {
  type: 'object',
  properties: {
    invoice_schedule_preference: {
      description:
        'Set up a schedule to automatically create invoices on behalf of this contractor.',
      oneOf: [
        {
          const: 'schedule',
          description:
            'Set up a schedule to create invoices for this contractor now.',
          title: 'Create invoice schedule now',
        },
        {
          const: 'manual',
          description:
            'You or your contractor can always set up an invoice schedule later.',
          title: 'Skip for now',
        },
      ],
      title: 'Invoice schedule',
      type: 'string',
      'x-jsf-presentation': {
        direction: 'column',
        inputType: 'radio',
      },
    },
  },
  required: ['invoice_schedule_preference'],
};

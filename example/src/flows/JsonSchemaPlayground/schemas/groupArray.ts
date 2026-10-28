export const GROUP_ARRAY_SCHEMA = {
  name: 'Group array',
  description:
    'A repeatable group of fields with add and remove, from one to five rows',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        title: 'Items',
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['description', 'quantity'],
          properties: {
            description: {
              title: 'Description',
              type: 'string',
              minLength: 1,
              'x-jsf-presentation': {
                inputType: 'text',
              },
            },
            quantity: {
              title: 'Quantity',
              type: 'integer',
              minimum: 1,
              'x-jsf-presentation': {
                inputType: 'number',
              },
            },
          },
          'x-jsf-order': ['description', 'quantity'],
        },
        'x-jsf-presentation': {
          inputType: 'group-array',
          addFieldText: 'Add item',
        },
      },
      notes: {
        title: 'Notes',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
    },
    required: ['items'],
    'x-jsf-order': ['items', 'notes'],
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

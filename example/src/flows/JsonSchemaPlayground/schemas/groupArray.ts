export const GROUP_ARRAY_SCHEMA = {
  name: 'Group array',
  description:
    'A repeatable group of fields: add and remove rows, with limits and a shared currency',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      currency: {
        title: 'Currency',
        type: 'string',
        oneOf: [
          { const: 'EUR', title: 'EUR' },
          { const: 'USD', title: 'USD' },
        ],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      items: {
        title: 'Items',
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['description', 'amount'],
          properties: {
            description: {
              title: 'Description',
              type: 'string',
              minLength: 1,
              'x-jsf-presentation': {
                inputType: 'text',
              },
            },
            amount: {
              title: 'Amount',
              type: 'integer',
              minimum: 1,
              'x-jsf-presentation': {
                inputType: 'money',
              },
            },
          },
          'x-jsf-order': ['description', 'amount'],
        },
        'x-jsf-presentation': {
          inputType: 'group-array',
          addFieldText: 'Add item',
          hideLabel: true,
        },
        'x-jsf-logic-computedAttrs': {
          'x-jsf-presentation': {
            additionalProps: {
              currency: 'currency_selected',
            },
          },
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
    required: ['currency', 'items'],
    'x-jsf-order': ['currency', 'items', 'notes'],
    'x-jsf-fieldsets': {
      details: {
        title: 'Details',
        propertiesByName: ['currency'],
      },
      line_items: {
        title: 'Line items',
        propertiesByName: ['items'],
      },
      summary: {
        title: 'Summary',
        propertiesByName: ['notes'],
      },
    },
    'x-jsf-logic': {
      computedValues: {
        currency_selected: {
          rule: { var: 'currency' },
        },
      },
    },
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

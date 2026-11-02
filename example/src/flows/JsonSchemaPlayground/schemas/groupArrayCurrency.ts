export const GROUP_ARRAY_CURRENCY_SCHEMA = {
  name: 'Group array with currency',
  description:
    'The currency picked above is handed to the amount input of every row',
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
          { const: 'GBP', title: 'GBP' },
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
        },
        'x-jsf-logic-computedAttrs': {
          'x-jsf-presentation': {
            additionalProps: {
              currency: 'currency_selected',
            },
          },
        },
      },
    },
    required: ['currency', 'items'],
    'x-jsf-order': ['currency', 'items'],
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

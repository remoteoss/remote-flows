export const groupArraySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      title: 'Items',
      type: 'array',
      minItems: 1,
      maxItems: 3,
      'x-jsf-presentation': { inputType: 'group-array' },
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'amount'],
        properties: {
          description: {
            title: 'Description',
            type: 'string',
            minLength: 1,
            'x-jsf-presentation': { inputType: 'text' },
          },
          amount: {
            title: 'Amount',
            type: 'integer',
            minimum: 1,
            'x-jsf-presentation': { inputType: 'money' },
          },
        },
        'x-jsf-order': ['description', 'amount'],
      },
    },
  },
  required: ['items'],
  'x-jsf-order': ['items'],
  'x-rmt-meta': { jsfVersion: '1' },
};

export const groupArrayInFieldsetSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    team: {
      title: 'Team',
      type: 'object',
      additionalProperties: false,
      'x-jsf-presentation': { inputType: 'fieldset' },
      properties: {
        members: {
          title: 'Members',
          type: 'array',
          minItems: 1,
          'x-jsf-presentation': { inputType: 'group-array' },
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'age'],
            properties: {
              name: {
                title: 'Name',
                type: 'string',
                minLength: 1,
                'x-jsf-presentation': { inputType: 'text' },
              },
              age: {
                title: 'Age',
                type: 'integer',
                minimum: 18,
                'x-jsf-presentation': { inputType: 'number' },
              },
            },
            'x-jsf-order': ['name', 'age'],
          },
        },
      },
      'x-jsf-order': ['members'],
    },
  },
  required: ['team'],
  'x-jsf-order': ['team'],
  'x-rmt-meta': { jsfVersion: '1' },
};

const rowSchema = (
  secondField: Record<string, unknown>,
  secondName: string,
) => ({
  type: 'object',
  additionalProperties: false,
  required: ['name', secondName],
  properties: {
    name: {
      title: 'Name',
      type: 'string',
      minLength: 1,
      'x-jsf-presentation': {
        inputType: 'text',
      },
    },
    [secondName]: secondField,
  },
  'x-jsf-order': ['name', secondName],
});

export const GROUP_ARRAY_FIELDSETS_SCHEMA = {
  name: 'Group array in fieldsets',
  description:
    'A repeatable group under a heading group and inside an object fieldset',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: {
        title: 'Project title',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      items: {
        title: 'Line items',
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: rowSchema(
          {
            title: 'Quantity',
            type: 'integer',
            minimum: 1,
            'x-jsf-presentation': {
              inputType: 'number',
            },
          },
          'quantity',
        ),
        'x-jsf-presentation': {
          inputType: 'group-array',
          addFieldText: 'Add item',
          hideLabel: true,
        },
      },
      team: {
        title: 'Team',
        type: 'object',
        additionalProperties: false,
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
        properties: {
          members: {
            title: 'Members',
            type: 'array',
            minItems: 1,
            items: rowSchema(
              {
                title: 'Age',
                type: 'integer',
                minimum: 18,
                'x-jsf-presentation': {
                  inputType: 'number',
                },
              },
              'age',
            ),
            'x-jsf-presentation': {
              inputType: 'group-array',
              addFieldText: 'Add member',
            },
          },
        },
        required: ['members'],
        'x-jsf-order': ['members'],
      },
    },
    required: ['items', 'team'],
    'x-jsf-order': ['title', 'items', 'team'],
    'x-jsf-fieldsets': {
      details: {
        title: 'Details',
        propertiesByName: ['title'],
      },
      line_items: {
        title: 'Line items',
        propertiesByName: ['items'],
      },
    },
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

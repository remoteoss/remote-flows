export const requestIdSchema = {
  type: 'object',
  properties: {
    timeoff_id: {
      title: 'Time off request ID',
      description: '',
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'text',
      },
    },
  },
  required: ['timeoff_id'],
  'x-jsf-order': ['timeoff_id'],
  'x-rmt-meta': {
    jsfVersion: '1',
  },
};

import { STATUS_LABELS } from '@/src/flows/TimeOff/utils';

export const statusFilterSchema = {
  type: 'object',
  properties: {
    status: {
      title: 'Status',
      description: '',
      type: 'string',
      oneOf: Object.entries(STATUS_LABELS).map(([status, label]) => ({
        const: status,
        title: label,
      })),
      'x-jsf-presentation': {
        inputType: 'select',
      },
    },
  },
  required: ['status'],
  'x-jsf-order': ['status'],
  'x-rmt-meta': {
    jsfVersion: '1',
  },
};

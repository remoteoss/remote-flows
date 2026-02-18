import { JSFSchema } from '@/src/types/remoteFlows';

export const chooseAlternativePlanSchema: JSFSchema = {
  title: 'Choose Your Plan',
  description: 'Select an alternative contractor management plan',
  type: 'object',
  properties: {
    subscription: {
      type: 'string',
      title: 'Select a plan',
      enum: [],
      enumNames: [],
    },
  },
  required: ['subscription'],
};

export const signatureSchema = {
  type: 'object',
  properties: {
    signature: {
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'text',
      },
      title: 'Full Legal Name',
      description: 'Please type your full legal name to sign this contract',
    },
  },
  required: ['signature'],
};

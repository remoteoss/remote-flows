export const signatureSchema = {
  type: 'object',
  properties: {
    contract_preview_header: {
      type: 'null',
      title: 'Sign contractor services agreement',
      description:
        "Before we can move forward, we'll need you to sign the contractor Service Agreement.",
      'x-jsf-presentation': {
        inputType: 'hidden',
        meta: {
          ignoreValue: true,
        },
      },
    },
    contract_preview_statement: {
      type: 'null',
      title: 'Review document here',
      description:
        'Preview or download the agreement before signing. Once signed, you’ll be able to view the fully signed document under the contractor profile.',
      'x-jsf-presentation': {
        inputType: 'hidden',
        meta: {
          ignoreValue: true,
        },
      },
    },
    review_completed: {
      type: 'boolean',
      'x-jsf-presentation': {
        inputType: 'hidden',
        hidden: true,
      },
      default: false,
    },
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

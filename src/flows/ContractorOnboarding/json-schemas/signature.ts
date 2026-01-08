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
      },
      default: false,
    },
    signature: {
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'text',
      },
      title: 'Enter full name',
      description:
        'By signing, you agree to this legally binding document and acknowledge the information within is accurate to the best of your knowledge. After you sign, this document will be sent to the recipient to collect their signature.',
    },
  },
  required: ['signature'],
};

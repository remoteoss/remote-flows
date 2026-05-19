export const preOnboardingRequirementsFixture = {
  data: [
    {
      name: 'Individual Labor Agreement',
      status: 'awaiting_signatures',
      description:
        'Individual Labor Agreement required for each German AUG employment',
      slug: '5e39159e-96ef-40ea-82bc-b054917fc82f',
      depends_on_requirement: null,
      document_constraints_ack_at: null,
      freeze_employment_data: false,
      needs_constraints_ack: true,
      redlining_help_email: null,
      supports_redlining: false,
    },
    {
      name: 'Master Service Agreement',
      status: 'finished',
      description:
        'Master Service Agreement required for the first hire on this German legal entity',
      slug: 'dc3b954c-9d6c-4ddd-b8dc-531f9be773fb',
      depends_on_requirement: null,
      document_constraints_ack_at: '2026-05-18T12:23:24Z',
      freeze_employment_data: false,
      needs_constraints_ack: true,
      redlining_help_email: null,
      supports_redlining: false,
    },
  ],
};

export const generatedDocumentFixture = {
  data: {
    pre_onboarding_document: {
      id: 'bdbe050d-2628-4c45-8fd1-1259904294cb',
    },
  },
};

export const documentDetailsFixture = {
  data: {
    pre_onboarding_document: {
      name: '2026-05-19_GermanyMSAtemplate_MagicLinkTestCompanyUSA_Gabriel_Unsigned.pdf',
      status: 'awaiting_signatures',
      content: 'data:application/pdf;base64,JVBERi0xLjQKMSAw',
      signatories: [
        {
          name: 'Magic Link Test Owner USA',
          status: 'pending',
          type: 'company',
          signature: null,
          user_id: 'fb5943cc-325d-4871-9307-4f30f100ab50',
          email: 'gabriel.garcia+usacor@remote.com',
          signature_method: 'in_platform',
          signed_at: null,
          signature_type: 'standard',
        },
      ],
    },
  },
};

export const signDocumentResponseFixture = {
  data: {
    status: 'ok',
  },
};

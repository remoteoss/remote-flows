// TODO: Provisional, we'll modify later
export const mockPreOnboardingRequirements = {
  data: [
    {
      name: 'Individual Labor Agreement',
      status: 'awaiting_signatures',
      description:
        'Individual Labor Agreement required for each German AUG employment',
      slug: '5e39159e-96ef-40ea-82bc-b054917fc82f',
      needs_constraints_ack: true,
      document_constraints_ack_at: null,
      freeze_employment_data: false,
      redlining_help_email: null,
      supports_redlining: false,
      depends_on_requirement: null,
    },
    {
      name: 'Master Service Agreement',
      status: 'awaiting_signatures',
      description:
        'Master Service Agreement required for the first hire on this German legal entity',
      slug: 'dc3b954c-9d6c-4ddd-b8dc-531f9be773fb',
      needs_constraints_ack: true,
      document_constraints_ack_at: '2026-05-08T17:17:47Z',
      freeze_employment_data: false,
      redlining_help_email: null,
      supports_redlining: false,
      depends_on_requirement: null,
    },
  ],
};

export const mockCreatedDocument = {
  data: {
    id: 'doc_123',
    employment_id: 'emp_456',
    document_type: 'employment_agreement',
    status: 'draft',
    pdf_url: 'https://example.com/document.pdf',
    created_at: '2026-05-13T12:00:00Z',
  },
};

export const mockSignedDocument = {
  data: {
    id: 'doc_123',
    status: 'signed',
    signed_at: '2026-05-13T14:00:00Z',
  },
};

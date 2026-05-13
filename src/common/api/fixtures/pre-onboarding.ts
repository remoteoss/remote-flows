// TODO: Provisional, we'll modify later
export const mockPreOnboardingRequirements = {
  data: [
    {
      id: 'req_1',
      title: 'Employment Agreement',
      description: 'Review and sign the employment agreement',
      status: 'pending',
      required: true,
    },
    {
      id: 'req_2',
      title: 'Tax Forms',
      description: 'Complete required tax documentation',
      status: 'pending',
      required: true,
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

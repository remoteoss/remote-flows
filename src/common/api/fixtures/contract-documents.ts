export const mockEmptyContractDocumentsResponse = {
  data: {
    contract_documents: [],
    current_page: 1,
    total_count: 0,
    total_pages: 1,
  },
};

export const mockContractDocumentsResponse = {
  data: {
    contract_documents: [
      {
        id: 'contract-document-1',
        name: '2026-09-16_Company_Grace_Unsigned.pdf',
        type: 'contractor_services_agreement',
        status: 'pending_signature',
        inserted_at: '2026-09-16T09:00:00Z',
        signatories: [],
      },
    ],
    current_page: 1,
    total_count: 1,
    total_pages: 1,
  },
};

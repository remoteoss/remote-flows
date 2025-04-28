export const timeoff = {
  data: { total_count: 0, current_page: 1, total_pages: 0, timeoffs: [] },
};

export const terminationResponse = {
  data: {
    offboarding: {
      additional_comments: '',
      agrees_to_pto_amount: 'true',
      confidential: true,
      employee_awareness: {
        date: '2023-12-12',
        note: 'optional text to add details',
      },
      employment_id: '1e74fdc2-7420-4eef-ab0a-b794cbbef4e1',
      id: 'ba310525-9282-40c9-8977-14d844bf891a',
      proposed_termination_date: '2023-12-20',
      reason_description:
        'They had some performance issues and mismatched expectations.',
      requested_by: '5a31f3c1-d7a7-4311-89cb-928959d3d540',
      risk_assessment_reasons: ['sick_leave'],
      status: 'submitted',
      submitted_at: '2023-04-13T13:35:06Z',
      termination_date: '2023-12-20',
      termination_reason: 'gross_misconduct',
      type: 'termination',
      will_challenge_termination: true,
      will_challenge_termination_description: null,
    },
  },
};

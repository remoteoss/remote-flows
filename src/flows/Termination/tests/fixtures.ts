export const approvedTimeoffs = {
  data: {
    total_count: 4,
    current_page: 1,
    total_pages: 0,
    timeoffs: [
      {
        id: '3268d0c6-193b-4894-b972-ae325fb504b2',
        status: 'approved',
        automatic: false,
        timezone: 'Europe/Madrid',
        cancelled_at: null,
        start_date: '2025-12-14',
        employment_id: '85ab2f01-34e7-4a04-967d-46b1710c42b2',
        cancel_reason: null,
        end_date: '2025-12-14',
        notes: null,
        approved_at: '2025-12-14T10:53:00Z',
        timeoff_type: 'paid_time_off',
        timeoff_days: [
          {
            hours: 8,
            day: '2025-12-14',
          },
        ],
        approver_id: '6e815fa2-6eb9-4a82-9b56-170d15f1b8b4',
        leave_policy: {
          name: 'Paid time off',
          leave_policy_variant_slug: 'paid_time_off',
          leave_type: 'paid_time_off',
        },
      },
      {
        id: '3268d0c6-193b-4894-b972-ae325fb504b2',
        status: 'approved',
        automatic: false,
        timezone: 'Europe/Madrid',
        cancelled_at: null,
        start_date: '2025-12-15',
        employment_id: '85ab2f01-34e7-4a04-967d-46b1710c42b2',
        cancel_reason: null,
        end_date: '2025-12-15',
        notes: null,
        approved_at: '2025-12-15T10:53:00Z',
        timeoff_type: 'paid_time_off',
        timeoff_days: [
          {
            hours: 8,
            day: '2025-12-15',
          },
        ],
        approver_id: '6e815fa2-6eb9-4a82-9b56-170d15f1b8b4',
        leave_policy: {
          name: 'Paid time off',
          leave_policy_variant_slug: 'paid_time_off',
          leave_type: 'paid_time_off',
        },
      },
      {
        id: '3268d0c6-193b-4894-b972-ae325fb504b2',
        status: 'approved',
        automatic: false,
        timezone: 'Europe/Madrid',
        cancelled_at: null,
        start_date: '2025-12-16',
        employment_id: '85ab2f01-34e7-4a04-967d-46b1710c42b2',
        cancel_reason: null,
        end_date: '2025-12-16',
        notes: null,
        approved_at: '2025-12-16T10:53:00Z',
        timeoff_type: 'paid_time_off',
        timeoff_days: [
          {
            hours: 8,
            day: '2025-12-16',
          },
        ],
        approver_id: '6e815fa2-6eb9-4a82-9b56-170d15f1b8b4',
        leave_policy: {
          name: 'Paid time off',
          leave_policy_variant_slug: 'paid_time_off',
          leave_type: 'paid_time_off',
        },
      },
      {
        id: '3268d0c6-193b-4894-b972-ae325fb504b2',
        status: 'approved',
        automatic: false,
        timezone: 'Europe/Madrid',
        cancelled_at: null,
        start_date: '2025-12-17',
        employment_id: '85ab2f01-34e7-4a04-967d-46b1710c42b2',
        cancel_reason: null,
        end_date: '2025-12-17',
        notes: null,
        approved_at: '2025-12-17T10:53:00Z',
        timeoff_type: 'paid_time_off',
        timeoff_days: [
          {
            hours: 8,
            day: '2025-12-17',
          },
          {
            hours: 4,
            day: '2025-12-18',
          },
        ],
        approver_id: '6e815fa2-6eb9-4a82-9b56-170d15f1b8b4',
        leave_policy: {
          name: 'Paid time off',
          leave_policy_variant_slug: 'paid_time_off',
          leave_type: 'paid_time_off',
        },
      },
    ],
  },
};

export const timeoffLeavePoliciesSummaryResponse = {
  data: [
    {
      used: {
        type: 'limited',
        hours: 0,
        days: 3,
      },
      balance: {
        type: 'limited',
        hours: 0,
        days: 0,
      },
      leave_policy: {
        name: 'Paid time off',
        unit: 'days',
        description: null,
        leave_type: 'paid_time_off',
      },
      upcoming_requested: {
        type: 'limited',
        hours: 0,
        days: 0,
      },
      upcoming_approved: {
        type: 'limited',
        hours: 0,
        days: 0,
      },
      booked: {
        type: 'limited',
        hours: 0,
        days: 4,
      },
      taken: {
        type: 'limited',
        hours: 0,
        days: 0,
      },
      pending_approval: {
        type: 'limited',
        hours: 0,
        days: 0,
      },
      current_entitlement: {
        type: 'limited',
        hours: 0,
        days: 23,
      },
      annual_entitlement: {
        type: 'limited',
        hours: 0,
        days: 23,
      },
      annual_balance: {
        type: 'limited',
        hours: 0,
        days: 23,
      },
      working_hours_per_day: 8,
    },
  ],
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

import { TimeoffErrorResponse, TimeoffResponse } from '@/src/client';

export const timeOffRequestResponse: TimeoffResponse = {
  data: {
    timeoff: {
      id: 'timeoff-123',
      status: 'requested',
      automatic: false,
      timezone: 'Europe/Madrid',
      cancelled_at: null,
      start_date: '2026-11-16',
      end_date: '2026-11-17',
      employment_id: '85ab2f01-34e7-4a04-967d-46b1710c42b2',
      cancel_reason: null,
      notes: 'Family trip',
      approved_at: null,
      approver_id: null,
      timeoff_type: 'paid_time_off',
      timeoff_days: [
        { day: '2026-11-16', hours: 8, minutes: 480 },
        { day: '2026-11-17', hours: 8, minutes: 480 },
      ],
      total_minutes: 960,
      leave_policy: {
        name: 'Paid time off',
        leave_policy_variant_slug: 'paid_time_off',
        leave_type: 'paid_time_off',
      },
    },
  },
};

export const timeOffErrorResponse: TimeoffErrorResponse = {
  errors: {
    'timeoff_days/hours': [
      'must be greater than or equal to 0',
      'must be less than or equal to 8',
    ],
  },
  field_errors: [
    {
      code: 'parameter_value_unknown',
      field: 'timeoff_days/hours',
      message: 'must be greater than or equal to 0',
    },
    {
      code: 'parameter_value_unknown',
      field: 'timeoff_days/hours',
      message: 'must be less than or equal to 8',
    },
  ],
  message: 'Unprocessable Entity',
};

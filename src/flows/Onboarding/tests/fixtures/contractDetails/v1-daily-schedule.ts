/**
 * Minimal contract-details schema carrying a real `daily_schedule`
 * `x-jsf-presentation.metadata` block (PAY-2868 Phase 4), for testing the
 * `daily_schedule` feature-flagged `jsfModify` wiring in isolation from the
 * full production schema. Trimmed to two work days.
 */
export const contractDetailsSchemaV1DailySchedule = {
  data: {
    additionalProperties: false,
    properties: {
      daily_schedule: {
        properties: {
          schedule: {
            properties: {
              monday: {
                properties: {
                  start_time: {
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': { inputType: 'time' },
                  },
                  end_time: {
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': { inputType: 'time' },
                  },
                  break_duration_minutes: {
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': { inputType: 'number' },
                  },
                },
                title: 'Monday',
                type: 'object',
                'x-jsf-presentation': { inputType: 'fieldset' },
              },
              tuesday: {
                properties: {
                  start_time: {
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': { inputType: 'time' },
                  },
                  end_time: {
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': { inputType: 'time' },
                  },
                  break_duration_minutes: {
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': { inputType: 'number' },
                  },
                },
                title: 'Tuesday',
                type: 'object',
                'x-jsf-presentation': { inputType: 'fieldset' },
              },
            },
            title: 'Schedule',
            type: 'object',
            'x-jsf-presentation': { inputType: 'fieldset' },
          },
          selected_days: {
            items: {
              anyOf: [
                { const: 'monday', title: 'Monday' },
                { const: 'tuesday', title: 'Tuesday' },
              ],
            },
            title: 'Work days',
            type: 'array',
            'x-jsf-presentation': { inputType: 'select' },
          },
        },
        title: 'Daily schedule',
        type: 'object',
        'x-jsf-presentation': {
          inputType: 'fieldset',
          metadata: {
            country_name: 'Germany',
            default_start_time: '09:00',
            default_end_time: '18:00',
            default_break_duration_minutes: 60,
            subtract_breaks_in_work_hours: true,
            work_days: ['monday', 'tuesday'],
            default_schedule: [
              {
                day: 'monday',
                start_time: '09:00',
                end_time: '18:00',
                break_duration_minutes: 60,
                hours: 8,
              },
              {
                day: 'tuesday',
                start_time: '09:00',
                end_time: '18:00',
                break_duration_minutes: 60,
                hours: 8,
              },
            ],
            work_hours_per_week: {
              baseline: { minimum: 1, maximum: 48 },
              full_time: { minimum: 31, maximum: 48 },
              part_time: { minimum: 1, maximum: 30 },
            },
          },
        },
      },
      schedule_type: {
        oneOf: [
          { const: 'flexible', title: 'Flexible' },
          { const: 'core_business_hours', title: 'Flexible within core hours' },
        ],
        title: 'Employee work schedule',
        type: 'string',
        'x-jsf-presentation': { inputType: 'select' },
      },
    },
    required: ['schedule_type'],
    type: 'object',
    'x-rmt-meta': { jsfVersion: '1' },
  },
};

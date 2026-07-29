/**
 * Trimmed down version of the Italy APL contract details schema: daily_schedule
 * is hidden unless schedule_type is core_business_hours, and it holds the
 * selected_days that decide which day of its own schedule is shown.
 */
export const contractDetailsSchemaV1Italy = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        else: {
          properties: {
            daily_schedule: false,
          },
        },
        if: {
          properties: {
            schedule_type: {
              const: 'core_business_hours',
            },
          },
          required: ['schedule_type'],
        },
        then: {
          required: ['daily_schedule'],
        },
      },
    ],
    properties: {
      daily_schedule: {
        allOf: [
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    monday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'monday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['monday'],
                },
              },
            },
          },
        ],
        properties: {
          schedule: {
            properties: {
              monday: {
                properties: {
                  start_time: {
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                title: 'Monday',
                type: 'object',
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
            },
            title: 'Core working hours',
            type: 'object',
            'x-jsf-presentation': {
              inputType: 'fieldset',
            },
          },
          selected_days: {
            items: {
              anyOf: [
                {
                  const: 'monday',
                  title: 'Monday',
                },
              ],
            },
            title: 'Working days',
            type: 'array',
            'x-jsf-presentation': {
              inputType: 'select',
            },
          },
        },
        title: 'Daily schedule',
        type: 'object',
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      schedule_type: {
        oneOf: [
          {
            const: 'flexible',
            title: 'Flexible',
          },
          {
            const: 'core_business_hours',
            title: 'Flexible within core hours',
          },
        ],
        title: 'Employee work schedule',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
    },
    required: ['schedule_type'],
    type: 'object',
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

export const customFieldsByCountry: Record<
  string,
  { fields: Record<string, unknown> }
> = {
  // Nigeria we're overriding the working_hours fieldset until we provide a solution from the API and we migrate to the work_schedule field
  NGA: {
    fields: {
      working_hours: {
        // Add labels to the nested properties of the working_hours fieldset
        properties: {
          start_time: {
            title: 'Start time',
            description: 'For example, 09:00 (24-hour format)',
            type: 'string',
          },
          end_time: {
            title: 'End time',
            description: 'For example, 09:00 (24-hour format)',
            type: 'string',
          },
          working_hours: {
            title: 'Working hours',
            description: 'Hours worked per day, for example, 8',
            type: 'number',
          },
        },
      },
    },
  },
};

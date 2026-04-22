export const engagementDetailsSchemaV1GermanySimplified = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: {
            has_similar_roles: {
              const: 'yes',
            },
          },
          required: ['has_similar_roles'],
        },
        then: {
          required: ['working_days', 'work_hours_per_week'],
        },
        else: {
          properties: {
            working_days: false,
            work_hours_per_week: false,
          },
        },
      },
    ],
    properties: {
      has_similar_roles: {
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
        ],
        title: 'Do you currently have team members in similar roles to this hire?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      working_days: {
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        description: 'Select the workdays for team members in similar roles.',
        items: {
          anyOf: [
            {
              const: 'monday',
              title: 'Monday',
            },
            {
              const: 'tuesday',
              title: 'Tuesday',
            },
            {
              const: 'wednesday',
              title: 'Wednesday',
            },
            {
              const: 'thursday',
              title: 'Thursday',
            },
            {
              const: 'friday',
              title: 'Friday',
            },
            {
              const: 'saturday',
              title: 'Saturday',
            },
          ],
        },
        title: 'Select the work days',
        type: 'array',
        uniqueItems: true,
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      work_hours_per_week: {
        description: 'Number of hours team members typically work in a full week',
        minimum: 1,
        title: 'Work hours per week',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
    },
    required: ['has_similar_roles'],
    type: 'object',
    'x-jsf-order': ['has_similar_roles', 'working_days', 'work_hours_per_week'],
  },
};

export const employmentGermanyResponse = {
  data: {
    employment: {
      id: 'germany-employment-123',
      type: 'employee',
      country_code: 'DEU',
      updated_at: '2026-04-20T08:20:04',
      external_id: null,
      created_at: '2026-04-20T08:20:02',
      full_name: 'Test User',
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      provisional_start_date: '2026-05-01',
      job_title: 'Software Engineer',
      manager_id: null,
      department_id: null,
      user_status: 'created',
      basic_information: {
        name: 'Test User',
        email: 'test.user@gmail.com',
        provisional_start_date: '2026-05-01',
        job_title: 'Software Engineer',
        tax_servicing_countries: [],
        work_email: 'test.user@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'engineering_it',
      },
      seniority_date: null,
      personal_email: 'test.user@gmail.com',
      employment_lifecycle_stage: 'employment_creation',
      short_id: 'DEU001',
      eligible_for_onboarding_cancellation: true,
      probation_period_end_date: null,
      active_contract_id: '126758da-5e2a-4032-b05e-6ff62832b08c',
      country: {
        code: 'DEU',
        name: 'Germany',
        alpha_2_code: 'DE',
        supported_json_schemas: [
          'engagement_details',
          'employment_basic_information',
          'address_details',
        ],
      },
      engagement_details: null,
    },
  },
};

export const employmentGermanyResponseWithExistingData = (
  engagementDetails: Record<string, unknown>,
) => ({
  data: {
    employment: {
      ...employmentGermanyResponse.data.employment,
      engagement_details: engagementDetails,
    },
  },
});

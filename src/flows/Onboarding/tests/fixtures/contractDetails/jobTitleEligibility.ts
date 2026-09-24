export const contractDetailsSchemaJobTitleEligibility = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: {
            additional_job_title_eligibility_check_result: {
              const: 'yes_with_ack',
            },
          },
          required: ['additional_job_title_eligibility_check_result'],
        },
        then: {
          required: ['employer_acknowledges_risk'],
        },
        else: {
          properties: {
            employer_acknowledges_risk: false,
          },
        },
      },
    ],
    properties: {
      role_description: {
        description:
          'Please add at least 3 responsibilities, at least 100 characters in total.',
        maxLength: 5000,
        minLength: 100,
        title: 'Role description',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      role_is_onsite: {
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
        title: 'Will this role require working onsite?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      role_requires_license: {
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
        title: 'Does this role require a professional license?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      employer_acknowledges_risk: {
        const: 'acknowledged',
        title: 'I acknowledge the risks and wish to proceed.',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
      additional_job_title_eligibility_check_slug: {
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
    },
    required: ['role_description'],
    type: 'object',
    'x-jsf-order': [
      'additional_job_title_eligibility_check_slug',
      'role_description',
      'role_is_onsite',
      'role_requires_license',
      'employer_acknowledges_risk',
    ],
  },
};

export const jobTitleEligibilityCheckResponse = {
  data: {
    job_title_eligibility_check: {
      check_id: 'check-id-123',
      verdict: 'eligible',
    },
  },
};

export const contractDetailsSchemaJobTitleEligibilityWithResult = {
  data: {
    ...contractDetailsSchemaJobTitleEligibility.data,
    properties: {
      ...contractDetailsSchemaJobTitleEligibility.data.properties,
      additional_job_title_eligibility_check_result: {
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
    },
    'x-jsf-order': [
      ...contractDetailsSchemaJobTitleEligibility.data['x-jsf-order'],
      'additional_job_title_eligibility_check_result',
    ],
  },
};

export const jobTitleEligibilityCheckRiskyResponse = {
  data: {
    job_title_eligibility_check: {
      check_id: 'check-id-risky',
      verdict: 'eligible_with_risk_acknowledgement',
    },
  },
};

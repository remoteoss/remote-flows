/**
 * Trimmed down contract details schema exposing only the fields the job title
 * eligibility check cares about: the role fields sent to the check, the hidden
 * slug/result fields it fills, and the risk acknowledgement that the
 * yes_with_ack result reveals. Served as jsf v1 and as jsf v0.
 */
const jobTitleEligibilitySchema = {
  additionalProperties: false,
  properties: {
    role_description: {
      title: 'Role description',
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'textarea',
      },
    },
    role_is_onsite: {
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
      title: 'Will this role require working onsite?',
      type: 'string',
      'x-jsf-presentation': {
        direction: 'row',
        inputType: 'radio',
      },
    },
    role_requires_license: {
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
    additional_job_title_eligibility_check_result: {
      type: ['string', 'null'],
      'x-jsf-presentation': {
        inputType: 'hidden',
      },
    },
  },
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
  type: 'object',
};

export const contractDetailsSchemaV1JobTitleEligibility = {
  data: {
    ...jobTitleEligibilitySchema,
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

export const contractDetailsSchemaV0JobTitleEligibility = {
  data: jobTitleEligibilitySchema,
};

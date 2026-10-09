/**
 * Trimmed down contract details schema exposing only the Role Requirements
 * fieldset, as the gateway serves it to API partners for DEU, ITA and PRT: the
 * role fields sent to the job title eligibility check, the hidden slug field,
 * and the risk acknowledgement. The server-owned check result field and the
 * yes_with_ack conditional are withheld from the served schema, so the SDK has
 * to add them. role_description drops its minLength to keep the tests short.
 * Served as jsf v1 and as jsf v0.
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
  },
  required: ['role_description'],
  type: 'object',
  'x-jsf-order': [
    'role_description',
    'role_is_onsite',
    'role_requires_license',
    'employer_acknowledges_risk',
    'additional_job_title_eligibility_check_slug',
  ],
  'x-rmt-flatFieldsets': {
    additional_job_title_eligibility_check: {
      propertiesByName: [
        'additional_job_title_eligibility_check_slug',
        'role_description',
        'role_is_onsite',
        'role_requires_license',
        'employer_acknowledges_risk',
      ],
      title: 'Role Requirements',
    },
  },
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

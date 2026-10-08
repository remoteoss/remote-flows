/**
 * Trimmed down jsf v1 contract details schema exposing only the fields the
 * job title eligibility check cares about: role_description, role_is_onsite,
 * role_requires_license, and the additional_job_title_eligibility_check_slug
 * field whose presence gates the check.
 */
export const contractDetailsSchemaV1JobTitleEligibility = {
  data: {
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
      additional_job_title_eligibility_check_slug: {
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
    },
    type: 'object',
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

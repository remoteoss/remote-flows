import { FILE_TYPES, MAX_FILE_SIZE } from '@/src/lib/uploadConfig';

export const terminationDetailsSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              termination_reason: {
                const: 'end_of_fixed_term_contract',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            required: ['end_of_fixed_term_contract_termination_reason'],
          },
          else: {
            properties: {
              end_of_fixed_term_contract_termination_reason: false,
            },
          },
        },
        {
          if: {
            properties: {
              termination_reason: {
                const: 'compliance_issue',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            properties: {
              termination_reason: {
                'x-jsf-presentation': {
                  statement: {
                    title: 'Compliance-related termination',
                    description:
                      'Describe the compliance issue in the details field and upload any supporting documents so we can assess the risk and advise you quickly.',
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              termination_reason: {
                const: 'gross_misconduct',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            properties: {
              termination_reason: {
                'x-jsf-presentation': {
                  statement: {
                    title: 'Misconduct-related termination',
                    description:
                      'Describe the misconduct in the details field and upload any supporting documents so we can assess the risk and advise you quickly.',
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              termination_reason: {
                const: 'performance',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            properties: {
              termination_reason: {
                'x-jsf-presentation': {
                  statement: {
                    title: 'Performance-related termination',
                    description:
                      'Describe the performance concerns in the details field and upload any supporting documents so we can assess the risk and advise you quickly.',
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              termination_reason: {
                const: 'job_abandonment',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            properties: {
              termination_reason: {
                'x-jsf-presentation': {
                  statement: {
                    title: 'Job abandonment termination',
                    description:
                      "Tell us how many days the employee has been absent and whether you've tried to reach them. We'll also contact their emergency contact to check for any personal issues, and keep you updated throughout.",
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              termination_reason: {
                const: 'workforce_reduction',
              },
            },
            required: ['termination_reason'],
          },
          then: {
            properties: {
              termination_reason: {
                'x-jsf-presentation': {
                  statement: {
                    title: 'Workforce reduction termination',
                    description:
                      'Explain the reason for the reduction, why this employee was selected, and the criteria you used, so we can assess the risk and advise you quickly.',
                    severity: 'warning',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              will_challenge_termination: {
                const: 'yes',
              },
            },
            required: ['will_challenge_termination'],
          },
          then: {
            properties: {
              will_challenge_termination_description: {
                type: 'string',
              },
            },
            required: ['will_challenge_termination_description'],
          },
          else: {
            properties: {
              will_challenge_termination_description: false,
            },
          },
        },
      ],
      properties: {
        termination_reason: {
          title: 'Termination reason',
          description:
            'Make sure you choose an accurate termination reason to avoid unfair or unlawful dismissal claims.',
          type: 'string',
          oneOf: [
            {
              const: 'gross_misconduct',
              title: 'Misconduct',
            },
            {
              const: 'performance',
              title: 'Performance',
            },
            {
              const: 'workforce_reduction',
              title: 'Workforce reduction',
            },
            {
              const: 'values',
              title: 'Values',
            },
            {
              const: 'compliance_issue',
              title: 'Compliance issue',
            },
            {
              const: 'incapacity_to_perform_inherent_duties',
              title: 'Incapacity to perform inherent duties',
            },
            {
              const: 'mutual_agreement',
              title: 'Mutual agreement',
            },
            {
              const: 'cancellation_before_start_date',
              title: 'Decision to cancel hiring before the employee started',
            },
            {
              const: 'job_abandonment',
              title: 'Job abandonment',
            },
            {
              const: 'dissatisfaction_with_remote_service',
              title: 'Dissatisfaction with Remote service',
            },
            {
              const: 'end_of_fixed_term_contract',
              title: 'End of fixed-term contract',
            },
            {
              const: 'other',
              title: 'Other',
            },
          ],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        end_of_fixed_term_contract_termination_reason: {
          title: 'End of fixed-term termination reason',
          type: 'string',
          oneOf: [
            {
              const: 'end_of_fixed_term_contract_redundancy',
              title: 'Redundancy',
            },
            {
              const:
                'end_of_fixed_term_contract_local_regulations_max_term_reached',
              title: 'Local regulations (max term reached)',
            },
            {
              const: 'end_of_fixed_term_contract_operational_reasons',
              title: 'Operational reasons',
            },
            {
              const: 'end_of_fixed_term_contract_misconduct',
              title: 'Misconduct',
            },
            {
              const: 'end_of_fixed_term_contract_performance',
              title: 'Performance',
            },
            {
              const: 'end_of_fixed_term_contract_values',
              title: 'Values',
            },
            {
              const: 'end_of_fixed_term_contract_compliance_issue',
              title: 'Compliance issue',
            },
            {
              const:
                'end_of_fixed_term_contract_incapacity_to_perform_inherent_duties',
              title: 'Incapacity to perform inherent duties',
            },
            {
              const: 'end_of_fixed_term_contract_other',
              title: 'Other',
            },
          ],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        reason_description: {
          description: '',
          maxLength: 1000,
          title: 'Termination reason details',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        additional_comments: {
          description: '',
          maxLength: 1000,
          title: 'Additional details regarding this termination process.',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        termination_reason_files: {
          description:
            'Please upload any supporting documents regarding the termination reason.',
          title: 'Termination reason documents',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'file',
            accept: FILE_TYPES.document,
            multiple: true,
            maxSize: MAX_FILE_SIZE, // maxFileSize doesn't seem to work for some reason, found that this was fixed in @remoteoss/json-schema-form v1
          },
        },
        risk_assesment_info: {
          description: '',
          title: 'Risk assessment info',
          type: 'null',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        risk_assessment_reasons: {
          description: '',
          title: 'This employee is...',
          type: 'array',
          items: {
            anyOf: [
              {
                const: 'sick_leave',
                title: 'Currently on or recently returned from sick leave',
              },
              {
                const: 'family_leave',
                title:
                  'Currently on or recently returned from maternity, paternity, or other family leave',
              },
              {
                const: 'pregnant_or_breastfeeding',
                title: 'Pregnant or breastfeeding',
              },
              {
                const: 'requested_medical_or_family_leave',
                title: 'Requested medical or family leave',
              },
              {
                const: 'disabled_or_health_condition',
                title: 'Disabled or has a health condition',
              },
              {
                const: 'member_of_union_or_works_council',
                title: 'A member of a union or works council',
              },
              {
                const: 'caring_responsibilities',
                title: 'Caring responsibilities',
              },
              {
                const: 'reported_concerns_with_workplace',
                title:
                  'Reported any wrongdoing; raised any allegations of discrimination, harassment, retaliation, etc.; or asserted their employment rights or raised complaints about their working conditions',
              },
              {
                const: 'none_of_these',
                title:
                  'To the best of my knowledge, I am not aware of any of these',
              },
            ],
          },
          'x-jsf-presentation': {
            inputType: 'checkbox',
            direction: 'column',
            statement: {
              description:
                'Claims can still be raised even if none of the above apply.',
              severity: 'info',
            },
          },
          'x-jsf-logic-validations': [
            'risk_assessment_reasons_none_of_these_exclusive',
          ],
        },
        will_challenge_termination: {
          description: '',
          oneOf: [
            {
              const: 'yes',
              description: '',
              title: 'Yes',
            },
            {
              const: 'no',
              description: '',
              title: 'No',
            },
          ],
          title:
            'Do you consider it is likely that the employee will challenge their termination?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        will_challenge_termination_description: {
          description: '',
          maxLength: 1000,
          title:
            'Please explain how the employee will challenge their termination',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        proposed_termination_date_info: {
          description: '',
          title: 'Proposed termination date info',
          type: 'null',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        proposed_termination_date: {
          description:
            'Please note that we cannot commit to a termination date until we conduct a full review of the information you submit.',
          format: 'date',
          maxLength: 255,
          title: 'Proposed termination date',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'date',
          },
        },
      },
      required: [
        'termination_reason',
        'reason_description',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'proposed_termination_date',
      ],
      type: 'object',
      'x-jsf-order': [
        'termination_reason',
        'end_of_fixed_term_contract_termination_reason',
        'reason_description',
        'additional_comments',
        'termination_reason_files',
        'risk_assesment_info',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'will_challenge_termination_description',
        'proposed_termination_date_info',
        'proposed_termination_date',
      ],
      'x-jsf-logic': {
        validations: {
          risk_assessment_reasons_none_of_these_exclusive: {
            errorMessage:
              '"None of these" cannot be selected together with other options.',
            rule: {
              if: [
                {
                  in: ['none_of_these', { var: 'risk_assessment_reasons' }],
                },
                {
                  '!': [
                    {
                      or: [
                        'sick_leave',
                        'family_leave',
                        'pregnant_or_breastfeeding',
                        'requested_medical_or_family_leave',
                        'disabled_or_health_condition',
                        'member_of_union_or_works_council',
                        'caring_responsibilities',
                        'reported_concerns_with_workplace',
                      ].map((reason) => ({
                        in: [reason, { var: 'risk_assessment_reasons' }],
                      })),
                    },
                  ],
                },
                true,
              ],
            },
          },
        },
      },
      'x-rmt-meta': {
        jsfVersion: '1',
      },
    },
  },
};

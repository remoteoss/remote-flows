export const jsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              personal_email: {
                pattern: '^[a-zA-Z0-9 .]+$',
              },
            },
          },
          then: {
            properties: {
              personal_email: {
                'x-jsf-presentation': {
                  statement: {
                    title:
                      'Please make sure to add the employee personal email so we can get in contact with the employee after the termination process takes effect.',
                    inputType: 'statement',
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
              customer_informed_employee: {
                const: 'yes',
              },
            },
            required: ['customer_informed_employee'],
          },
          then: {
            properties: {
              customer_informed_employee_date: {
                type: 'string',
              },
              customer_informed_employee_description: {
                type: 'string',
              },
            },
            required: [
              'customer_informed_employee_date',
              'customer_informed_employee_description',
            ],
          },
          else: {
            properties: {
              customer_informed_employee_date: false,
              customer_informed_employee_description: false,
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
        {
          if: {
            properties: {
              agrees_to_pto_amount: {
                const: 'no',
              },
            },
            required: ['agrees_to_pto_amount'],
          },
          then: {
            properties: {
              agrees_to_pto_amount_notes: {
                type: 'string',
              },
            },
            required: ['agrees_to_pto_amount_notes'],
          },
          else: {
            properties: {
              agrees_to_pto_amount_notes: false,
              timesheet_file: false,
            },
          },
        },
      ],
      properties: {
        confidential: {
          description:
            'Confidential requests are visible only to you. Non-confidential requests are visible to all admins in your company.',
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
          title: 'Is this request confidential?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
            statement: {
              title:
                "Please do not inform the employee of their termination until we review your request for legal risks. When we approve your request, you can inform the employee and we'll take it from there.",
              inputType: 'statement',
              severity: 'warning',
            },
          },
        },
        customer_informed_employee: {
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
          title: 'Have you informed the employee of the termination?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        customer_informed_employee_date: {
          description: '',
          format: 'date',
          maxLength: 255,
          title: 'When the employee was told about the termination',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'date',
          },
        },
        customer_informed_employee_description: {
          description: '',
          maxLength: 1000,
          title: 'How did you share this information?',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        personal_email: {
          maxLength: 255,
          title: "Employee's personal email",
          description: 'We’ll use this for post-termination communication.',
          format: 'email',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'email',
          },
        },
        termination_reason: {
          title: 'Termination reason',
          description:
            'Make sure you choose an accurate termination reason to avoid unfair or unlawful dismissal claims.',
          type: 'string',
          oneOf: [
            {
              const: 'gross_misconduct',
              title: 'Gross misconduct',
            },
            {
              const: 'performance',
              title: 'Performance',
            },
            {
              const: 'workforce_reduction',
              title: 'Workforce Reduction',
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
              title: 'Incapacity To perform inherent duties',
            },
            {
              const: 'mutual_agreement',
              title: 'Mutual agreement',
            },
            {
              const: 'cancellation_before_start_date',
              title: 'Decision to cancel hiring before the employee starts',
            },
            {
              const: 'job_abandonment',
              title: 'Job abandonment',
            },
            {
              const: 'dissatisfaction_with_remote_service',
              title: 'Dissatisfaction with EOR service',
            },
            {
              const: 'end_of_fixed_term_contract_compliance_issue',
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
          title: 'Termination reason files',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'file',
            accept: '.pdf',
            multiple: true,
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
          },
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
          description: '',
          format: 'date',
          maxLength: 255,
          title: 'Proposed termination date',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'date',
          },
        },
        agrees_to_pto_amount: {
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
          title: 'Are these paid time off records correct?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        agrees_to_pto_amount_notes: {
          description:
            'Please provide details regarding any additional days taken, including specific dates, or any other inaccuracy in the time off data.',
          maxLength: 1000,
          title: 'Provide time off details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        timesheet_file: {
          description:
            'Upload a timesheet exported from your HR software. This way we can compare and confirm the total number of Paid time off.',
          title: 'Timesheet document',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'file',
            accept: '.pdf',
          },
        },
        acknowledge_termination_procedure: {
          description: '',
          title:
            'I, {{requesterName}} have read and agree to the procedures as defined in the termination form.',
          type: 'boolean',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'checkbox',
          },
        },
      },
      required: [
        'confidential',
        'customer_informed_employee',
        'personal_email',
        'termination_reason',
        'reason_description',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'proposed_termination_date',
        'agrees_to_pto_amount',
        'acknowledge_termination_procedure',
      ],
      type: 'object',
      'x-jsf-order': [
        'is_confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'personal_email',
        'termination_reason',
        'reason_description',
        'additional_comments',
        'termination_reason_files',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'will_challenge_termination_description',
        'proposed_termination_date',
        'agrees_to_pto_amount',
        'agrees_to_pto_amount_notes',
        'timesheet_file',
        'acknowledge_termination_procedure',
      ],
    },
  },
};

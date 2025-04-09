export const jsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              customer_informed_employee: {
                const: 'yes', // Ensure this matches the value in the form data
              },
            },
            required: ['customer_informed_employee'], // Ensure this field is required
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
            ], // Make the field required when condition is met
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
        is_confidential: {
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
        employer_confirmed_email: {
          description: '',
          maxLength: 255,
          title: 'Employee’s personal email',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text', // TODO: email type is not supported
          },
        },
        termination_reason: {
          title: 'Termination reason',
          description:
            'Make sure you choose an accurate termination reason to avoid unfair or unlawful dismissal claims.',
          type: 'string',
          oneOf: [
            {
              const: 'termination_by_customer_reason_gross_misconduct',
              title: 'Misconduct',
            },
            {
              const: 'termination_by_customer_reason_performance',
              title: 'Performance',
            },
            {
              const: 'termination_by_customer_reason_workforce_reduction',
              title: 'Workforce Reduction',
            },
            { const: 'termination_by_customer_reason_values', title: 'Values' },
            {
              const: 'termination_by_customer_reason_compliance_issue',
              title: 'Compliance issue',
            },
            {
              const:
                'termination_by_customer_reason_incapacity_to_perform_inherent_duties',
              title: 'Incapacity To perform inherent duties',
            },
            {
              const: 'termination_by_customer_reason_mutual_agreement',
              title: 'Mutual agreement',
            },
            {
              const: 'termination_by_customer_reason_job_abandonment',
              title: 'Job abandonment',
            },
            {
              const:
                'termination_by_customer_reason_dissatisfaction_with_remote_service',
              title: 'Dissatisfaction with remote service',
            },
            {
              const:
                'termination_by_customer_reason_end_of_fixed_term_contract',
              title: 'End of fixed-term contract',
            },
            {
              const: 'termination_by_customer_reason_background_check',
              title: 'Failed background check',
            },
            { const: 'termination_by_customer_reason_other', title: 'Other' },
          ],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        termination_reason_description: {
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
        risk_assessment_reasons: {
          description:
            'Please upload any supporting documents regarding the termination reason.',
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
      },
      required: [
        'is_confidential',
        'customer_informed_employee',
        'employer_confirmed_email',
        'termination_reason',
        'termination_reason_description',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'proposed_termination_date',
        'agrees_to_pto_amount',
      ],
      type: 'object',
      'x-jsf-order': [
        'is_confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'employer_confirmed_email',
        'termination_reason',
        'termination_reason_description',
        'additional_comments',
        'termination_reason_files',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'will_challenge_termination_description',
        'proposed_termination_date',
        'agrees_to_pto_amount',
        'agrees_to_pto_amount_notes',
        'timesheet_file',
      ],
    },
  },
};

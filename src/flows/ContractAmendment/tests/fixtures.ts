export const contractAmendementSchema = {
  data: {
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: {
            work_schedule: {
              const: 'full_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          properties: {
            annual_gross_salary: {
              minimum: 1218000,
              'x-jsf-errorMessage': {
                minimum:
                  'In Portugal, full-time employees are entitled to a minimum annual salary of €12,180.00.',
              },
            },
          },
        },
      },
      {
        else: {
          properties: {
            part_time_salary_confirmation: false,
          },
        },
        if: {
          properties: {
            work_schedule: {
              const: 'part_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          properties: {
            part_time_salary_confirmation: {
              type: 'string',
            },
          },
          required: ['part_time_salary_confirmation'],
        },
      },
      {
        else: {
          properties: {
            reason_for_change_description: false,
          },
        },
        if: {
          properties: {
            reason_for_change: {
              const: 'other',
            },
          },
          required: ['reason_for_change'],
        },
        then: {
          required: ['reason_for_change_description'],
        },
      },
      {
        else: {
          properties: {
            salary_decrease_reason_description: false,
          },
        },
        if: {
          properties: {
            salary_decrease_reason: {
              const: 'other',
            },
          },
          required: ['salary_decrease_reason'],
        },
        then: {
          required: ['salary_decrease_reason_description'],
        },
      },
      {
        else: {
          properties: {
            additional_comments: false,
          },
        },
        if: {
          properties: {
            additional_comments_toggle: {
              const: true,
            },
          },
          required: ['additional_comments_toggle'],
        },
        then: {
          required: ['additional_comments'],
        },
      },
      {
        else: {
          properties: {
            contract_duration_type: {
              const: 'indefinite',
              description:
                'I acknowledge that only Indefinite-term Contracts are available. Remote does not support Fixed-term Contracts in Portugal.',
              oneOf: [
                {
                  const: 'indefinite',
                  title: 'Indefinite',
                },
              ],
              title: 'Contract duration',
            },
            contract_end_date: false,
          },
        },
        if: {
          properties: {
            contract_duration_type: {
              const: 'fixed_term',
            },
          },
          required: ['contract_duration_type'],
        },
        then: {
          required: ['contract_end_date'],
        },
      },
      {
        else: {
          else: {
            properties: {
              work_hours_per_week: false,
            },
          },
          if: {
            properties: {
              work_schedule: {
                const: 'full_time',
              },
            },
            required: ['work_schedule'],
          },
          then: {
            properties: {
              work_hours_per_week: {
                const: 40,
                default: 40,
                description:
                  'All employees in Portugal are required to work 40 hours in a full-time position.',
                'x-jsf-presentation': {
                  statement: {
                    title: 'Total of <b>40 hours</b> per week.',
                  },
                },
              },
            },
            required: ['work_hours_per_week'],
          },
        },
        if: {
          properties: {
            work_schedule: {
              const: 'part_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          properties: {
            work_hours_per_week: {
              maximum: 39,
              minimum: 1,
            },
          },
          required: ['work_hours_per_week'],
        },
      },
      {
        else: {
          properties: {
            salary_decrease_reason: false,
            was_employee_informed: false,
          },
        },
        if: {
          properties: {
            annual_gross_salary: {
              maximum: 34999999,
            },
          },
          required: ['annual_gross_salary'],
        },
        then: {
          required: ['salary_decrease_reason', 'was_employee_informed'],
        },
      },
      {
        if: {
          properties: {
            annual_gross_salary: {
              maximum: 34999999,
            },
          },
          required: ['annual_gross_salary'],
        },
        then: {
          properties: {
            annual_gross_salary: {
              'x-jsf-presentation': {
                statement: {
                  description:
                    'The earliest effective date of this amendment may not be the date specified above, but the date when the employee signs.',
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
            annual_gross_salary: {
              maximum: 29750000,
            },
          },
          required: ['annual_gross_salary'],
        },
        then: {
          properties: {
            annual_gross_salary: {
              'x-jsf-logic-computedAttrs': {
                'x-jsf-presentation': {
                  statement: {
                    description:
                      'The salary is changing from €350000.00 to €{{computed_current_annual_gross_salary}}. Please, check if the amount is correct. The earliest effective date of this amendment may not be the date specified above, but the date when the employee signs.',
                    inputType: 'statement',
                    severity: 'warning',
                    title: "You're requesting a significant salary change",
                  },
                },
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            annual_gross_salary: {
              minimum: 40250000,
            },
          },
          required: ['annual_gross_salary'],
        },
        then: {
          properties: {
            annual_gross_salary: {
              'x-jsf-logic-computedAttrs': {
                'x-jsf-presentation': {
                  statement: {
                    description:
                      'The salary is changing from €350000.00 to €{{computed_current_annual_gross_salary}}. Please, check if the amount is correct.',
                    inputType: 'statement',
                    severity: 'warning',
                    title: "You're requesting a significant salary change",
                  },
                },
              },
            },
          },
        },
      },
    ],
    properties: {
      additional_comments: {
        description: 'Please include any additional changes or comments.',
        maxLength: 20000,
        title: 'Additional changes',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      additional_comments_toggle: {
        title:
          'I need to make additional changes that are not covered in the fields above',
        type: 'boolean',
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
      annual_gross_salary: {
        description: 'Annual gross salary in European Euro (EUR).',
        title: 'Annual gross salary',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
        },
      },
      contract_duration_type: {
        oneOf: [
          {
            const: 'indefinite',
            title: 'Indefinite',
          },
          {
            const: 'fixed_term',
            title: 'Fixed Term',
          },
        ],
        title: 'Contract duration',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn about contract duration types',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 4410443814157,
              title: 'Help center unavailable',
            },
          },
        },
      },
      contract_end_date: {
        format: 'date',
        maxLength: 255,
        title: 'Contract end date',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'date',
        },
      },
      effective_date: {
        description:
          'If you want to backdate this amendment, we cannot guarantee your preferred date is possible due to country-specific laws. Please enter your preferred date, and we’ll reach out to you if there are any issues.',
        format: 'date',
        title: 'Effective date of change',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'date',
          minDate: '2025-04-01',
        },
      },
      experience_level: {
        description:
          'Please select the experience level that aligns with this role based on the job description (not the employees overall experience).',
        oneOf: [
          {
            const:
              'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
            description:
              'Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
            title: 'Level 2 - Entry Level',
          },
          {
            const:
              'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
            description:
              'Employees who perform independently tasks and/or with coordination and control functions',
            title: 'Level 3 - Associate',
          },
          {
            const:
              'Level 4 - Mid-Senior level - Employees with high professional functions, executive management responsibilities, who supervise the production with an initiative and operational autonomy within the responsibilities delegated to them',
            description:
              'Employees with high professional functions, executive management responsibilities, who supervise the production with an initiative and operational autonomy within the responsibilities delegated to them',
            title: 'Level 4 - Mid-Senior level',
          },
          {
            const:
              "Level 5 - Director - Directors perform functions of an ongoing nature that are of significant importance for the development and implementation of the company's objectives",
            description:
              "Directors perform functions of an ongoing nature that are of significant importance for the development and implementation of the company's objectives",
            title: 'Level 5 - Director',
          },
          {
            const:
              'Level 6 - Executive - An Executive is responsible for running an organization. They create plans to help their organizations grow',
            description:
              'An Executive is responsible for running an organization. They create plans to help their organizations grow',
            title: 'Level 6 - Executive',
          },
        ],
        title: 'Experience level',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'radio',
        },
      },
      job_title: {
        description: 'Role of the employee',
        maxLength: 255,
        title: 'Job title',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      part_time_salary_confirmation: {
        const: 'acknowledged',
        description:
          "We'll include salary changes in the employment agreement amendment, so please double-check that it's correct.",
        title:
          'I confirm that this amount is the full annual salary for this part-time employee.',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
      reason_for_change: {
        description:
          'This is for internal reference only. It will not be visible to the employee or included on documents shared with the employee.',
        oneOf: [
          {
            const: 'annual_pay_adjustment',
            title: 'Annual pay adjustment',
          },
          {
            const: 'error_correction',
            title: 'Error correction',
          },
          {
            const: 'job_change_reevaluation',
            title: 'Job change/reevaluation',
          },
          {
            const: 'promotion',
            title: 'Promotion',
          },
          {
            const: 'other',
            title: 'Other',
          },
          {
            const: null,
            title: 'N/A',
          },
        ],
        title: 'Reason for change',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      reason_for_change_description: {
        maxLength: 1000,
        title: 'Please specify the reasons for this change',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      role_description: {
        description:
          'Please add at least 3 responsibilities, at least 100 characters in total.',
        maxLength: 10000,
        minLength: 100,
        title: 'Role description',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019255579405,
              title: 'Help center unavailable',
            },
          },
        },
      },
      salary_decrease_reason: {
        oneOf: [
          {
            const: 'change_in_working_hours',
            title: 'Change in working hours',
          },
          {
            const: 'trade_salary_for_equity',
            title: 'Trade salary for equity',
          },
          {
            const: 'error_in_initial_salary',
            title: 'Error in initial salary',
          },
          {
            const: 'role_change_or_demotion',
            title: 'Role change/demotion',
          },
          {
            const: 'compensation_restructure',
            title: 'Compensation restructure',
          },
          {
            const: 'other',
            title: 'Other',
          },
        ],
        title: 'Reason for salary decrease',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      salary_decrease_reason_description: {
        maxLength: 1000,
        title: 'Please explain the reasons for the salary decrease',
        type: ['string'],
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      was_employee_informed: {
        oneOf: [
          {
            const: 'yes',
            title: 'Yes',
          },
          {
            const: 'no',
            title: 'No',
          },
          {
            const: null,
          },
        ],
        title: 'Was the employee informed?',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'radio',
        },
      },
      work_hours_per_week: {
        description:
          'Please indicate the number of hours the employee will work per week.',
        title: 'Work hours per week',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      work_schedule: {
        oneOf: [
          {
            const: 'full_time',
            title: 'Full-time',
          },
          {
            const: 'part_time',
            title: 'Part-time',
          },
        ],
        title: 'Type of employee',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
    },
    required: [
      'annual_gross_salary',
      'effective_date',
      'job_title',
      'role_description',
      'experience_level',
      'contract_duration_type',
      'work_schedule',
      'work_hours_per_week',
    ],
    type: 'object',
    'x-jsf-logic': {
      computedValues: {
        computed_current_annual_gross_salary: {
          rule: {
            '/': [
              {
                var: 'annual_gross_salary',
              },
              100,
            ],
          },
        },
      },
    },
    'x-jsf-order': [
      'reason_for_change',
      'reason_for_change_description',
      'effective_date',
      'job_title',
      'role_description',
      'contract_duration_type',
      'contract_end_date',
      'work_schedule',
      'work_hours_per_week',
      'part_time_salary_confirmation',
      'annual_gross_salary',
      'salary_decrease_reason',
      'salary_decrease_reason_description',
      'was_employee_informed',
      'experience_level',
      'additional_comments_toggle',
      'additional_comments',
    ],
  },
};

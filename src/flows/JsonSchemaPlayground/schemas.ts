export const SAMPLE_SCHEMAS = {
  'france-wage-portage-simplified': {
    name: 'France Wage Portage (Simplified)',
    description:
      'Simplified version without complex allOf conditions that hide computed fields',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        annual_gross_salary: {
          description:
            "Enter the employee's annual gross base salary. This amount is used to calculate payroll and must meet the legal minimum in France.",
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
          description:
            'Under French Wage Portage regulations, assignments with the same client are limited to 18 months for fixed-term contracts and 36 months for indefinite contracts.',
          oneOf: [
            {
              const: 'indefinite',
              title: 'Indefinite contract (without end date)',
            },
            {
              const: 'fixed_term',
              title: 'Fixed-term contract (with end date)',
            },
          ],
          title: 'Contract duration type',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
        business_allowance_amount: {
          title: 'Business allowance amount',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            const: 'computed_business_allowance_amount',
            default: 'computed_business_allowance_amount',
            'x-jsf-presentation': {
              statement: {
                title:
                  'Business Allowance: {{computed_business_allowance_display}} EUR',
                description:
                  'Mandatory 5% allowance automatically calculated from your gross salary.',
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        business_allowances_statement: {
          title: 'Mandatory allowances',
          type: 'null',
          'x-jsf-logic-computedAttrs': {
            'x-jsf-presentation': {
              statement: {
                description:
                  "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% financial reserve: {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        financial_reserve_amount: {
          title: 'Financial reserve amount',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            const: 'computed_financial_reserve_amount',
            default: 'computed_financial_reserve_amount',
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
      },
      required: [
        'annual_gross_salary',
        'contract_duration_type',
        'business_allowance_amount',
        'financial_reserve_amount',
      ],
      'x-jsf-logic': {
        computedValues: {
          computed_annual_gross_salary_display: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '/': [{ var: 'annual_gross_salary' }, 100] },
                null,
              ],
            },
          },
          computed_business_allowance_amount: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '*': [{ var: 'annual_gross_salary' }, 0.05] },
                null,
              ],
            },
          },
          computed_business_allowance_display: {
            rule: {
              if: [
                { var: 'business_allowance_amount' },
                { '/': [{ var: 'business_allowance_amount' }, 100] },
                null,
              ],
            },
          },
          computed_financial_reserve_amount: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '*': [{ var: 'annual_gross_salary' }, 0.1] },
                null,
              ],
            },
          },
          computed_financial_reserve_display: {
            rule: {
              if: [
                { var: 'financial_reserve_amount' },
                { '/': [{ var: 'financial_reserve_amount' }, 100] },
                null,
              ],
            },
          },
          computed_total_with_allowance_display: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                {
                  '/': [
                    {
                      '+': [
                        { var: 'annual_gross_salary' },
                        { var: 'business_allowance_amount' },
                        { var: 'financial_reserve_amount' },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    },
  },
  'france-wage-portage': {
    name: 'France Wage Portage Schema',
    description:
      'Complex schema for France wage portage employment with conditional logic',
    schema: {
      additionalProperties: false,
      allOf: [
        {
          else: {
            properties: {
              non_compete_clause_compensation_amount: false,
              non_compete_restricted_activities: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
              non_compete_clause_apply: {
                const: 'yes',
              },
            },
            required: ['non_compete_clause_apply', 'annual_gross_salary'],
          },
          then: {
            properties: {
              non_compete_clause_compensation_amount: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'computed_non_compete_clause_compensation_amount_in_cents',
                  default:
                    'computed_non_compete_clause_compensation_amount_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'The employee will receive this monthly compensation after termination for the entire non-compete period.',
                      title:
                        '{{computed_non_compete_clause_compensation_amount}} XXX non-compete compensation amount',
                    },
                  },
                },
              },
            },
            required: [
              'non_compete_clause_compensation_amount',
              'non_compete_restricted_activities',
            ],
          },
        },
        {
          else: {
            properties: {
              non_compete_clause_compensation_amount: false,
              non_compete_clause_halt_period_months: false,
              non_compete_compensation_salary_percentage: false,
              non_compete_restricted_activities: false,
            },
          },
          if: {
            properties: {
              non_compete_clause_apply: {
                const: 'yes',
              },
            },
            required: ['non_compete_clause_apply'],
          },
          then: {
            required: [
              'non_compete_compensation_salary_percentage',
              'non_compete_clause_halt_period_months',
            ],
          },
        },
        {
          else: {
            properties: {
              mission_duration: false,
            },
          },
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            required: ['mission_duration'],
          },
        },
        {
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            properties: {
              contract_duration_type: {
                oneOf: [
                  {
                    const: 'indefinite',
                    description:
                      'After this period, the engagement must end unless it qualifies as a new assignment with a different scope.',
                    title:
                      'Indefinite contract with <strong>36 months max duration</strong> for France.',
                  },
                  {
                    const: 'fixed_term',
                    nested_fields: ['contract_end_date'],
                    title: 'Fixed-term contract',
                  },
                ],
              },
            },
          },
        },
        {
          else: {
            properties: {
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
            properties: {
              contract_end_date: {
                type: 'string',
              },
            },
            required: ['contract_end_date'],
          },
        },
        {
          else: {
            else: {
              properties: {
                business_allowance_ack: false,
                business_allowances_statement: false,
                home_office_allowance: false,
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
              properties: {
                business_allowance_ack: {
                  title:
                    "I understand the 5% allowance applies each month and a 10% indemnity is paid in addition to the employee's total earnings at the end of their contract.",
                },
                business_allowances_statement: {
                  'x-jsf-logic-computedAttrs': {
                    'x-jsf-presentation': {
                      statement: {
                        description:
                          "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% Indemnity (end of contract): {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
                      },
                    },
                  },
                },
              },
              required: ['business_allowance_ack', 'home_office_allowance'],
            },
          },
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            required: ['business_allowance_ack', 'home_office_allowance'],
          },
        },
        {
          else: {
            properties: {
              business_allowance_ack: false,
              business_allowances_statement: false,
              home_office_allowance: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
            },
            required: ['annual_gross_salary'],
          },
          then: {},
        },
        {
          else: {
            properties: {
              business_allowance_amount: false,
              financial_reserve_amount: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
            },
            required: ['annual_gross_salary'],
          },
          then: {
            properties: {
              business_allowance_amount: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_business_allowance_amount',
                  default: 'computed_business_allowance_amount',
                },
              },
              financial_reserve_amount: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_financial_reserve_amount',
                  default: 'computed_financial_reserve_amount',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              work_hours_per_week: {
                const: 'lump_sum',
              },
            },
            required: ['work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3667800,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €36,678.00 or greater for Lump-sum contracts.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'expert',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3667800,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €36,678.00 or greater for the Expert experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'senior',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3236300,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €32,363.00 or greater for the Senior experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'junior',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3020500,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €30,205.00 or greater for the Junior experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'premier_niveau',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 2718500,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €27,185.00 or greater for the First-Level experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              additional_job_title_eligibility_check_result: {
                const: 'no',
              },
            },
            required: ['additional_job_title_eligibility_check_result'],
          },
          then: {
            properties: {
              role_description: {
                'x-jsf-presentation': {
                  statement: {
                    inputType: 'statement',
                    severity: 'error',
                    title:
                      'Unfortunately based on the information entered, we cannot hire this role in France.',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              additional_job_title_eligibility_check_result: {
                const: 'maybe',
              },
            },
            required: ['additional_job_title_eligibility_check_result'],
          },
          then: {
            properties: {
              role_description: {
                'x-jsf-presentation': {
                  statement: {
                    description:
                      "Complete the add employee process and we'll let you know as soon as we can if we can hire this role.",
                    inputType: 'statement',
                    severity: 'info',
                    title:
                      "Remote AI isn't sure if we can hire this role in France",
                  },
                },
              },
            },
          },
        },
        {
          else: {
            properties: {
              commissions_ack: false,
              commissions_details: false,
            },
          },
          if: {
            properties: {
              has_commissions: {
                const: 'yes',
              },
            },
            required: ['has_commissions'],
          },
          then: {
            properties: {
              commissions_ack: {
                type: ['string'],
              },
              commissions_details: {
                type: ['string'],
              },
            },
            required: ['commissions_details', 'commissions_ack'],
          },
        },
        {
          else: {
            properties: {
              bonus_amount: false,
              bonus_details: false,
            },
          },
          if: {
            properties: {
              has_bonus: {
                const: 'yes',
              },
            },
            required: ['has_bonus'],
          },
          then: {
            properties: {
              bonus_details: {
                type: ['string'],
              },
            },
            required: ['bonus_details'],
          },
        },
        {
          else: {
            properties: {
              signing_bonus_amount: false,
            },
          },
          if: {
            properties: {
              has_signing_bonus: {
                const: 'yes',
              },
            },
            required: ['has_signing_bonus'],
          },
          then: {
            properties: {
              signing_bonus_amount: {
                type: ['integer'],
              },
            },
            required: ['signing_bonus_amount'],
          },
        },
        {
          else: {
            if: {
              properties: {
                probation_length_recommended: {
                  const: 'custom',
                },
              },
              required: ['probation_length_recommended'],
            },
            then: {
              else: {
                properties: {
                  probation_length_days: false,
                },
                required: ['probation_length'],
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
                properties: {
                  probation_length: false,
                },
                required: ['probation_length_days'],
              },
            },
          },
          if: {
            properties: {
              probation_length_recommended: {
                const: 'recommended',
              },
            },
            required: ['probation_length_recommended'],
          },
          then: {
            allOf: [
              {
                else: {
                  allOf: [
                    {
                      if: {
                        properties: {
                          has_probation_period: {
                            const: 'yes',
                          },
                        },
                        required: ['has_probation_period'],
                      },
                      then: {
                        required: ['probation_length'],
                      },
                    },
                  ],
                  properties: {
                    probation_length: {
                      'x-jsf-logic-computedAttrs': {
                        const: 'probation_length_maximum_months',
                        default: 'probation_length_maximum_months',
                      },
                    },
                    probation_length_days: false,
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
                  allOf: [
                    {
                      if: {
                        properties: {
                          has_probation_period: {
                            const: 'yes',
                          },
                        },
                        required: ['has_probation_period'],
                      },
                      then: {
                        required: ['probation_length_days'],
                      },
                    },
                  ],
                  properties: {
                    probation_length: false,
                    probation_length_days: {
                      'x-jsf-logic-computedAttrs': {
                        const: 'probation_length_days_recommended',
                        default: 'probation_length_days_recommended',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          else: {
            properties: {
              has_probation_period: {
                const: 'no',
                default: 'no',
              },
            },
          },
          if: {
            anyOf: [
              {
                properties: {
                  probation_length: {
                    exclusiveMinimum: 0,
                  },
                },
                required: ['probation_length'],
              },
              {
                properties: {
                  probation_length_days: {
                    exclusiveMinimum: 0,
                  },
                },
                required: ['probation_length_days'],
              },
            ],
          },
          then: {
            properties: {
              has_probation_period: {
                const: 'yes',
                default: 'yes',
              },
            },
          },
        },
        {
          else: {
            else: {
              properties: {
                non_compete_clause_apply: false,
                probation_length_recommended: false,
                contract_end_date: false,
                business_allowance_ack: false,
                work_hours_per_week: false,
                non_compete_restricted_activities: false,
                work_experience: false,
                has_commissions: false,
                has_bonus: false,
                primary_contact_point: false,
                job_title_check_enabled: false,
                business_allowance_amount: false,
                key_skills: false,
                annual_gross_salary: false,
                contract_duration_type: false,
                available_pto: false,
                probation_length: false,
                experience_level: false,
                bonus_details: false,
                role_description: false,
                business_allowances_statement: false,
                has_probation_period: false,
                signing_bonus_amount: false,
                wage_portage_eligibility: false,
                non_compete_clause_compensation_amount: false,
                commissions_details: false,
                provided_systems: false,
                financial_reserve_amount: false,
                non_compete_clause_halt_period_months: false,
                field_of_work: false,
                work_schedule: false,
                mission_deliverables_cadence: false,
                non_compete_compensation_salary_percentage: false,
                work_address_is_home_address: false,
                bonus_amount: false,
                professional_qualifications: false,
                home_office_allowance: false,
                additional_job_title_eligibility_check_slug: false,
                probation_length_days: false,
                employee_travel_required: false,
                has_signing_bonus: false,
                additional_job_title_eligibility_check_result: false,
                provided_equipment: false,
                mission_duration: false,
                commissions_ack: false,
              },
            },
            if: {
              anyOf: [
                {
                  properties: {
                    has_wage_portage_higher_degree: {
                      const: 'yes',
                    },
                  },
                  required: ['has_wage_portage_higher_degree'],
                },
                {
                  properties: {
                    has_wage_portage_years_of_experience: {
                      const: 'yes',
                    },
                  },
                  required: ['has_wage_portage_years_of_experience'],
                },
              ],
            },
            then: {
              properties: {
                wage_portage_eligibility: false,
              },
              required: [
                'non_compete_clause_apply',
                'field_of_work',
                'work_experience',
                'key_skills',
                'professional_qualifications',
                'primary_contact_point',
                'provided_equipment',
                'provided_systems',
                'mission_deliverables_cadence',
                'contract_duration_type',
                'work_hours_per_week',
                'annual_gross_salary',
                'probation_length_recommended',
                'job_title_check_enabled',
                'has_probation_period',
                'available_pto',
                'experience_level',
                'has_signing_bonus',
                'has_bonus',
                'has_commissions',
                'role_description',
                'work_address_is_home_address',
                'employee_travel_required',
                'has_wage_portage_higher_degree',
                'has_wage_portage_years_of_experience',
                'work_schedule',
              ],
            },
          },
          if: {
            properties: {
              has_wage_portage_higher_degree: {
                const: 'no',
              },
              has_wage_portage_years_of_experience: {
                const: 'no',
              },
            },
            required: [
              'has_wage_portage_higher_degree',
              'has_wage_portage_years_of_experience',
            ],
          },
          then: {
            properties: {
              non_compete_clause_apply: false,
              probation_length_recommended: false,
              contract_end_date: false,
              business_allowance_ack: false,
              work_hours_per_week: false,
              non_compete_restricted_activities: false,
              work_experience: false,
              has_commissions: false,
              has_bonus: false,
              primary_contact_point: false,
              job_title_check_enabled: false,
              business_allowance_amount: false,
              key_skills: false,
              annual_gross_salary: false,
              contract_duration_type: false,
              available_pto: false,
              probation_length: false,
              experience_level: false,
              bonus_details: false,
              role_description: false,
              business_allowances_statement: false,
              has_probation_period: false,
              signing_bonus_amount: false,
              wage_portage_eligibility: {
                const: 'no',
                default: 'no',
                'x-jsf-presentation': {
                  inputType: 'statement',
                },
              },
              non_compete_clause_compensation_amount: false,
              commissions_details: false,
              provided_systems: false,
              financial_reserve_amount: false,
              non_compete_clause_halt_period_months: false,
              field_of_work: false,
              work_schedule: false,
              mission_deliverables_cadence: false,
              non_compete_compensation_salary_percentage: false,
              work_address_is_home_address: false,
              bonus_amount: false,
              professional_qualifications: false,
              home_office_allowance: false,
              additional_job_title_eligibility_check_slug: false,
              probation_length_days: false,
              employee_travel_required: false,
              has_signing_bonus: false,
              additional_job_title_eligibility_check_result: false,
              provided_equipment: false,
              mission_duration: false,
              commissions_ack: false,
            },
          },
        },
      ],
      properties: {
        non_compete_clause_apply: {
          description:
            'Prevents the employee from joining or starting a competing business. Not allowed during employment under French Wage Portage law. Post-termination only, with limits and required compensation.',
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
          title:
            'Do you want to apply post-termination restrictions (non-compete)?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        probation_length_recommended: {
          description:
            "A probation period allows for more flexible termination, especially for performance-related issues. Below are our recommendations, aligned with the wage portage collective agreement. Termination during probation requires notice based on the employee's tenure. <a href='https://support.remote.com/hc/en-us/articles/43837197759501-How-do-probation-periods-work-in-France-for-wage-portage-employees' target='_blank'>Learn more about probation periods</a> and <a href='https://support.remote.com/hc/en-us/articles/43837333997325-How-do-I-terminate-an-employee-during-their-probation-period-in-France-wage-portage' target='_blank'>terminations during probation</a>",
          oneOf: [
            {
              const: 'recommended',
              title: '4 months',
              'x-jsf-logic-computedAttrs': {
                description: '{{recommended_probation_description}}',
                title: '{{recommended_probation_label}}',
              },
              'x-jsf-presentation': {
                recommended: true,
              },
            },
            {
              const: 'custom',
              title: 'Choose your own length',
            },
          ],
          title: 'Probation period',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        contract_end_date: {
          description:
            'Fixed-term contracts are limited to a maximum duration of 18 months.',
          format: 'date',
          maxLength: 255,
          title: 'Contract end date',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'date',
            maxDate: '2028-03-02',
            minDate: '2026-09-03',
          },
        },
        business_allowance_ack: {
          const: 'acknowledged',
          title:
            'I understand that the 5% allowance applies automatically. A mandatory, non-waivable 10% financial reserve is withheld from the employees monthly base salary during assignments.',
          type: 'string',
          'x-jsf-presentation': {
            description:
              "<a href='https://support.remote.com/hc/en-us/articles/43837622285709-Wage-Portage-France-Mandatory-Allowances' target='_blank'>Learn more about mandatory allowances</a>",
            inputType: 'checkbox',
          },
        },
        work_hours_per_week: {
          description: '',
          oneOf: [
            {
              const: '35',
              description:
                'This is a standard 35-hour contract for full-time employees. Employees can receive overtime with written approval from their manager.',
              title: '35-hour contract',
            },
            {
              const: 'lump_sum',
              description:
                'This is a 218-day-per-year contract with no fixed working hours or overtime. Employees receive additional rest days to ensure they work exactly 218 days per year.',
              title: 'Lump-sum contract in days',
            },
          ],
          title: 'Work hours per week',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
        non_compete_restricted_activities: {
          description:
            "Please define the specific professional activities the employee is prohibited from engaging in after leaving the company, not just a general \"no competition\" clause. <a href='https://support.remote.com/hc/en-us/articles/43837822723981-How-do-non-compete-restricted-activities-work-in-France-wage-portage' target='_blank'>Learn more</a>",
          maxLength: 5000,
          minLength: 20,
          title: 'Restricted activities',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        work_experience: {
          description:
            'Briefly describe the required professional background and level of experience (e.g. "5+ years of experience in digital marketing, including work with multinational clients").',
          maxLength: 1000,
          title: 'Relevant experience',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        has_commissions: {
          description:
            "Will the employee be eligible to participate in the Company's commission plan? The terms and conditions of this arrangement must be communicated to the employee separately.",
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
          title: 'Offer commission?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_bonus: {
          description:
            'These can include things like performance-related bonuses.',
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
          title: 'Offer other bonuses?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 18019142406029,
                title: 'Help center unavailable',
              },
            },
          },
        },
        has_wage_portage_higher_degree: {
          description:
            "(e.g. BTS, DUT, Licence, Master's degree, or equivalent)",
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
          title: 'Does your employee hold a higher education qualification?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        primary_contact_point: {
          description:
            'Enter the name of the person the employee will primarily work with or contact during the assignment.',
          maxLength: 255,
          title: 'Primary point of contact',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        job_title_check_enabled: {
          const: true,
          default: true,
          enum: [true],
          oneOf: [
            {
              const: true,
              title: 'Yes',
            },
            {
              const: false,
              title: 'No',
            },
          ],
          type: 'boolean',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        business_allowance_amount: {
          title: 'Business allowance amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        key_skills: {
          description:
            'List the key skills required to perform the mission (e.g. client communication, project management, software development).',
          maxLength: 1000,
          title: 'Required key skills',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        annual_gross_salary: {
          description:
            "Enter the employee's annual gross base salary. This amount is used to calculate payroll and must meet the legal minimum in France.",
          title: 'Annual gross salary',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 27657390602637,
                title: 'Help center unavailable',
              },
            },
          },
        },
        contract_duration_type: {
          description:
            'Under French Wage Portage regulations, assignments with the same client are limited to 18 months for fixed-term contracts and 36 months for indefinite contracts.',
          oneOf: [
            {
              const: 'indefinite',
              title:
                'Indefinite contract with <strong>36 months max duration</strong> for France.',
            },
            {
              const: 'fixed_term',
              nested_fields: ['contract_end_date'],
              title: 'Fixed-term contract',
            },
          ],
          title: 'Contract duration',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more about French contract duration',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 43837143193357,
                title: 'Help center unavailable',
              },
            },
          },
        },
        available_pto: {
          const: 30,
          default: 30,
          description:
            'Employees are entitled to 30 business days of paid leave per year (equivalent to 2.5 days per month), in line with French labor law and the wage portage collective agreement. Public holidays are excluded and vary by location.',
          title: 'Number of paid time off days',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
            statement: {
              title: 'Number of paid time off days: <strong>30 days</strong>',
            },
          },
        },
        probation_length: {
          description:
            "If you enter a value of '0', the employee will not have a probation period.",
          minimum: 0,
          title: 'Probation period in months',
          type: 'number',
          'x-jsf-logic-computedAttrs': {
            maximum: 'probation_length_maximum_months',
            'x-jsf-presentation': {
              inputType: 'probation_length_input_type',
            },
          },
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        experience_level: {
          description:
            'Select the employee’s level under the French Wage Portage collective agreement. This level determines applicable pay scales, benefits, and autonomy expectations, and applies only within the Wage Portage framework (not internal career levels).',
          oneOf: [
            {
              const: 'premier_niveau',
              description:
                'Entry-level professional performing straightforward services for the client. Mission duration cannot exceed 24 months.',
              title:
                'Salarié porté premier niveau — First-Level Ported Employee',
            },
            {
              const: 'junior',
              description:
                'Professional with moderate experience who can assess company needs, propose improvements and participate in implementation.',
              title: 'Salarié porté junior — Junior Ported Employee',
            },
            {
              const: 'senior',
              description:
                'Experienced professional who performs complex services with a significant level of initiative and responsibility.',
              title: 'Salarié porté senior — Senior Ported Employee',
            },
            {
              const: 'expert',
              description:
                'Highly-skilled professional who performs complex services which require a high level of initiative and responsibility.',
              title: 'Salarié porté expert — Expert Ported Employee',
            },
          ],
          title: 'Experience Level',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 41652078093965,
                title: 'Help center unavailable',
              },
            },
          },
        },
        bonus_details: {
          description: 'Bonus type, payment frequency, and more.',
          maxLength: 1000,
          title: 'Other bonus details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        role_description: {
          description:
            'Please add at least 3 responsibilities, at least 100 characters in total.',
          maxLength: 5000,
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
        business_allowances_statement: {
          title: 'Mandatory allowances',
          type: 'null',
          'x-jsf-logic-computedAttrs': {
            'x-jsf-presentation': {
              statement: {
                description:
                  "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% financial reserve: {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
            meta: {
              ignoreValue: true,
            },
            statement: {
              inputType: 'statement',
              severity: 'info',
            },
          },
        },
        has_probation_period: {
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
          title: 'Probation period',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        signing_bonus_amount: {
          title: 'Signing bonus amount',
          type: ['integer', 'null'],
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        wage_portage_eligibility: {
          const: 'yes',
          default: 'yes',
          enum: ['yes'],
          title: 'Wage portage eligibility',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'hidden',
            meta: {
              ignoreValue: true,
            },
            statement: {
              description:
                'Based on your responses, the employee is not eligible for hire under wage portage, and we’re unable to proceed with onboarding. If you have any questions, please contact help@remote.com.',
              inputType: 'statement',
              severity: 'error',
              title: 'Not eligible for wage portage',
            },
          },
        },
        non_compete_clause_compensation_amount: {
          description:
            'The employee will receive this monthly compensation after termination for the entire non-compete period.',
          title: 'Non-compete compensation amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'XXX',
            inputType: 'money',
          },
        },
        commissions_details: {
          description: 'Payment amount, frequency, and more.',
          maxLength: 1000,
          title: 'Commission details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        provided_systems: {
          description:
            'Select the tools and system access to enable the employee to perform the mission (e.g. license(s), shared drive, etc.).',
          items: {
            anyOf: [
              {
                const: 'email',
                title: 'Email',
              },
              {
                const: 'workspace_account',
                title: 'Workspace account',
              },
              {
                const: 'onboarding_or_compliance_training',
                title: 'Onboarding or compliance training',
              },
              {
                const: 'shared_drive',
                title: 'Shared Drive',
              },
              {
                const: 'intranet',
                title: 'Intranet',
              },
              {
                const: 'manuals',
                title: 'Manuals',
              },
              {
                const: 'sops',
                title: 'Standard Operating Procedures (SOPs)',
              },
            ],
          },
          title: 'Provided systems and access',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        financial_reserve_amount: {
          title: 'Financial reserve amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        non_compete_clause_halt_period_months: {
          description:
            'Non-compete clauses in France can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
          maximum: 12,
          minimum: 1,
          title: 'Duration in months',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        field_of_work: {
          description:
            'Specify the industry or functional area relevant to the mission (e.g. IT consulting, healthcare operations, legal and compliance, finance and risk management, UX/UI design).',
          maxLength: 255,
          title: 'Relevant field of work',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        work_schedule: {
          const: 'full_time',
          default: 'full_time',
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
            inputType: 'hidden',
          },
        },
        mission_deliverables_cadence: {
          description:
            'Select how often the employee is expected to share progress updates or deliverables for this mission.',
          oneOf: [
            {
              const: 'daily',
              title: 'Daily',
            },
            {
              const: 'weekly',
              title: 'Weekly',
            },
            {
              const: 'monthly',
              title: 'Monthly',
            },
            {
              const: 'quarterly',
              title: 'Quarterly',
            },
          ],
          title: 'Mission deliverables cadence',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        non_compete_compensation_salary_percentage: {
          default: 30,
          description:
            "In France, non-compete pay must be 30% of monthly base salary throughout the post termination restrictions. A reserve is required to cover the mandatory payments. <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment-in-Employ-of-Record' target='_blank'>Learn about reserve payments</a>",
          readOnly: true,
          title: 'Non-compete salary percentage',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
            percentage: true,
            readOnly: true,
            value: 30,
          },
        },
        has_wage_portage_years_of_experience: {
          description:
            'In the same field or role that they will perform for your company.',
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
          title:
            'Does the employee have at least 3 years of relevant professional experience?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        work_address_is_home_address: {
          oneOf: [
            {
              const: 'yes',
              title: 'Same as their residential address',
            },
            {
              const: 'no',
              title: 'Different than their residential address',
            },
          ],
          title: '',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        bonus_amount: {
          deprecated: true,
          readOnly: true,
          title: 'Bonus amount (deprecated)',
          type: ['integer', 'null'],
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            deprecated: {
              description:
                "Deprecated in favor of 'Bonus Details'. Please, try to leave this field empty.",
            },
            inputType: 'money',
          },
        },
        professional_qualifications: {
          description:
            "Select the employee's highest diploma or relevant certification.",
          oneOf: [
            {
              const: 'bts',
              title: 'BTS (Brevet de Technicien Supérieur)',
            },
            {
              const: 'dut',
              title: 'DUT (Diplôme Universitaire de Technologie)',
            },
            {
              const: 'licence',
              title: "Licence (Bachelor's degree)",
            },
            {
              const: 'masters_degree',
              title: "Master's degree",
            },
            {
              const: 'doctorate_phd',
              title: 'Doctorate (PhD)',
            },
            {
              const: 'no_diploma',
              title: 'No diploma',
            },
          ],
          title: 'Professional qualifications',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        home_office_allowance: {
          description:
            "Covers the employee's fixed home-office expenses (such as rent, utilities, or insurance). Minimum is 25 EUR per month. This allowance is paid on top of their gross salary.",
          minimum: 2500,
          title: 'Home office allowance (Forfait télétravail)',
          type: 'integer',
          'x-jsf-errorMessage': {
            minimum: 'Must be at least €25.00.',
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        additional_job_title_eligibility_check_slug: {
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        probation_length_days: {
          description:
            "If you enter a value of '0', the employee will not have a probation period.",
          minimum: 0,
          title: 'Probation period in days',
          type: 'number',
          'x-jsf-logic-computedAttrs': {
            maximum: 'probation_length_days_maximum_days',
            'x-jsf-presentation': {
              inputType: 'probation_length_days_input_type',
            },
          },
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        employee_travel_required: {
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
          title: 'Is the employee required to travel for work?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_signing_bonus: {
          description:
            'This is a one-time payment the employee receives when they join your team.',
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
          title: 'Offer a signing bonus?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        additional_job_title_eligibility_check_result: {
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        provided_equipment: {
          description:
            'Select all work equipment or materials that will be provided to the employee to perform the mission.',
          items: {
            anyOf: [
              {
                const: 'laptop',
                title: 'Laptop',
              },
              {
                const: 'desktop',
                title: 'Desktop',
              },
              {
                const: 'smartphone',
                title: 'Smartphone',
              },
              {
                const: 'landline',
                title: 'Landline',
              },
              {
                const: 'tablet',
                title: 'Tablet',
              },
              {
                const: 'printer',
                title: 'Printer',
              },
              {
                const: 'vpn',
                title: 'VPN',
              },
            ],
          },
          title: 'Work equipment and materials',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        mission_duration: {
          description:
            "The minimum expected duration of the mission. Missions can have a maximum duration of 36 months for employees. Employment Fees remain payable until the Employment Agreement is terminated, even if the minimum duration or service agreement ends earlier. <a href='https://support.remote.com/hc/en-us/articles/43837551686541-Mission-Minimum-Duration-France-Wage-Portage' target='_blank'>Learn more</a>",
          maximum: 36,
          minimum: 1,
          title: 'Mission duration (months)',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        commissions_ack: {
          const: 'acknowledged',
          description:
            'I understand that I am required to provide written details of the commission plan to this employee, and upload this document on the platform for record keeping purposes. I acknowledge that Remote will not liable for any claims or losses associated with the commission or bonus plan.',
          title: 'Confirm commission plan details',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'checkbox',
            meta: {
              helpCenter: {
                callToAction: '(i) Guidance on drafting a commission plan here',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 17932049668109,
                title: 'Help center unavailable',
              },
            },
          },
        },
      },
      required: [
        'has_wage_portage_years_of_experience',
        'has_wage_portage_higher_degree',
      ],
      type: 'object',
      'x-jsf-logic': {
        computedValues: {
          computed_annual_gross_salary_display: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '/': [
                    {
                      var: 'annual_gross_salary',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_business_allowance_amount: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          '/': [5, 100],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              var: 'annual_gross_salary',
                            },
                            {
                              '/': [5, 100],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_business_allowance_display: {
            rule: {
              if: [
                {
                  var: 'business_allowance_amount',
                },
                {
                  '/': [
                    {
                      var: 'business_allowance_amount',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_financial_reserve_amount: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          '/': [10, 100],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              var: 'annual_gross_salary',
                            },
                            {
                              '/': [10, 100],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_financial_reserve_display: {
            rule: {
              if: [
                {
                  var: 'financial_reserve_amount',
                },
                {
                  '/': [
                    {
                      var: 'financial_reserve_amount',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_non_compete_clause_compensation_amount: {
            rule: {
              if: [
                {
                  and: [
                    {
                      var: 'annual_gross_salary',
                    },
                    {
                      var: 'non_compete_compensation_salary_percentage',
                    },
                  ],
                },
                {
                  '/': [
                    {
                      '-': [
                        {
                          '*': [
                            {
                              '/': [
                                {
                                  var: 'annual_gross_salary',
                                },
                                12,
                              ],
                            },
                            {
                              '/': [
                                {
                                  var: 'non_compete_compensation_salary_percentage',
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        {
                          '%': [
                            {
                              '*': [
                                {
                                  '/': [
                                    {
                                      var: 'annual_gross_salary',
                                    },
                                    12,
                                  ],
                                },
                                {
                                  '/': [
                                    {
                                      var: 'non_compete_compensation_salary_percentage',
                                    },
                                    100,
                                  ],
                                },
                              ],
                            },
                            1,
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_non_compete_clause_compensation_amount_in_cents: {
            rule: {
              if: [
                {
                  and: [
                    {
                      var: 'annual_gross_salary',
                    },
                    {
                      var: 'non_compete_compensation_salary_percentage',
                    },
                  ],
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          '/': [
                            {
                              var: 'annual_gross_salary',
                            },
                            12,
                          ],
                        },
                        {
                          '/': [
                            {
                              var: 'non_compete_compensation_salary_percentage',
                            },
                            100,
                          ],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              '/': [
                                {
                                  var: 'annual_gross_salary',
                                },
                                12,
                              ],
                            },
                            {
                              '/': [
                                {
                                  var: 'non_compete_compensation_salary_percentage',
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_total_with_allowance_display: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '/': [
                    {
                      '+': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          var: 'business_allowance_amount',
                        },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          probation_length_days_input_type: {
            rule: {
              if: [
                {
                  and: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    {
                      '==': [
                        {
                          var: 'contract_duration_type',
                        },
                        'fixed_term',
                      ],
                    },
                  ],
                },
                'number',
                'hidden',
              ],
            },
          },
          probation_length_days_maximum_days: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    14,
                    30,
                  ],
                },
                {
                  if: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    null,
                    0,
                  ],
                },
              ],
            },
          },
          probation_length_days_recommended: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      min: [
                        {
                          max: [
                            {
                              date_difference_in_weeks: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            0,
                          ],
                        },
                        14,
                      ],
                    },
                    30,
                  ],
                },
                0,
              ],
            },
          },
          probation_length_input_type: {
            rule: {
              if: [
                {
                  and: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    {
                      '!=': [
                        {
                          var: 'contract_duration_type',
                        },
                        'fixed_term',
                      ],
                    },
                  ],
                },
                'number',
                'hidden',
              ],
            },
          },
          probation_length_maximum_months: {
            rule: {
              if: [
                {
                  '==': [
                    {
                      var: 'probation_length_recommended',
                    },
                    'custom',
                  ],
                },
                {
                  if: [
                    {
                      var: 'contract_end_date',
                    },
                    null,
                    4,
                  ],
                },
                {
                  if: [
                    {
                      var: 'contract_end_date',
                    },
                    0,
                    4,
                  ],
                },
              ],
            },
          },
          recommended_probation_description: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    "For fixed-term contracts up to 6 months, the probation period is 1 day per week worked, capped at a maximum of 14 days. This cannot be renewed. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
                    "For fixed-term contracts exceeding 6 months, the probation period is capped at 1 month. This cannot be renewed. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
                  ],
                },
                "Can be renewed once. To request a renewal, contact help@remote.com at least 1 month before the initial probation period ends. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
              ],
            },
          },
          recommended_probation_label: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  cat: [
                    {
                      if: [
                        {
                          or: [
                            {
                              '<': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              and: [
                                {
                                  '==': [
                                    {
                                      date_difference_in_months: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        '2026-09-03',
                                      ],
                                    },
                                    6,
                                  ],
                                },
                                {
                                  '==': [
                                    {
                                      '+': [
                                        {
                                          substr: [
                                            {
                                              var: 'contract_end_date',
                                            },
                                            8,
                                            2,
                                          ],
                                        },
                                        0,
                                      ],
                                    },
                                    3,
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          min: [
                            {
                              max: [
                                {
                                  date_difference_in_weeks: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                0,
                              ],
                            },
                            14,
                          ],
                        },
                        30,
                      ],
                    },
                    ' days',
                  ],
                },
                '4 months',
              ],
            },
          },
        },
      },
      'x-jsf-order': [
        'has_wage_portage_higher_degree',
        'has_wage_portage_years_of_experience',
        'wage_portage_eligibility',
        'contract_duration_type',
        'contract_end_date',
        'work_schedule',
        'work_hours_per_week',
        'has_probation_period',
        'probation_length_recommended',
        'probation_length',
        'probation_length_days',
        'available_pto',
        'role_description',
        'job_title_check_enabled',
        'additional_job_title_eligibility_check_slug',
        'additional_job_title_eligibility_check_result',
        'experience_level',
        'mission_duration',
        'mission_deliverables_cadence',
        'provided_systems',
        'provided_equipment',
        'primary_contact_point',
        'professional_qualifications',
        'key_skills',
        'work_experience',
        'field_of_work',
        'work_address_is_home_address',
        'employee_travel_required',
        'annual_gross_salary',
        'business_allowances_statement',
        'business_allowance_amount',
        'financial_reserve_amount',
        'business_allowance_ack',
        'home_office_allowance',
        'has_signing_bonus',
        'signing_bonus_amount',
        'has_bonus',
        'bonus_amount',
        'bonus_details',
        'has_commissions',
        'commissions_details',
        'commissions_ack',
        'non_compete_clause_apply',
        'non_compete_clause_halt_period_months',
        'non_compete_clause_compensation_amount',
        'non_compete_compensation_salary_percentage',
        'non_compete_restricted_activities',
      ],
      'x-rmt-flatFieldsets': {
        annual_gross_salary_fieldset: {
          propertiesByName: [
            'annual_gross_salary',
            'business_allowances_statement',
            'business_allowance_ack',
            'home_office_allowance',
          ],
          title: 'Annual gross salary',
        },
        mission_details_fieldset: {
          description:
            "In France's wage portage framework, a mission is a defined client assignment with a clear scope, duration, and deliverables, performed under the portage salarial framework.",
          propertiesByName: [
            'mission_duration',
            'mission_deliverables_cadence',
            'provided_systems',
            'provided_equipment',
            'primary_contact_point',
          ],
          title: 'Mission details',
        },
        non_compete_fieldset: {
          description:
            "<strong>No exclusivity or non-compete</strong> during employment<br/>Exclusivity and non-compete clauses are not permitted during the contract. Any post-termination non-compete must be agreed directly with the employee outside of Remote's Employment Agreement and handled entirely by your company. <a href='https://support.remote.com/hc/en-us/articles/43837716053005-Non-compete-under-wage-portage-portage-salarial' target='_blank'>Learn more</a>",
          propertiesByName: [
            'non_compete_clause_apply',
            'non_compete_clause_halt_period_months',
            'non_compete_compensation_salary_percentage',
            'non_compete_clause_compensation_amount',
            'non_compete_restricted_activities',
          ],
          title: 'Non-compete',
        },
        professional_qualifications_fieldset: {
          description:
            "<a href='https://support.remote.com/hc/en-us/articles/43836880214285-Understanding-Professional-Qualifications-in-Wage-Portage' target='_blank' rel='noopener noreferrer'>Learn more about professional qualifications</a>",
          propertiesByName: [
            'professional_qualifications',
            'key_skills',
            'work_experience',
            'field_of_work',
          ],
          title: 'Employee professional qualifications',
        },
        wage_portage_eligibility_fieldset: {
          description:
            'In France, Remote uses a wage portage (portage salarial) model, where Remote acts as the legal employer while the employee works on behalf of your company. To confirm eligibility, please answer the following:',
          propertiesByName: [
            'has_wage_portage_higher_degree',
            'has_wage_portage_years_of_experience',
          ],
          title: 'Wage portage eligibility',
        },
        work_address_fieldset: {
          propertiesByName: ['work_address_is_home_address'],
          title: 'Work address',
        },
      },
      'x-rmt-meta': {
        jsfVersion: '1',
      },
    },
  },
  'simple-user-profile': {
    name: 'Simple User Profile Schema',
    description: 'A basic user profile form for testing basic field types',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 2,
          maxLength: 50,
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 2,
          maxLength: 50,
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email',
          'x-jsf-presentation': {
            inputType: 'email',
          },
        },
        age: {
          type: 'number',
          title: 'Age',
          minimum: 18,
          maximum: 120,
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        country: {
          type: 'string',
          title: 'Country',
          oneOf: [
            { const: 'US', title: 'United States' },
            { const: 'CA', title: 'Canada' },
            { const: 'UK', title: 'United Kingdom' },
            { const: 'DE', title: 'Germany' },
            { const: 'FR', title: 'France' },
          ],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        subscribe: {
          type: 'boolean',
          title: 'Subscribe to newsletter',
          'x-jsf-presentation': {
            inputType: 'checkbox',
          },
        },
      },
      required: ['firstName', 'lastName', 'email', 'country'],
      'x-rmt-meta': {
        jsfVersion: '1',
      },
    },
  },
  'france-wage-portage-conditional': {
    name: 'France Wage Portage (Conditional)',
    description:
      'Simplified version with conditional business_allowances_statement that appears when annual_gross_salary is defined and contract_duration_type is indefinite',
    schema: {
      type: 'object',
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['annual_gross_salary', 'contract_duration_type'],
          },
          then: {
            properties: {
              business_allowances_statement: {
                title: 'Mandatory allowances',
                type: 'null',
                'x-jsf-logic-computedAttrs': {
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% financial reserve: {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
                    },
                  },
                },
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
          else: {
            properties: {
              business_allowances_statement: false,
            },
          },
        },
      ],
      properties: {
        annual_gross_salary: {
          description:
            "Enter the employee's annual gross base salary. This amount is used to calculate payroll and must meet the legal minimum in France.",
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
          description:
            'Under French Wage Portage regulations, assignments with the same client are limited to 18 months for fixed-term contracts and 36 months for indefinite contracts.',
          oneOf: [
            {
              const: 'indefinite',
              title: 'Indefinite contract (without end date)',
            },
            {
              const: 'fixed_term',
              title: 'Fixed-term contract (with end date)',
            },
          ],
          title: 'Contract duration type',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
        business_allowance_amount: {
          title: 'Business allowance amount',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            const: 'computed_business_allowance_amount',
            default: 'computed_business_allowance_amount',
            'x-jsf-presentation': {
              statement: {
                title:
                  'Business Allowance: {{computed_business_allowance_display}} EUR',
                description:
                  'Mandatory 5% allowance automatically calculated from your gross salary.',
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        business_allowances_statement: {
          title: 'Mandatory allowances',
          type: 'null',
          'x-jsf-logic-computedAttrs': {
            'x-jsf-presentation': {
              statement: {
                description:
                  "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% financial reserve: {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        financial_reserve_amount: {
          title: 'Financial reserve amount',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            const: 'computed_financial_reserve_amount',
            default: 'computed_financial_reserve_amount',
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
      },
      required: [
        'annual_gross_salary',
        'contract_duration_type',
        'business_allowance_amount',
        'financial_reserve_amount',
      ],
      'x-jsf-logic': {
        computedValues: {
          computed_annual_gross_salary_display: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '/': [{ var: 'annual_gross_salary' }, 100] },
                null,
              ],
            },
          },
          computed_business_allowance_amount: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '*': [{ var: 'annual_gross_salary' }, 0.05] },
                null,
              ],
            },
          },
          computed_business_allowance_display: {
            rule: {
              if: [
                { var: 'business_allowance_amount' },
                { '/': [{ var: 'business_allowance_amount' }, 100] },
                null,
              ],
            },
          },
          computed_financial_reserve_amount: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '*': [{ var: 'annual_gross_salary' }, 0.1] },
                null,
              ],
            },
          },
          computed_financial_reserve_display: {
            rule: {
              if: [
                { var: 'financial_reserve_amount' },
                { '/': [{ var: 'financial_reserve_amount' }, 100] },
                null,
              ],
            },
          },
          computed_total_with_allowance_display: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                {
                  '/': [
                    {
                      '+': [
                        { var: 'annual_gross_salary' },
                        { var: 'business_allowance_amount' },
                        { var: 'financial_reserve_amount' },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    },
  },
  'france-wage-portage-no-fieldsets-simple': {
    name: 'France Wage Portage (No Fieldsets - Simple)',
    description:
      'Basic allOf logic test without fieldsets and without complex computed values',
    schema: {
      additionalProperties: false,
      allOf: [
        {
          else: {
            properties: {
              non_compete_clause_compensation_amount: false,
              non_compete_restricted_activities: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
              non_compete_clause_apply: {
                const: 'yes',
              },
            },
            required: ['non_compete_clause_apply', 'annual_gross_salary'],
          },
          then: {
            properties: {
              non_compete_clause_compensation_amount: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'computed_non_compete_clause_compensation_amount_in_cents',
                  default:
                    'computed_non_compete_clause_compensation_amount_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'The employee will receive this monthly compensation after termination for the entire non-compete period.',
                      title:
                        '{{computed_non_compete_clause_compensation_amount}} XXX non-compete compensation amount',
                    },
                  },
                },
              },
            },
            required: [
              'non_compete_clause_compensation_amount',
              'non_compete_restricted_activities',
            ],
          },
        },
        {
          else: {
            properties: {
              non_compete_clause_compensation_amount: false,
              non_compete_clause_halt_period_months: false,
              non_compete_compensation_salary_percentage: false,
              non_compete_restricted_activities: false,
            },
          },
          if: {
            properties: {
              non_compete_clause_apply: {
                const: 'yes',
              },
            },
            required: ['non_compete_clause_apply'],
          },
          then: {
            required: [
              'non_compete_compensation_salary_percentage',
              'non_compete_clause_halt_period_months',
            ],
          },
        },
        {
          else: {
            properties: {
              mission_duration: false,
            },
          },
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            required: ['mission_duration'],
          },
        },
        {
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            properties: {
              contract_duration_type: {
                oneOf: [
                  {
                    const: 'indefinite',
                    description:
                      'After this period, the engagement must end unless it qualifies as a new assignment with a different scope.',
                    title:
                      'Indefinite contract with <strong>36 months max duration</strong> for France.',
                  },
                  {
                    const: 'fixed_term',
                    nested_fields: ['contract_end_date'],
                    title: 'Fixed-term contract',
                  },
                ],
              },
            },
          },
        },
        {
          else: {
            properties: {
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
            properties: {
              contract_end_date: {
                type: 'string',
              },
            },
            required: ['contract_end_date'],
          },
        },
        {
          else: {
            else: {
              properties: {
                business_allowance_ack: false,
                business_allowances_statement: false,
                home_office_allowance: false,
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
              properties: {
                business_allowance_ack: {
                  title:
                    "I understand the 5% allowance applies each month and a 10% indemnity is paid in addition to the employee's total earnings at the end of their contract.",
                },
                business_allowances_statement: {
                  'x-jsf-logic-computedAttrs': {
                    'x-jsf-presentation': {
                      statement: {
                        description:
                          "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% Indemnity (end of contract): {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
                      },
                    },
                  },
                },
              },
              required: ['business_allowance_ack', 'home_office_allowance'],
            },
          },
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['contract_duration_type'],
          },
          then: {
            required: ['business_allowance_ack', 'home_office_allowance'],
          },
        },
        {
          else: {
            properties: {
              business_allowance_ack: false,
              business_allowances_statement: false,
              home_office_allowance: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
            },
            required: ['annual_gross_salary'],
          },
          then: {},
        },
        {
          else: {
            properties: {
              business_allowance_amount: false,
              financial_reserve_amount: false,
            },
          },
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
            },
            required: ['annual_gross_salary'],
          },
          then: {
            properties: {
              business_allowance_amount: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_business_allowance_amount',
                  default: 'computed_business_allowance_amount',
                },
              },
              financial_reserve_amount: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_financial_reserve_amount',
                  default: 'computed_financial_reserve_amount',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              work_hours_per_week: {
                const: 'lump_sum',
              },
            },
            required: ['work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3667800,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €36,678.00 or greater for Lump-sum contracts.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'expert',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3667800,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €36,678.00 or greater for the Expert experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'senior',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3236300,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €32,363.00 or greater for the Senior experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'junior',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 3020500,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €30,205.00 or greater for the Junior experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              experience_level: {
                const: 'premier_niveau',
              },
              work_hours_per_week: {
                const: '35',
              },
            },
            required: ['experience_level', 'work_hours_per_week'],
          },
          then: {
            properties: {
              annual_gross_salary: {
                minimum: 2718500,
                'x-jsf-errorMessage': {
                  minimum:
                    'Must be €27,185.00 or greater for the First-Level experience level.',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              additional_job_title_eligibility_check_result: {
                const: 'no',
              },
            },
            required: ['additional_job_title_eligibility_check_result'],
          },
          then: {
            properties: {
              role_description: {
                'x-jsf-presentation': {
                  statement: {
                    inputType: 'statement',
                    severity: 'error',
                    title:
                      'Unfortunately based on the information entered, we cannot hire this role in France.',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              additional_job_title_eligibility_check_result: {
                const: 'maybe',
              },
            },
            required: ['additional_job_title_eligibility_check_result'],
          },
          then: {
            properties: {
              role_description: {
                'x-jsf-presentation': {
                  statement: {
                    description:
                      "Complete the add employee process and we'll let you know as soon as we can if we can hire this role.",
                    inputType: 'statement',
                    severity: 'info',
                    title:
                      "Remote AI isn't sure if we can hire this role in France",
                  },
                },
              },
            },
          },
        },
        {
          else: {
            properties: {
              commissions_ack: false,
              commissions_details: false,
            },
          },
          if: {
            properties: {
              has_commissions: {
                const: 'yes',
              },
            },
            required: ['has_commissions'],
          },
          then: {
            properties: {
              commissions_ack: {
                type: ['string'],
              },
              commissions_details: {
                type: ['string'],
              },
            },
            required: ['commissions_details', 'commissions_ack'],
          },
        },
        {
          else: {
            properties: {
              bonus_amount: false,
              bonus_details: false,
            },
          },
          if: {
            properties: {
              has_bonus: {
                const: 'yes',
              },
            },
            required: ['has_bonus'],
          },
          then: {
            properties: {
              bonus_details: {
                type: ['string'],
              },
            },
            required: ['bonus_details'],
          },
        },
        {
          else: {
            properties: {
              signing_bonus_amount: false,
            },
          },
          if: {
            properties: {
              has_signing_bonus: {
                const: 'yes',
              },
            },
            required: ['has_signing_bonus'],
          },
          then: {
            properties: {
              signing_bonus_amount: {
                type: ['integer'],
              },
            },
            required: ['signing_bonus_amount'],
          },
        },
        {
          else: {
            if: {
              properties: {
                probation_length_recommended: {
                  const: 'custom',
                },
              },
              required: ['probation_length_recommended'],
            },
            then: {
              else: {
                properties: {
                  probation_length_days: false,
                },
                required: ['probation_length'],
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
                properties: {
                  probation_length: false,
                },
                required: ['probation_length_days'],
              },
            },
          },
          if: {
            properties: {
              probation_length_recommended: {
                const: 'recommended',
              },
            },
            required: ['probation_length_recommended'],
          },
          then: {
            allOf: [
              {
                else: {
                  allOf: [
                    {
                      if: {
                        properties: {
                          has_probation_period: {
                            const: 'yes',
                          },
                        },
                        required: ['has_probation_period'],
                      },
                      then: {
                        required: ['probation_length'],
                      },
                    },
                  ],
                  properties: {
                    probation_length: {
                      'x-jsf-logic-computedAttrs': {
                        const: 'probation_length_maximum_months',
                        default: 'probation_length_maximum_months',
                      },
                    },
                    probation_length_days: false,
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
                  allOf: [
                    {
                      if: {
                        properties: {
                          has_probation_period: {
                            const: 'yes',
                          },
                        },
                        required: ['has_probation_period'],
                      },
                      then: {
                        required: ['probation_length_days'],
                      },
                    },
                  ],
                  properties: {
                    probation_length: false,
                    probation_length_days: {
                      'x-jsf-logic-computedAttrs': {
                        const: 'probation_length_days_recommended',
                        default: 'probation_length_days_recommended',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          else: {
            properties: {
              has_probation_period: {
                const: 'no',
                default: 'no',
              },
            },
          },
          if: {
            anyOf: [
              {
                properties: {
                  probation_length: {
                    exclusiveMinimum: 0,
                  },
                },
                required: ['probation_length'],
              },
              {
                properties: {
                  probation_length_days: {
                    exclusiveMinimum: 0,
                  },
                },
                required: ['probation_length_days'],
              },
            ],
          },
          then: {
            properties: {
              has_probation_period: {
                const: 'yes',
                default: 'yes',
              },
            },
          },
        },
        {
          else: {
            else: {
              properties: {
                non_compete_clause_apply: false,
                probation_length_recommended: false,
                contract_end_date: false,
                business_allowance_ack: false,
                work_hours_per_week: false,
                non_compete_restricted_activities: false,
                work_experience: false,
                has_commissions: false,
                has_bonus: false,
                primary_contact_point: false,
                job_title_check_enabled: false,
                business_allowance_amount: false,
                key_skills: false,
                annual_gross_salary: false,
                contract_duration_type: false,
                available_pto: false,
                probation_length: false,
                experience_level: false,
                bonus_details: false,
                role_description: false,
                business_allowances_statement: false,
                has_probation_period: false,
                signing_bonus_amount: false,
                wage_portage_eligibility: false,
                non_compete_clause_compensation_amount: false,
                commissions_details: false,
                provided_systems: false,
                financial_reserve_amount: false,
                non_compete_clause_halt_period_months: false,
                field_of_work: false,
                work_schedule: false,
                mission_deliverables_cadence: false,
                non_compete_compensation_salary_percentage: false,
                work_address_is_home_address: false,
                bonus_amount: false,
                professional_qualifications: false,
                home_office_allowance: false,
                additional_job_title_eligibility_check_slug: false,
                probation_length_days: false,
                employee_travel_required: false,
                has_signing_bonus: false,
                additional_job_title_eligibility_check_result: false,
                provided_equipment: false,
                mission_duration: false,
                commissions_ack: false,
              },
            },
            if: {
              anyOf: [
                {
                  properties: {
                    has_wage_portage_higher_degree: {
                      const: 'yes',
                    },
                  },
                  required: ['has_wage_portage_higher_degree'],
                },
                {
                  properties: {
                    has_wage_portage_years_of_experience: {
                      const: 'yes',
                    },
                  },
                  required: ['has_wage_portage_years_of_experience'],
                },
              ],
            },
            then: {
              properties: {
                wage_portage_eligibility: false,
              },
              required: [
                'non_compete_clause_apply',
                'field_of_work',
                'work_experience',
                'key_skills',
                'professional_qualifications',
                'primary_contact_point',
                'provided_equipment',
                'provided_systems',
                'mission_deliverables_cadence',
                'contract_duration_type',
                'work_hours_per_week',
                'annual_gross_salary',
                'probation_length_recommended',
                'job_title_check_enabled',
                'has_probation_period',
                'available_pto',
                'experience_level',
                'has_signing_bonus',
                'has_bonus',
                'has_commissions',
                'role_description',
                'work_address_is_home_address',
                'employee_travel_required',
                'has_wage_portage_higher_degree',
                'has_wage_portage_years_of_experience',
                'work_schedule',
              ],
            },
          },
          if: {
            properties: {
              has_wage_portage_higher_degree: {
                const: 'no',
              },
              has_wage_portage_years_of_experience: {
                const: 'no',
              },
            },
            required: [
              'has_wage_portage_higher_degree',
              'has_wage_portage_years_of_experience',
            ],
          },
          then: {
            properties: {
              non_compete_clause_apply: false,
              probation_length_recommended: false,
              contract_end_date: false,
              business_allowance_ack: false,
              work_hours_per_week: false,
              non_compete_restricted_activities: false,
              work_experience: false,
              has_commissions: false,
              has_bonus: false,
              primary_contact_point: false,
              job_title_check_enabled: false,
              business_allowance_amount: false,
              key_skills: false,
              annual_gross_salary: false,
              contract_duration_type: false,
              available_pto: false,
              probation_length: false,
              experience_level: false,
              bonus_details: false,
              role_description: false,
              business_allowances_statement: false,
              has_probation_period: false,
              signing_bonus_amount: false,
              wage_portage_eligibility: {
                const: 'no',
                default: 'no',
                'x-jsf-presentation': {
                  inputType: 'statement',
                },
              },
              non_compete_clause_compensation_amount: false,
              commissions_details: false,
              provided_systems: false,
              financial_reserve_amount: false,
              non_compete_clause_halt_period_months: false,
              field_of_work: false,
              work_schedule: false,
              mission_deliverables_cadence: false,
              non_compete_compensation_salary_percentage: false,
              work_address_is_home_address: false,
              bonus_amount: false,
              professional_qualifications: false,
              home_office_allowance: false,
              additional_job_title_eligibility_check_slug: false,
              probation_length_days: false,
              employee_travel_required: false,
              has_signing_bonus: false,
              additional_job_title_eligibility_check_result: false,
              provided_equipment: false,
              mission_duration: false,
              commissions_ack: false,
            },
          },
        },
      ],
      properties: {
        non_compete_clause_apply: {
          description:
            'Prevents the employee from joining or starting a competing business. Not allowed during employment under French Wage Portage law. Post-termination only, with limits and required compensation.',
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
          title:
            'Do you want to apply post-termination restrictions (non-compete)?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        probation_length_recommended: {
          description:
            "A probation period allows for more flexible termination, especially for performance-related issues. Below are our recommendations, aligned with the wage portage collective agreement. Termination during probation requires notice based on the employee's tenure. <a href='https://support.remote.com/hc/en-us/articles/43837197759501-How-do-probation-periods-work-in-France-for-wage-portage-employees' target='_blank'>Learn more about probation periods</a> and <a href='https://support.remote.com/hc/en-us/articles/43837333997325-How-do-I-terminate-an-employee-during-their-probation-period-in-France-wage-portage' target='_blank'>terminations during probation</a>",
          oneOf: [
            {
              const: 'recommended',
              title: '4 months',
              'x-jsf-logic-computedAttrs': {
                description: '{{recommended_probation_description}}',
                title: '{{recommended_probation_label}}',
              },
              'x-jsf-presentation': {
                recommended: true,
              },
            },
            {
              const: 'custom',
              title: 'Choose your own length',
            },
          ],
          title: 'Probation period',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        contract_end_date: {
          description:
            'Fixed-term contracts are limited to a maximum duration of 18 months.',
          format: 'date',
          maxLength: 255,
          title: 'Contract end date',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'date',
            maxDate: '2028-03-02',
            minDate: '2026-09-03',
          },
        },
        business_allowance_ack: {
          const: 'acknowledged',
          title:
            'I understand that the 5% allowance applies automatically. A mandatory, non-waivable 10% financial reserve is withheld from the employees monthly base salary during assignments.',
          type: 'string',
          'x-jsf-presentation': {
            description:
              "<a href='https://support.remote.com/hc/en-us/articles/43837622285709-Wage-Portage-France-Mandatory-Allowances' target='_blank'>Learn more about mandatory allowances</a>",
            inputType: 'checkbox',
          },
        },
        work_hours_per_week: {
          description: '',
          oneOf: [
            {
              const: '35',
              description:
                'This is a standard 35-hour contract for full-time employees. Employees can receive overtime with written approval from their manager.',
              title: '35-hour contract',
            },
            {
              const: 'lump_sum',
              description:
                'This is a 218-day-per-year contract with no fixed working hours or overtime. Employees receive additional rest days to ensure they work exactly 218 days per year.',
              title: 'Lump-sum contract in days',
            },
          ],
          title: 'Work hours per week',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
        non_compete_restricted_activities: {
          description:
            "Please define the specific professional activities the employee is prohibited from engaging in after leaving the company, not just a general \"no competition\" clause. <a href='https://support.remote.com/hc/en-us/articles/43837822723981-How-do-non-compete-restricted-activities-work-in-France-wage-portage' target='_blank'>Learn more</a>",
          maxLength: 5000,
          minLength: 20,
          title: 'Restricted activities',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        work_experience: {
          description:
            'Briefly describe the required professional background and level of experience (e.g. "5+ years of experience in digital marketing, including work with multinational clients").',
          maxLength: 1000,
          title: 'Relevant experience',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        has_commissions: {
          description:
            "Will the employee be eligible to participate in the Company's commission plan? The terms and conditions of this arrangement must be communicated to the employee separately.",
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
          title: 'Offer commission?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_bonus: {
          description:
            'These can include things like performance-related bonuses.',
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
          title: 'Offer other bonuses?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 18019142406029,
                title: 'Help center unavailable',
              },
            },
          },
        },
        has_wage_portage_higher_degree: {
          description:
            "(e.g. BTS, DUT, Licence, Master's degree, or equivalent)",
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
          title: 'Does your employee hold a higher education qualification?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        primary_contact_point: {
          description:
            'Enter the name of the person the employee will primarily work with or contact during the assignment.',
          maxLength: 255,
          title: 'Primary point of contact',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        job_title_check_enabled: {
          const: true,
          default: true,
          enum: [true],
          oneOf: [
            {
              const: true,
              title: 'Yes',
            },
            {
              const: false,
              title: 'No',
            },
          ],
          type: 'boolean',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        business_allowance_amount: {
          title: 'Business allowance amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        key_skills: {
          description:
            'List the key skills required to perform the mission (e.g. client communication, project management, software development).',
          maxLength: 1000,
          title: 'Required key skills',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        annual_gross_salary: {
          description:
            "Enter the employee's annual gross base salary. This amount is used to calculate payroll and must meet the legal minimum in France.",
          title: 'Annual gross salary',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 27657390602637,
                title: 'Help center unavailable',
              },
            },
          },
        },
        contract_duration_type: {
          description:
            'Under French Wage Portage regulations, assignments with the same client are limited to 18 months for fixed-term contracts and 36 months for indefinite contracts.',
          oneOf: [
            {
              const: 'indefinite',
              title:
                'Indefinite contract with <strong>36 months max duration</strong> for France.',
            },
            {
              const: 'fixed_term',
              nested_fields: ['contract_end_date'],
              title: 'Fixed-term contract',
            },
          ],
          title: 'Contract duration',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more about French contract duration',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 43837143193357,
                title: 'Help center unavailable',
              },
            },
          },
        },
        available_pto: {
          const: 30,
          default: 30,
          description:
            'Employees are entitled to 30 business days of paid leave per year (equivalent to 2.5 days per month), in line with French labor law and the wage portage collective agreement. Public holidays are excluded and vary by location.',
          title: 'Number of paid time off days',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
            statement: {
              title: 'Number of paid time off days: <strong>30 days</strong>',
            },
          },
        },
        probation_length: {
          description:
            "If you enter a value of '0', the employee will not have a probation period.",
          minimum: 0,
          title: 'Probation period in months',
          type: 'number',
          'x-jsf-logic-computedAttrs': {
            maximum: 'probation_length_maximum_months',
            'x-jsf-presentation': {
              inputType: 'probation_length_input_type',
            },
          },
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        experience_level: {
          description:
            "Select the employee's level under the French Wage Portage collective agreement. This level determines applicable pay scales, benefits, and autonomy expectations, and applies only within the Wage Portage framework (not internal career levels).",
          oneOf: [
            {
              const: 'premier_niveau',
              description:
                'Entry-level professional performing straightforward services for the client. Mission duration cannot exceed 24 months.',
              title:
                'Salarié porté premier niveau — First-Level Ported Employee',
            },
            {
              const: 'junior',
              description:
                'Professional with moderate experience who can assess company needs, propose improvements and participate in implementation.',
              title: 'Salarié porté junior — Junior Ported Employee',
            },
            {
              const: 'senior',
              description:
                'Experienced professional who performs complex services with a significant level of initiative and responsibility.',
              title: 'Salarié porté senior — Senior Ported Employee',
            },
            {
              const: 'expert',
              description:
                'Highly-skilled professional who performs complex services which require a high level of initiative and responsibility.',
              title: 'Salarié porté expert — Expert Ported Employee',
            },
          ],
          title: 'Experience Level',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
            meta: {
              helpCenter: {
                callToAction: 'Learn more',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 41652078093965,
                title: 'Help center unavailable',
              },
            },
          },
        },
        bonus_details: {
          description: 'Bonus type, payment frequency, and more.',
          maxLength: 1000,
          title: 'Other bonus details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        role_description: {
          description:
            'Please add at least 3 responsibilities, at least 100 characters in total.',
          maxLength: 5000,
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
        business_allowances_statement: {
          title: 'Mandatory allowances',
          type: 'null',
          'x-jsf-logic-computedAttrs': {
            'x-jsf-presentation': {
              statement: {
                description:
                  "<strong>Mandatory allowances</strong><br /><br />Under French Wage Portage regulations, the following amounts are required by law. We automatically applied them based on the employee's gross salary.<br /><ul><li>Mandatory 5% allowance: {{computed_business_allowance_display}} EUR</li><li>Mandatory 10% financial reserve: {{computed_financial_reserve_display}} EUR</li><li>Annual gross salary: {{computed_annual_gross_salary_display}} EUR</li><li><strong>Total annual gross salary and mandatory allowance:</strong> {{computed_total_with_allowance_display}} EUR</li></ul>",
              },
            },
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
            meta: {
              ignoreValue: true,
            },
            statement: {
              inputType: 'statement',
              severity: 'info',
            },
          },
        },
        has_probation_period: {
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
          title: 'Probation period',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        signing_bonus_amount: {
          title: 'Signing bonus amount',
          type: ['integer', 'null'],
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        wage_portage_eligibility: {
          const: 'yes',
          default: 'yes',
          enum: ['yes'],
          title: 'Wage portage eligibility',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'hidden',
            meta: {
              ignoreValue: true,
            },
            statement: {
              description:
                "Based on your responses, the employee is not eligible for hire under wage portage, and we're unable to proceed with onboarding. If you have any questions, please contact help@remote.com.",
              inputType: 'statement',
              severity: 'error',
              title: 'Not eligible for wage portage',
            },
          },
        },
        non_compete_clause_compensation_amount: {
          description:
            'The employee will receive this monthly compensation after termination for the entire non-compete period.',
          title: 'Non-compete compensation amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'XXX',
            inputType: 'money',
          },
        },
        commissions_details: {
          description: 'Payment amount, frequency, and more.',
          maxLength: 1000,
          title: 'Commission details',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        provided_systems: {
          description:
            'Select the tools and system access to enable the employee to perform the mission (e.g. license(s), shared drive, etc.).',
          items: {
            anyOf: [
              {
                const: 'email',
                title: 'Email',
              },
              {
                const: 'workspace_account',
                title: 'Workspace account',
              },
              {
                const: 'onboarding_or_compliance_training',
                title: 'Onboarding or compliance training',
              },
              {
                const: 'shared_drive',
                title: 'Shared Drive',
              },
              {
                const: 'intranet',
                title: 'Intranet',
              },
              {
                const: 'manuals',
                title: 'Manuals',
              },
              {
                const: 'sops',
                title: 'Standard Operating Procedures (SOPs)',
              },
            ],
          },
          title: 'Provided systems and access',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        financial_reserve_amount: {
          title: 'Financial reserve amount',
          type: 'integer',
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        non_compete_clause_halt_period_months: {
          description:
            'Non-compete clauses in France can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
          maximum: 12,
          minimum: 1,
          title: 'Duration in months',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        field_of_work: {
          description:
            'Specify the industry or functional area relevant to the mission (e.g. IT consulting, healthcare operations, legal and compliance, finance and risk management, UX/UI design).',
          maxLength: 255,
          title: 'Relevant field of work',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        work_schedule: {
          const: 'full_time',
          default: 'full_time',
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
            inputType: 'hidden',
          },
        },
        mission_deliverables_cadence: {
          description:
            'Select how often the employee is expected to share progress updates or deliverables for this mission.',
          oneOf: [
            {
              const: 'daily',
              title: 'Daily',
            },
            {
              const: 'weekly',
              title: 'Weekly',
            },
            {
              const: 'monthly',
              title: 'Monthly',
            },
            {
              const: 'quarterly',
              title: 'Quarterly',
            },
          ],
          title: 'Mission deliverables cadence',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        non_compete_compensation_salary_percentage: {
          default: 30,
          description:
            "In France, non-compete pay must be 30% of monthly base salary throughout the post termination restrictions. A reserve is required to cover the mandatory payments. <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment-in-Employ-of-Record' target='_blank'>Learn about reserve payments</a>",
          readOnly: true,
          title: 'Non-compete salary percentage',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
            percentage: true,
            readOnly: true,
            value: 30,
          },
        },
        has_wage_portage_years_of_experience: {
          description:
            'In the same field or role that they will perform for your company.',
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
          title:
            'Does the employee have at least 3 years of relevant professional experience?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        work_address_is_home_address: {
          oneOf: [
            {
              const: 'yes',
              title: 'Same as their residential address',
            },
            {
              const: 'no',
              title: 'Different than their residential address',
            },
          ],
          title: '',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'column',
            inputType: 'radio',
          },
        },
        bonus_amount: {
          deprecated: true,
          readOnly: true,
          title: 'Bonus amount (deprecated)',
          type: ['integer', 'null'],
          'x-jsf-errorMessage': {
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            deprecated: {
              description:
                "Deprecated in favor of 'Bonus Details'. Please, try to leave this field empty.",
            },
            inputType: 'money',
          },
        },
        professional_qualifications: {
          description:
            "Select the employee's highest diploma or relevant certification.",
          oneOf: [
            {
              const: 'bts',
              title: 'BTS (Brevet de Technicien Supérieur)',
            },
            {
              const: 'dut',
              title: 'DUT (Diplôme Universitaire de Technologie)',
            },
            {
              const: 'licence',
              title: "Licence (Bachelor's degree)",
            },
            {
              const: 'masters_degree',
              title: "Master's degree",
            },
            {
              const: 'doctorate_phd',
              title: 'Doctorate (PhD)',
            },
            {
              const: 'no_diploma',
              title: 'No diploma',
            },
          ],
          title: 'Professional qualifications',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        home_office_allowance: {
          description:
            "Covers the employee's fixed home-office expenses (such as rent, utilities, or insurance). Minimum is 25 EUR per month. This allowance is paid on top of their gross salary.",
          minimum: 2500,
          title: 'Home office allowance (Forfait télétravail)',
          type: 'integer',
          'x-jsf-errorMessage': {
            minimum: 'Must be at least €25.00.',
            type: 'Please, use US standard currency format. Ex: 1024.12',
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        additional_job_title_eligibility_check_slug: {
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        probation_length_days: {
          description:
            "If you enter a value of '0', the employee will not have a probation period.",
          minimum: 0,
          title: 'Probation period in days',
          type: 'number',
          'x-jsf-logic-computedAttrs': {
            maximum: 'probation_length_days_maximum_days',
            'x-jsf-presentation': {
              inputType: 'probation_length_days_input_type',
            },
          },
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        employee_travel_required: {
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
          title: 'Is the employee required to travel for work?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_signing_bonus: {
          description:
            'This is a one-time payment the employee receives when they join your team.',
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
          title: 'Offer a signing bonus?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        additional_job_title_eligibility_check_result: {
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        provided_equipment: {
          description:
            'Select all work equipment or materials that will be provided to the employee to perform the mission.',
          items: {
            anyOf: [
              {
                const: 'laptop',
                title: 'Laptop',
              },
              {
                const: 'desktop',
                title: 'Desktop',
              },
              {
                const: 'smartphone',
                title: 'Smartphone',
              },
              {
                const: 'landline',
                title: 'Landline',
              },
              {
                const: 'tablet',
                title: 'Tablet',
              },
              {
                const: 'printer',
                title: 'Printer',
              },
              {
                const: 'vpn',
                title: 'VPN',
              },
            ],
          },
          title: 'Work equipment and materials',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        mission_duration: {
          description:
            "The minimum expected duration of the mission. Missions can have a maximum duration of 36 months for employees. Employment Fees remain payable until the Employment Agreement is terminated, even if the minimum duration or service agreement ends earlier. <a href='https://support.remote.com/hc/en-us/articles/43837551686541-Mission-Minimum-Duration-France-Wage-Portage' target='_blank'>Learn more</a>",
          maximum: 36,
          minimum: 1,
          title: 'Mission duration (months)',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        commissions_ack: {
          const: 'acknowledged',
          description:
            'I understand that I am required to provide written details of the commission plan to this employee, and upload this document on the platform for record keeping purposes. I acknowledge that Remote will not liable for any claims or losses associated with the commission or bonus plan.',
          title: 'Confirm commission plan details',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'checkbox',
            meta: {
              helpCenter: {
                callToAction: '(i) Guidance on drafting a commission plan here',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 17932049668109,
                title: 'Help center unavailable',
              },
            },
          },
        },
      },
      required: [
        'has_wage_portage_years_of_experience',
        'has_wage_portage_higher_degree',
      ],
      type: 'object',
      'x-jsf-logic': {
        computedValues: {
          computed_annual_gross_salary_display: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '/': [
                    {
                      var: 'annual_gross_salary',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_business_allowance_amount: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          '/': [5, 100],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              var: 'annual_gross_salary',
                            },
                            {
                              '/': [5, 100],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_business_allowance_display: {
            rule: {
              if: [
                {
                  var: 'business_allowance_amount',
                },
                {
                  '/': [
                    {
                      var: 'business_allowance_amount',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_financial_reserve_amount: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          '/': [10, 100],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              var: 'annual_gross_salary',
                            },
                            {
                              '/': [10, 100],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_financial_reserve_display: {
            rule: {
              if: [
                {
                  var: 'financial_reserve_amount',
                },
                {
                  '/': [
                    {
                      var: 'financial_reserve_amount',
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_non_compete_clause_compensation_amount: {
            rule: {
              if: [
                {
                  and: [
                    {
                      var: 'annual_gross_salary',
                    },
                    {
                      var: 'non_compete_compensation_salary_percentage',
                    },
                  ],
                },
                {
                  '/': [
                    {
                      '-': [
                        {
                          '*': [
                            {
                              '/': [
                                {
                                  var: 'annual_gross_salary',
                                },
                                12,
                              ],
                            },
                            {
                              '/': [
                                {
                                  var: 'non_compete_compensation_salary_percentage',
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        {
                          '%': [
                            {
                              '*': [
                                {
                                  '/': [
                                    {
                                      var: 'annual_gross_salary',
                                    },
                                    12,
                                  ],
                                },
                                {
                                  '/': [
                                    {
                                      var: 'non_compete_compensation_salary_percentage',
                                    },
                                    100,
                                  ],
                                },
                              ],
                            },
                            1,
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          computed_non_compete_clause_compensation_amount_in_cents: {
            rule: {
              if: [
                {
                  and: [
                    {
                      var: 'annual_gross_salary',
                    },
                    {
                      var: 'non_compete_compensation_salary_percentage',
                    },
                  ],
                },
                {
                  '-': [
                    {
                      '*': [
                        {
                          '/': [
                            {
                              var: 'annual_gross_salary',
                            },
                            12,
                          ],
                        },
                        {
                          '/': [
                            {
                              var: 'non_compete_compensation_salary_percentage',
                            },
                            100,
                          ],
                        },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            {
                              '/': [
                                {
                                  var: 'annual_gross_salary',
                                },
                                12,
                              ],
                            },
                            {
                              '/': [
                                {
                                  var: 'non_compete_compensation_salary_percentage',
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_total_with_allowance_display: {
            rule: {
              if: [
                {
                  var: 'annual_gross_salary',
                },
                {
                  '/': [
                    {
                      '+': [
                        {
                          var: 'annual_gross_salary',
                        },
                        {
                          var: 'business_allowance_amount',
                        },
                      ],
                    },
                    100,
                  ],
                },
                null,
              ],
            },
          },
          probation_length_days_input_type: {
            rule: {
              if: [
                {
                  and: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    {
                      '==': [
                        {
                          var: 'contract_duration_type',
                        },
                        'fixed_term',
                      ],
                    },
                  ],
                },
                'number',
                'hidden',
              ],
            },
          },
          probation_length_days_maximum_days: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    14,
                    30,
                  ],
                },
                {
                  if: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    null,
                    0,
                  ],
                },
              ],
            },
          },
          probation_length_days_recommended: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      min: [
                        {
                          max: [
                            {
                              date_difference_in_weeks: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            0,
                          ],
                        },
                        14,
                      ],
                    },
                    30,
                  ],
                },
                0,
              ],
            },
          },
          probation_length_input_type: {
            rule: {
              if: [
                {
                  and: [
                    {
                      '==': [
                        {
                          var: 'probation_length_recommended',
                        },
                        'custom',
                      ],
                    },
                    {
                      '!=': [
                        {
                          var: 'contract_duration_type',
                        },
                        'fixed_term',
                      ],
                    },
                  ],
                },
                'number',
                'hidden',
              ],
            },
          },
          probation_length_maximum_months: {
            rule: {
              if: [
                {
                  '==': [
                    {
                      var: 'probation_length_recommended',
                    },
                    'custom',
                  ],
                },
                {
                  if: [
                    {
                      var: 'contract_end_date',
                    },
                    null,
                    4,
                  ],
                },
                {
                  if: [
                    {
                      var: 'contract_end_date',
                    },
                    0,
                    4,
                  ],
                },
              ],
            },
          },
          recommended_probation_description: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  if: [
                    {
                      or: [
                        {
                          '<': [
                            {
                              date_difference_in_months: [
                                {
                                  var: 'contract_end_date',
                                },
                                '2026-09-03',
                              ],
                            },
                            6,
                          ],
                        },
                        {
                          and: [
                            {
                              '==': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              '==': [
                                {
                                  '+': [
                                    {
                                      substr: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        8,
                                        2,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                3,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    "For fixed-term contracts up to 6 months, the probation period is 1 day per week worked, capped at a maximum of 14 days. This cannot be renewed. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
                    "For fixed-term contracts exceeding 6 months, the probation period is capped at 1 month. This cannot be renewed. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
                  ],
                },
                "Can be renewed once. To request a renewal, contact help@remote.com at least 1 month before the initial probation period ends. <a href='https://support.remote.com/hc/en-us/articles/43837455998221-How-Do-Probation-Period-Renewals-Work-for-Wage-Portage-Employees-on-a-indefinite-term-CDI-Contrat-%C3%A0-Dur%C3%A9e-Ind%C3%A9termin%C3%A9e-contract' target='_blank'>Learn more about renewals</a>",
              ],
            },
          },
          recommended_probation_label: {
            rule: {
              if: [
                {
                  var: 'contract_end_date',
                },
                {
                  cat: [
                    {
                      if: [
                        {
                          or: [
                            {
                              '<': [
                                {
                                  date_difference_in_months: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                6,
                              ],
                            },
                            {
                              and: [
                                {
                                  '==': [
                                    {
                                      date_difference_in_months: [
                                        {
                                          var: 'contract_end_date',
                                        },
                                        '2026-09-03',
                                      ],
                                    },
                                    6,
                                  ],
                                },
                                {
                                  '==': [
                                    {
                                      '+': [
                                        {
                                          substr: [
                                            {
                                              var: 'contract_end_date',
                                            },
                                            8,
                                            2,
                                          ],
                                        },
                                        0,
                                      ],
                                    },
                                    3,
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          min: [
                            {
                              max: [
                                {
                                  date_difference_in_weeks: [
                                    {
                                      var: 'contract_end_date',
                                    },
                                    '2026-09-03',
                                  ],
                                },
                                0,
                              ],
                            },
                            14,
                          ],
                        },
                        30,
                      ],
                    },
                    ' days',
                  ],
                },
                '4 months',
              ],
            },
          },
        },
      },
      'x-jsf-order': [
        'has_wage_portage_higher_degree',
        'has_wage_portage_years_of_experience',
        'wage_portage_eligibility',
        'contract_duration_type',
        'contract_end_date',
        'work_schedule',
        'work_hours_per_week',
        'has_probation_period',
        'probation_length_recommended',
        'probation_length',
        'probation_length_days',
        'available_pto',
        'role_description',
        'job_title_check_enabled',
        'additional_job_title_eligibility_check_slug',
        'additional_job_title_eligibility_check_result',
        'experience_level',
        'mission_duration',
        'mission_deliverables_cadence',
        'provided_systems',
        'provided_equipment',
        'primary_contact_point',
        'professional_qualifications',
        'key_skills',
        'work_experience',
        'field_of_work',
        'work_address_is_home_address',
        'employee_travel_required',
        'annual_gross_salary',
        'business_allowances_statement',
        'business_allowance_amount',
        'financial_reserve_amount',
        'business_allowance_ack',
        'home_office_allowance',
        'has_signing_bonus',
        'signing_bonus_amount',
        'has_bonus',
        'bonus_amount',
        'bonus_details',
        'has_commissions',
        'commissions_details',
        'commissions_ack',
        'non_compete_clause_apply',
        'non_compete_clause_halt_period_months',
        'non_compete_clause_compensation_amount',
        'non_compete_compensation_salary_percentage',
        'non_compete_restricted_activities',
      ],
      'x-rmt-meta': {
        jsfVersion: '1',
      },
    },
  },
  'test-allof-simple': {
    name: 'Test AllOf (With Modulo)',
    description:
      'Simple test schema with the PROBLEMATIC modulo computation from the complex schemas - will this break too?',
    schema: {
      type: 'object',
      additionalProperties: false,
      allOf: [
        {
          if: {
            properties: {
              annual_gross_salary: {
                type: 'integer',
              },
              contract_duration_type: {
                const: 'indefinite',
              },
            },
            required: ['annual_gross_salary', 'contract_duration_type'],
          },
          then: {
            properties: {
              business_allowances_statement: {
                title: 'Mandatory allowances',
                type: 'null',
                'x-jsf-logic-computedAttrs': {
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        "<strong>Mandatory allowances for indefinite contracts</strong><br />Annual gross salary: {{computed_annual_gross_salary_display}} EUR<br />Business allowance: {{computed_business_allowance_display}} EUR",
                    },
                  },
                },
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
          else: {
            properties: {
              business_allowances_statement: false,
            },
          },
        },
      ],
      properties: {
        annual_gross_salary: {
          description:
            "Enter the employee's annual gross base salary.",
          title: 'Annual gross salary',
          type: 'integer',
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        contract_duration_type: {
          description:
            'Select contract type to test conditional logic.',
          oneOf: [
            {
              const: 'indefinite',
              title: 'Indefinite contract (shows allowances statement)',
            },
            {
              const: 'fixed_term',
              title: 'Fixed-term contract (hides allowances statement)',
            },
          ],
          title: 'Contract duration type',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
        business_allowance_amount: {
          title: 'Business allowance amount',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            const: 'computed_business_allowance_amount',
            default: 'computed_business_allowance_amount',
          },
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
        business_allowances_statement: {
          title: 'Mandatory allowances',
          type: 'null',
          'x-jsf-presentation': {
            inputType: 'hidden',
          },
        },
      },
      required: [
        'annual_gross_salary',
        'contract_duration_type',
        'business_allowance_amount',
      ],
      'x-jsf-logic': {
        computedValues: {
          computed_annual_gross_salary_display: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                { '/': [{ var: 'annual_gross_salary' }, 100] },
                null,
              ],
            },
          },
          computed_business_allowance_amount: {
            rule: {
              if: [
                { var: 'annual_gross_salary' },
                {
                  '-': [
                    {
                      '*': [
                        { var: 'annual_gross_salary' },
                        { '/': [5, 100] },
                      ],
                    },
                    {
                      '%': [
                        {
                          '*': [
                            { var: 'annual_gross_salary' },
                            { '/': [5, 100] },
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
          computed_business_allowance_display: {
            rule: {
              if: [
                { var: 'business_allowance_amount' },
                { '/': [{ var: 'business_allowance_amount' }, 100] },
                null,
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
} as const;

export type SchemaKey = keyof typeof SAMPLE_SCHEMAS;

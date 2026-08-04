// Real-world jsfVersion 1 schema with computed forced-value money fields
// and number-guarded conditionals, used to reproduce PBYR-4321. Kept in the
// example app so it does not ship in the published bundle.
export const ITALY_APL_SCHEMA = {
  name: 'Italy APL Schema',
  description: 'Complex schema for Italy APL employment with conditional logic',
  schema: {
    additionalProperties: false,
    allOf: [
      {
        else: {
          properties: {
            non_solicitation_customer_number_of_months: false,
          },
        },
        if: {
          properties: {
            non_solicitation_customers: {
              const: 'yes',
            },
          },
          required: ['non_solicitation_customers'],
        },
        then: {
          properties: {
            non_solicitation_customer_number_of_months: {
              type: 'number',
            },
          },
          required: ['non_solicitation_customer_number_of_months'],
        },
      },
      {
        else: {
          properties: {
            non_solicitation_employees_number_of_months: false,
          },
        },
        if: {
          properties: {
            non_solicitation_employees: {
              const: 'yes',
            },
          },
          required: ['non_solicitation_employees'],
        },
        then: {
          properties: {
            non_solicitation_employees_number_of_months: {
              type: 'number',
            },
          },
          required: ['non_solicitation_employees_number_of_months'],
        },
      },
      {
        else: {
          properties: {
            non_interference_halt_period: false,
          },
        },
        if: {
          properties: {
            non_interference_apply: {
              const: 'yes',
            },
          },
          required: ['non_interference_apply'],
        },
        then: {
          required: ['non_interference_halt_period'],
        },
      },
      {
        else: {
          properties: {
            non_compete_clause_compensation_amount: false,
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
            non_compete_clause_compensation_percentage: {
              type: 'number',
            },
          },
          required: [
            'non_compete_clause_apply',
            'annual_gross_salary',
            'non_compete_clause_compensation_percentage',
          ],
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
          required: ['non_compete_clause_compensation_amount'],
        },
      },
      {
        else: {
          properties: {
            non_compete_clause_compensation_amount: false,
            non_compete_clause_compensation_percentage: false,
            non_compete_clause_halt_period_months: false,
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
            'non_compete_clause_compensation_percentage',
            'non_compete_clause_halt_period_months',
          ],
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
            annual_bonus_ack: false,
          },
        },
        if: {
          properties: {
            contract_duration_type: {
              enum: ['indefinite', 'fixed_term'],
            },
          },
          required: ['contract_duration_type'],
        },
        then: {
          properties: {
            annual_bonus_ack: {
              type: 'string',
            },
          },
          required: ['annual_bonus_ack'],
        },
      },
      {
        else: {
          properties: {
            daily_schedule: false,
          },
        },
        if: {
          properties: {
            schedule_type: {
              enum: ['core_business_hours', 'fixed_hours'],
            },
          },
          required: ['schedule_type'],
        },
        then: {
          required: ['daily_schedule'],
        },
      },
      {
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
              minimum: 18,
            },
          },
        },
      },
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
            work_hours_per_week: {
              const: 40,
              default: 40,
              description:
                'All employees in Italy are required to work 40 hours in a full-time position.',
              'x-jsf-presentation': {
                statement: {
                  title: 'Total of <b>40 hours</b> per week.',
                },
              },
            },
          },
        },
      },
      {
        else: {
          else: {
            properties: {
              probation_length_unit: {
                const: 'days',
                default: 'days',
              },
            },
            required: ['probation_length_days'],
          },
          if: {
            properties: {
              contract_duration_type: {
                const: 'indefinite',
              },
              professional_area: {
                enum: ['B', 'C'],
              },
            },
            required: ['professional_area', 'contract_duration_type'],
          },
          then: {
            properties: {
              probation_length_unit: {
                const: 'working_days',
                default: 'working_days',
              },
            },
            required: ['probation_length_working_days'],
          },
        },
        if: {
          properties: {
            contract_duration_type: {
              const: 'indefinite',
            },
            professional_area: {
              const: 'A',
            },
          },
          required: ['professional_area', 'contract_duration_type'],
        },
        then: {
          properties: {
            probation_length_unit: {
              const: 'months',
              default: 'months',
            },
          },
          required: ['probation_length'],
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
                    'Unfortunately based on the information entered, we cannot hire this role in Italy.',
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
                    "Remote AI isn't sure if we can hire this role in Italy",
                },
              },
            },
          },
        },
      },
      {
        else: {
          properties: {
            employer_acknowledges_risk: false,
          },
        },
        if: {
          properties: {
            additional_job_title_eligibility_check_result: {
              const: 'yes_with_ack',
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
                    "To proceed with hiring, please acknowledge that you remain responsible for, as applicable, employee safety, training, health checks, any incidents associated with the employee's work environment, and ensuring the employee has licensing to perform their role",
                  inputType: 'statement',
                  severity: 'warning',
                  title:
                    'Remote AI has flagged this role as risky to hire in Italy',
                },
              },
            },
          },
          required: ['employer_acknowledges_risk'],
        },
      },
      {
        else: {
          properties: {
            primary_point_of_contact_email: false,
          },
        },
        if: {
          properties: {
            primary_point_of_contact: {
              minLength: 1,
            },
          },
          required: ['primary_point_of_contact'],
        },
        then: {
          required: ['primary_point_of_contact_email'],
        },
      },
      {
        if: {
          properties: {
            experience_level: {
              const: 'level_4',
            },
          },
          required: ['experience_level'],
        },
        then: {
          properties: {
            job_category: {
              const: 'Impiegato',
              default: 'Impiegato',
            },
            professional_area: {
              const: 'C',
              default: 'C',
            },
          },
        },
      },
      {
        if: {
          properties: {
            experience_level: {
              const: 'level_3',
            },
          },
          required: ['experience_level'],
        },
        then: {
          properties: {
            job_category: {
              const: 'Operaio',
              default: 'Operaio',
            },
            professional_area: {
              const: 'B',
              default: 'B',
            },
          },
        },
      },
      {
        if: {
          properties: {
            experience_level: {
              const: 'level_2',
            },
          },
          required: ['experience_level'],
        },
        then: {
          properties: {
            job_category: {
              const: 'Impiegato',
              default: 'Impiegato',
            },
            professional_area: {
              const: 'B',
              default: 'B',
            },
          },
        },
      },
      {
        if: {
          properties: {
            experience_level: {
              const: 'level_1',
            },
          },
          required: ['experience_level'],
        },
        then: {
          properties: {
            job_category: {
              const: 'Impiegato',
              default: 'Impiegato',
            },
            professional_area: {
              const: 'A',
              default: 'A',
            },
          },
        },
      },
      {
        if: {
          properties: {
            experience_level: {
              const: 'quadro',
            },
          },
          required: ['experience_level'],
        },
        then: {
          properties: {
            job_category: {
              const: 'Quadro',
              default: 'Quadro',
            },
            professional_area: {
              const: 'A',
              default: 'A',
            },
          },
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
        if: {
          properties: {
            probation_length_unit: {
              const: 'days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length_recommended: {
              oneOf: [
                {
                  const: 'recommended',
                  description:
                    'The maximum probation period is set by contract type and role classification, not selecting one may impact actions like background checks.',
                  title: 'Longest probation period',
                  'x-jsf-logic-computedAttrs': {
                    title: '{{maximum_probation_pluralized}}',
                  },
                  'x-jsf-presentation': {
                    recommended: true,
                  },
                },
                {
                  const: 'custom',
                  nested_fields: ['probation_length_days'],
                  title: 'Choose your own length',
                },
              ],
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'months',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length_recommended: {
              oneOf: [
                {
                  const: 'recommended',
                  description:
                    'The maximum probation period is set by contract type and role classification, not selecting one may impact actions like background checks.',
                  title: 'Longest probation period',
                  'x-jsf-logic-computedAttrs': {
                    title: '{{maximum_probation_pluralized}}',
                  },
                  'x-jsf-presentation': {
                    recommended: true,
                  },
                },
                {
                  const: 'custom',
                  nested_fields: ['probation_length'],
                  title: 'Choose your own length',
                },
              ],
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'working_days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length_recommended: {
              oneOf: [
                {
                  const: 'recommended',
                  description:
                    'The maximum probation period is set by contract type and role classification, not selecting one may impact actions like background checks.',
                  title: 'Longest probation period',
                  'x-jsf-logic-computedAttrs': {
                    title: '{{maximum_probation_pluralized}}',
                  },
                  'x-jsf-presentation': {
                    recommended: true,
                  },
                },
                {
                  const: 'custom',
                  nested_fields: ['probation_length_working_days'],
                  title: 'Choose your own length',
                },
              ],
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_fixed: {
              const: 'yes',
            },
          },
          required: ['probation_length_fixed'],
        },
        then: {
          properties: {
            probation_length_recommended: {
              const: 'recommended',
              default: 'recommended',
              description:
                'A probation period allows for more flexible termination, especially for performance-related issues. The maximum probation period is set by contract type and role classification, not selecting one may impact actions like background checks.',
              'x-jsf-logic-computedAttrs': {
                'x-jsf-presentation': {
                  statement: {
                    severity: 'info',
                    title:
                      '<strong>Probation period of {{maximum_probation_pluralized}}</strong> for Italy.',
                  },
                },
              },
              'x-jsf-presentation': {
                inputType: 'statement',
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length: false,
            probation_length_working_days: false,
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            else: {
              properties: {
                probation_length_days: {
                  description: '',
                  'x-jsf-logic-computedAttrs': {
                    const: 'maximum_probation',
                    default: 'maximum_probation',
                  },
                  'x-jsf-presentation': {
                    inputType: 'hidden',
                  },
                },
              },
            },
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
                  probation_length_days: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                },
              },
              if: {
                properties: {
                  probation_length_days: {
                    const: 0,
                  },
                  probation_length_minimum: {
                    const: 0,
                  },
                },
                required: ['probation_length_days', 'probation_length_minimum'],
              },
              then: {
                properties: {
                  probation_length_days: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                      statement: {
                        description:
                          'Waiving the probation period is possible but discouraged',
                        severity: 'warning',
                      },
                    },
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
            probation_length_unit: {
              const: 'days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'yes',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            properties: {
              probation_length_days: {
                description: '',
                'x-jsf-logic-computedAttrs': {
                  const: 'maximum_probation',
                  default: 'maximum_probation',
                },
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
              probation_length_minimum: {
                const: 0,
              },
            },
            required: ['probation_length_fixed', 'probation_length_minimum'],
          },
          then: {
            properties: {
              probation_length_days: {
                description:
                  "If you enter a value of '0', the employee will not have a probation period.",
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'months',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length_days: false,
            probation_length_working_days: false,
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'months',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            else: {
              properties: {
                probation_length: {
                  description: '',
                  'x-jsf-logic-computedAttrs': {
                    const: 'maximum_probation',
                    default: 'maximum_probation',
                  },
                  'x-jsf-presentation': {
                    inputType: 'hidden',
                  },
                },
              },
            },
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
                  probation_length: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                },
              },
              if: {
                properties: {
                  probation_length: {
                    const: 0,
                  },
                  probation_length_minimum: {
                    const: 0,
                  },
                },
                required: ['probation_length', 'probation_length_minimum'],
              },
              then: {
                properties: {
                  probation_length: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                      statement: {
                        description:
                          'Waiving the probation period is possible but discouraged',
                        severity: 'warning',
                      },
                    },
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
            probation_length_unit: {
              const: 'months',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'yes',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            properties: {
              probation_length: {
                description: '',
                'x-jsf-logic-computedAttrs': {
                  const: 'maximum_probation',
                  default: 'maximum_probation',
                },
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'months',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
              probation_length_minimum: {
                const: 0,
              },
            },
            required: ['probation_length_fixed', 'probation_length_minimum'],
          },
          then: {
            properties: {
              probation_length: {
                description:
                  "If you enter a value of '0', the employee will not have a probation period.",
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'working_days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          properties: {
            probation_length: false,
            probation_length_days: false,
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'working_days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            else: {
              properties: {
                probation_length_working_days: {
                  description: '',
                  'x-jsf-logic-computedAttrs': {
                    const: 'maximum_probation',
                    default: 'maximum_probation',
                  },
                  'x-jsf-presentation': {
                    inputType: 'hidden',
                  },
                },
              },
            },
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
                  probation_length_working_days: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                },
              },
              if: {
                properties: {
                  probation_length_minimum: {
                    const: 0,
                  },
                  probation_length_working_days: {
                    const: 0,
                  },
                },
                required: [
                  'probation_length_working_days',
                  'probation_length_minimum',
                ],
              },
              then: {
                properties: {
                  probation_length_working_days: {
                    'x-jsf-presentation': {
                      inputType: 'number',
                      statement: {
                        description:
                          'Waiving the probation period is possible but discouraged',
                        severity: 'warning',
                      },
                    },
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
            probation_length_unit: {
              const: 'working_days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'yes',
              },
            },
            required: ['probation_length_fixed'],
          },
          then: {
            properties: {
              probation_length_working_days: {
                description: '',
                'x-jsf-logic-computedAttrs': {
                  const: 'maximum_probation',
                  default: 'maximum_probation',
                },
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
        },
      },
      {
        if: {
          properties: {
            probation_length_unit: {
              const: 'working_days',
            },
          },
          required: ['probation_length_unit'],
        },
        then: {
          if: {
            properties: {
              probation_length_fixed: {
                const: 'no',
              },
              probation_length_minimum: {
                const: 0,
              },
            },
            required: ['probation_length_fixed', 'probation_length_minimum'],
          },
          then: {
            properties: {
              probation_length_working_days: {
                description:
                  "If you enter a value of '0', the employee will not have a probation period.",
              },
            },
          },
        },
      },
    ],
    properties: {
      role_requires_license: {
        const: 'not_applicable',
        default: 'not_applicable',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      non_compete_clause_apply: {
        description:
          'In Italy, post-termination restrictions are governed by local Italian law. Valid non-compete clauses require separate compensation and limits on scope, duration, and geography. We recommend selecting No.',
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
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<p>In Italy, employers must provide separate financial compensation to the employee for the duration of the non-compete clause. Without compensation the clause is void under Article 2125 of the Civil Code.</p><ul>\n<li data-list-item-id="e4357a87e216ff5484e8d7a8fcf26b3f0">Italian law does not set a fixed minimum compensation amount, but Italian courts have consistently required compensation to be adequate relative to the scope of the restriction. Market practice is a minimum of 30% of <strong>the employee\'s annual gross salary</strong>, paid at the end of the restriction period. For more senior roles or roles with access to sensitive information, higher compensation may be necessary.</li>\n<li data-list-item-id="eae3681e6a04f982d7f904cf251c1820a">Depending on the type of restriction selected, different legal requirements apply under Italian law.</li>\n<li data-list-item-id="efe4e43aaa10789665d45badeaef41156">Post-termination restrictions have been crafted with local counsel to provide the best language possible. However, because the employment agreement is between Remote and the employee, Remote will not pursue enforcement action against an employee for violation.</li>\n<li data-list-item-id="ea62590939e413f4111c90e66fa4ebc99">Non-solicitation of employees, non-solicitation of customers, and non-interference clauses have no specific statutory framework under Italian law. They can be included as a deterrent but are unlikely to be enforceable before Italian courts.</li>\n<li data-list-item-id="ea5d4319601087272a2def18b99c6aaec">The non-compete clause is the only restriction with a clear statutory basis in Italy (Art. 2125 Civil Code). To be valid, it must be limited in scope (restricted to activities consistent with those performed by the employee during employment), duration, and geographic territory. Without these limitations, or without adequate written compensation, the clause is void.</li>\n<li data-list-item-id="ecc0a2377e87ab8599667b5f810ec36d1">In the context of staff leasing (somministrazione), non-compete clauses present additional enforceability challenges. The clause is formally between Remote and the employee — not between the client company and the employee. As a result, the client cannot enforce it directly, and Remote has no direct interest in bringing legal action against the employee on behalf of the client. Due to the limited use of non-compete clauses in staff leasing structures, there is no established Italian case law on their enforceability in this context, and it cannot be excluded that their validity may be questioned before Labour courts.</li>\n</ul>',
              error: false,
              id: 45035587502989,
              title: 'Non-compete clause',
            },
          },
        },
      },
      non_solicitation_customers: {
        description:
          'This prevents the employee from approaching or doing business with your customers for a competing business.',
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
        title: 'Apply a non-solicitation of customers clause?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<p>In Italy post-termination non-solicitation of customers covenants has a very strict limitation that might not be considered legitimate by the courts. From a precautionary perspective, you may include, but we cannot guarantee that it would be deemed valid in any potential legal proceedings.</p>',
              error: false,
              id: 45035599604109,
              title: 'Non-solicitation of customers clause',
            },
          },
        },
      },
      probation_length_recommended: {
        description:
          'A probation period allows for more flexible termination, especially for performance-related issues.',
        oneOf: [
          {
            const: 'recommended',
            description:
              'The maximum probation period is set by contract type and role classification, not selecting one may impact actions like background checks.',
            title: 'Longest probation period',
            'x-jsf-logic-computedAttrs': {
              title: '{{maximum_probation_pluralized}}',
            },
            'x-jsf-presentation': {
              recommended: true,
            },
          },
          {
            const: 'custom',
            nested_fields: ['probation_length_days'],
            title: 'Choose your own length',
          },
        ],
        title: 'Probation period',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about probation periods',
              content:
                '<h2 id="h_01KP1VF87XDE9TK5RSZE9SB23D">Why is it important to include a probationary period in an employee\'s contract?</h2><h3 id="h_01KP1VET0AY8ABDZ9VV5KD5KX2"> </h3><p>The purpose of a probationary period is to allow a specific time period for the employee and company to assess suitability for the role after having first-hand experience. On the one hand, it gives the company the opportunity to assess objectively whether the new employee is suitable for the job, considering their capability, skills, performance, attendance and general conduct.</p><p>During the probation period, it is typically simpler to terminate an employee that is underperforming. Often, standard notice periods do not apply or may be shortened. Depending on the employee\'s country of residence, it may be more difficult and costly to terminate an employee after their probation period is over.</p><p>Please be aware that if you do not elect to implement a probationary period and later conduct a background check during the onboarding process, Remote cannot unilaterally terminate employment following the receipt of unsatisfactory background check results.</p><p><strong>See also:</strong></p><ul>\n<li data-list-item-id="e402f4fff4bce8c33f7d353cfa51080f5"><a href="https://support.remote.com/hc/en-us/articles/9013403125773-How-do-I-include-a-probationary-period-in-the-employee-s-contract">How do I include a probationary period in the employee\'s contract?</a></li>\n<li data-list-item-id="eb32ac5c43556e421bea13c4f0f8746d0"><a href="https://support.remote.com/hc/en-us/articles/16281175221261-Is-a-probationary-period-required-in-Italy">What is the maximum length of probation based on the employee\'s experience level?</a></li>\n</ul>',
              error: false,
              id: 45035535804813,
              title: 'Learn more about probation periods',
            },
          },
          statement: {
            description:
              'If you need Remote to terminate an employee (whether inside or outside of probation) in Italy because of your company’s economic or organizational circumstances, a mutual termination agreement must be entered into with the employee.\n\nIt is common for employees in Italy to bring claims and employers to pay settlements or to opt for termination by mutual agreement. \n\nDuring probation, you do still have some more flexibility on termination; for example, when the termination reason is the employee’s performance. For this reason, we still recommend setting the probation period to the maximum allowed.',
            severity: 'info',
            title: 'Information on termination - probation',
          },
        },
      },
      probation_length_unit: {
        const: 'days',
        default: 'days',
        title: 'Probation length unit',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      work_hours_per_week: {
        description:
          'Please indicate the number of hours the employee will work per week.',
        maximum: 40,
        minimum: 18,
        title: 'Work hours per week',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      annual_bonus_ack: {
        const: 'acknowledged',
        title:
          'I confirm the annual gross salary includes 13th and 14th salaries',
        type: 'string',
        'x-jsf-presentation': {
          description:
            "In Italy, employees receive 13th and 14th month salaries (usually called vacation and Christmas allowances) as part of their annual gross salary. The 13th and 14th salary amounts are based on an employee's regular salary and aren't affected by bonuses or commissions.",
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about bonus salaries',
              content:
                '<p>This article provides information on how the 13th and 14th salaries (<em>tredicesima</em> and <em>quattordicesima</em>) are calculated and paid in Italy. Learn about the monthly installment system, the steps to calculate the salaries and the effect of leave of absence on these payments.</p>\n<p><strong>In this article, we cover:</strong></p>\n<ul>\n<li><a href="#h_01HH0HFT6FM6S150HVK7729DED">When will I receive the 13th and 14th salaries?</a></li>\n<li><a href="#h_01HH0HGESKMFZ351BES9T4N80C">How does the monthly installment system work for Italy\'s 13th and 14th salary payments?</a></li>\n<li><a href="#01HH0HH3ZMR4E6VAWPKC55N5D4">What are the steps to calculate the 13th and 14th salaries in Italy?</a></li>\n<li><a href="#h_01HH0HHYG51ZPD84CKM7W8VQ3F">Formula</a></li>\n<li><a href="#h_01HH0HHYG5T983YMYAEMGN1GHF">Example of 13th and 14th salary calculation</a></li>\n<li><a href="#h_01HH0HHYG5Z03ZT30P28E9YGCW">How does leave of absence affect the 13th and 14th salaries in Italy?</a></li>\n<li><a href="#h_01HH0HHYG547BJZ1RAN06VAX3X">Are the 13th and 14th salaries subject to tax in Italy?</a></li>\n</ul>\n<h3 id="h_01HH0HFT6FM6S150HVK7729DED">When will I receive the 13th and 14th salaries?</h3>\n<p>The 13th salary is paid in <strong>December</strong>, and the 14th salary is paid in <strong>June</strong>.</p>\n<p>Each month, employees accumulate a portion of these payments, <strong>provided they are on the payroll for at least 15 days in that month.</strong></p>\n<h3 id="h_01HH0HGESKMFZ351BES9T4N80C">How does the monthly installment system work for Italy\'s 13th and 14th salary payments?</h3>\n<p>In Italy, the 13th and 14th salaries are included in the annual salary and are accrued in installments.</p>\n<p>If an employee starts mid-year, their 13th and 14th salaries will be calculated based on the months they\'ve worked.</p>\n<h3 id="01HH0HH3ZMR4E6VAWPKC55N5D4">What are the steps to calculate the 13th and 14th salaries in Italy?</h3>\n<p>In Italy, the 14th salary is calculated using an installment method, which considers the number of months you\'ve worked in a year. Here are the steps to calculate the 14th salary gross amount:</p>\n<ol>\n<li>Divide the annual salary by 14 to get the <strong>monthly salary</strong>.</li>\n<li>Divide the <strong>monthly salary</strong> by 12 to get the <strong>monthly installment</strong>.</li>\n<li>Multiply the <strong>monthly installment</strong> by the number of months worked between July of the previous year and June of the current year. The result is <strong>the gross 14th salary</strong>.</li>\n</ol>\n<h3 id="h_01HH0HHYG51ZPD84CKM7W8VQ3F">Formula</h3>\n<p>Here\'s the formula to calculate the 14th salary:</p>\n<p><strong>Gross 13th/14th Salary =</strong> (Annual Salary / 14 )/12 * Number Of Months Worked</p>\n<h3 id="h_01HH0HHYG5T983YMYAEMGN1GHF">Example of 13th and 14th salary calculation</h3>\n<p>An employee who worked for 4 months from July 2021 to October 2021 in Italy and earns 115,999 EUR annually:</p>\n<ol>\n<li>Calculate John\'s monthly salary: 115,999 EUR / 14 = 8,285.64 EUR.</li>\n<li>Calculate the monthly installment: 8,285.64 EUR / 12 = 690.47 EUR.</li>\n<li>Now, calculate John\'s 14th salary: 690.47 EUR x 4 = 2,761.88 EUR.</li>\n</ol>\n<h3 id="h_01HH0HHYG5Z03ZT30P28E9YGCW">How does leave of absence affect the 13th and 14th salaries in Italy?</h3>\n<p>In Italy, the 13th salary still accrues during absences due to illness, work-related accidents, occupational diseases, maternity leave, parental leave and paid time off.</p>\n<p>However, certain absences like unpaid leave do not contribute to the accrual of these payments.</p>\n<h3 id="h_01HH0HHYG547BJZ1RAN06VAX3X">Are the 13th and 14th salaries subject to tax in Italy?</h3>\n<p>The 13th and 14th salaries are taxed and subject to social charges, similar to the regular salary.</p>\n<p><!-- notionvc: 1b38f168-20c0-49b4-b381-d8c6aa0cf510 --></p>\n<p><!-- notionvc: 4ef4c56c-2ff7-4ae4-bbd8-2d17af0a7b70 --></p>\n<p><strong><!-- notionvc: 98c271b3-40a5-4b06-8432-fdceee01e7a0 --></strong></p>\n<p><strong><!-- notionvc: 85c5948e-acb5-46c8-9482-fac3f9a59932 --></strong></p>\n<p><!-- notionvc: 0e1e7d78-4b06-43d2-b3e5-346231a9cd70 --></p>',
              error: false,
              id: 22020469803277,
              title: 'How do the 13th and 14th salaries work in Italy?',
            },
          },
        },
      },
      primary_point_of_contact_email: {
        description:
          'Enter the email of the person the employee will primarily work with or contact during the assignment.',
        format: 'email',
        maxLength: 255,
        title: 'Primary point of contact email',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'email',
        },
      },
      non_compete_clause_compensation_percentage: {
        description:
          'In Italy, non-compete pay must be at least 35% of monthly base salary throughout the post termination restrictions.',
        maximum: 100,
        minimum: 35,
        title: 'Non-compete salary percentage',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
          percentage: true,
        },
      },
      has_commissions: {
        description:
          'You can outline your policy and pay commission to the employee on the platform. However, commission will not appear in the employment agreement. Please send full policy details directly to the employee.',
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
      ita_work_equipment_provided: {
        default: ['computer', 'keyboard'],
        description:
          'Select all work equipment or materials that will be provided to the employee to perform the mission.',
        items: {
          anyOf: [
            {
              const: 'computer',
              title: 'Computer',
            },
            {
              const: 'keyboard',
              title: 'Keyboard',
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
          ],
        },
        title: 'Work equipment and materials',
        type: 'array',
        uniqueItems: true,
        'x-jsf-logic-validations': [
          'ita_work_equipment_provided_must_include_computer_and_keyboard',
        ],
        'x-jsf-presentation': {
          inputType: 'select',
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
              content:
                '<p><span class="sc-c090059b-0 fISxvo">We do not include bonus specifics in the employment agreement. However, you can create a bonus directly on the platform.</span></p>\n<p><span class="sc-c090059b-0 fISxvo">Please note that if you decide to offer other bonuses, it will be difficult or impossible to withdraw these bonuses if you change your mind later.</span></p>',
              error: false,
              id: 18019142406029,
              title: 'Other bonuses',
            },
          },
        },
      },
      part_time_salary_confirmation: {
        const: 'acknowledged',
        title: 'I confirm the salary is adjusted for part-time hours.',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
        },
      },
      equity_compensation: {
        additionalProperties: false,
        allOf: [
          {
            else: {
              properties: {
                equity_cliff: false,
                equity_vesting_period: false,
                number_of_stock_options: false,
              },
            },
            if: {
              properties: {
                offer_equity_compensation: {
                  const: 'yes',
                },
              },
              required: ['offer_equity_compensation'],
            },
            then: {},
          },
        ],
        properties: {
          equity_cliff: {
            deprecated: false,
            description:
              'When the first portion of the stock option grant will vest.',
            maximum: 100,
            minimum: 0,
            readOnly: false,
            title: 'Cliff (in months)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              inputType: 'number',
            },
          },
          equity_description: false,
          equity_vesting_period: {
            deprecated: false,
            description:
              'The number of years it will take for the employee to vest all their options.',
            maximum: 100,
            minimum: 0,
            readOnly: false,
            title: 'Vesting period (in years)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              inputType: 'number',
            },
          },
          number_of_stock_options: {
            deprecated: false,
            description: "Tell us the type of equity you're granting as well.",
            maxLength: 255,
            readOnly: false,
            title: 'Number of options, RSUs, or other equity granted',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          offer_equity_compensation: {
            description:
              "Granting equity to your team generally triggers tax and legal obligations. In order for you to stay compliant, it's important to declare any equity grants.",
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
            title: 'Will this employee receive equity?',
            type: 'string',
            'x-jsf-presentation': {
              direction: 'row',
              inputType: 'radio',
            },
          },
        },
        required: ['offer_equity_compensation'],
        title: 'Equity management',
        type: 'object',
        'x-jsf-order': [
          'offer_equity_compensation',
          'number_of_stock_options',
          'equity_cliff',
          'equity_vesting_period',
          'equity_description',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
          meta: {
            cost: {
              original: {
                currency: 'USD',
                amount: 39,
              },
              discount: null,
              calculated: {
                currency: 'USD',
                amount: 39,
              },
            },
            helpCenter: {
              callToAction: 'Learn more about equity management at Remote',
              content:
                '<p>Remote Equity is a lightweight compliance tool designed to help you manage equity grants across borders for team members hired through Remote\'s Employer of Record (EOR).</p><p>Whether you’re managing vesting, reporting exercises, or navigating local tax laws, Remote Equity gives you the structure to stay compliant, avoid risk, and support your team across borders.</p><h4 id="h_01K0YQSYJ8JPKYXNNNW90B0QJP">Why it matters</h4><p>As your EOR, <strong>Remote is legally responsible</strong> for equity-related tax and reporting in the countries where your team members are employed. That means we don’t just track equity, we:</p><ul>\n<li data-list-item-id="eba6b95d2e41a276665f3f64525e0eb59">Withhold and report taxes when required</li>\n<li data-list-item-id="ed16c354038e4b3d908bacd965dc2d71b">File with local tax authorities</li>\n<li data-list-item-id="eb7162ef11477f7a7737fe34a48979559">Support team members with clear guidance on their tax responsibilities</li>\n</ul><p>Most equity platforms can’t do that because they’re not the legal employer. <strong>Remote Equity ensures we have the data we need, when we need it, to keep your company compliant and your team fairly rewarded.</strong></p><p>Behind the scenes, our tax team:</p><ul>\n<li data-list-item-id="ef5c97b0472ebc9a0819e312646e4cd66">Handles tax withholdings when taxable events occur</li>\n<li data-list-item-id="e5f3560641743ab0c57ba47683638560e">Provides guidance to you and your team, even when no withholding is required</li>\n<li data-list-item-id="ed17d307d635b18f9f784df12d1dbe1cd">Manages additional reporting where local laws demand it</li>\n</ul><p>See also: <a href="https://support.remote.com/hc/en-us/articles/37710493624589-What-types-of-equity-grants-should-I-declare-in-Remote-Equity-Essentials">What types of equity grants should I declare in Remote Equity?</a></p><h4 id="h_01K0YQSYJDJ3JYC1C642ASB8E2">What’s included</h4><p>Remote Equity provides:</p><ul>\n<li data-list-item-id="e0cc8d8c0b7d060b9de89e3c870fc1579">\n<strong>Tracking and alerts</strong> for events that may create a tax obligation (like vesting or exercising)</li>\n<li data-list-item-id="e88a2fc75f6f43db27891e415e2f90400">\n<strong>Automated compliance reminders</strong> based on local deadlines and regulations</li>\n<li data-list-item-id="e2c2cf9ef914143e339eb32e1b70c83da">\n<strong>Localized guidance for team members</strong>, shared through the Remote Equity app</li>\n<li data-list-item-id="e8a2c20d648ed01a3db135ef4ada0de61">\n<strong>Support from Remote’s tax and legal teams</strong>, who handle obligations on your behalf</li>\n<li data-list-item-id="e184af2a6420412152b377815ebe18ce2">\n<strong>Integration with Carta and Pulley</strong> to automatically sync grant declarations and exercise information</li>\n</ul><h4 id="h_01K0YQSYJSCK6XYBXF3Q56KRC8"><strong>Get started in minutes</strong></h4><p>Setup takes less than five minutes. Just log in to your Remote account, and launch the Equity App to follow the setup steps.</p><p>Helpful guides to get started:</p><ul>\n<li data-list-item-id="e73e204bc587d3417ecab74e3a29ccc2a"><a href="https://support.remote.com/hc/en-us/articles/37547625350925-How-can-I-access-Remote-Equity-Essentials">How can I access Remote Equity?</a></li>\n<li data-list-item-id="e0ca43a64bf2361ce43443e98200daa5a"><a href="https://support.remote.com/hc/en-us/articles/35577980536589">How do I declare a grant?</a></li>\n<li data-list-item-id="edfa1a00c07a70449ebe34c25dec818fe"><a href="https://support.remote.com/hc/en-us/articles/35671968187149-How-can-my-employees-see-their-equity-information">How can my team access their equity information?</a></li>\n<li data-list-item-id="edaaf9eb107949f79894c24e3b984da30"><a href="https://support.remote.com/hc/en-us/articles/35546454220301-What-happens-if-I-already-declared-equity-before-using-Remote-Equity-Essentials">What happens if I already declared equity before using Remote Equity?</a></li>\n</ul><h4 id="h_01K0YQSYJV9EH2AQ9HWYS1826S"><span class="wysiwyg-underline">Frequently Asked Questions (FAQs)</span></h4><p><strong>Who needs to use Remote Equity?</strong></p><p>Any Remote customer granting equity to a team member hired through Remote’s EOR must use Remote Equity to meet local compliance requirements.</p><p><strong>Why can’t we just use our own equity tool?</strong></p><p>Traditional equity tools track grants and vesting, but they don\'t file taxes, withhold contributions, or report income to local authorities. Remote, as the legal employer, is responsible for these actions. Remote Equity ensures those obligations are covered.</p><p><strong>What happens if we don’t use it?</strong></p><p>If Remote doesn’t receive timely and accurate equity data, required filings may be missed. This can result in compliance risks, unexpected tax liabilities, and issues for both your company and your team members.</p><p><strong>How much does Remote Equity cost?</strong></p><p>Remote Equity costs 39 USD per month for each EOR team member with equity. <a href="https://support.remote.com/hc/en-us/articles/35546441948685-How-much-does-Remote-Equity-Essentials-cost">Learn more</a>.</p><p>For comprehensive information, visit the <a href="https://support.remote.com/hc/en-us/sections/35546215243661-Remote-Equity-Essentials" tabindex="0" data-token-index="1" rel="noopener noreferrer">Remote Equity hub</a>.</p>',
              error: false,
              id: 38303424407821,
              title:
                'Welcome to Remote Equity: Global equity, without the compliance headaches',
            },
          },
        },
      },
      probation_length_maximum: {
        title: 'Probation length maximum',
        type: 'integer',
        'x-jsf-logic-computedAttrs': {
          const: 'maximum_probation',
          default: 'maximum_probation',
        },
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      work_from_home_allowance_ack: {
        const: 'acknowledged',
        description:
          'From June 1, 2025, all full-time employees in Italy are entitled to a mandatory work-from-home allowance of 50 EUR per month. Part-time employees are entitled to a percentage of this amount proportional to their monthly number of working days.',
        title:
          'I acknowledge the employee is entitled to a monthly work-from-home allowance',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<p>Starting June 1, 2025 a monthly work-from-home allowance (WFH) of <strong>50 EUR gross</strong> is mandatory for all full-time employees in Italy who <strong>signed a Telework Agreement</strong>. This allowance is designed to help offset expenses related to teleworking, such as electricity and internet costs. It is taxable and will be listed as WFH allowance on payslips. </p>\n<p><strong>Additional information</strong></p>\n<ul>\n<li>Part-time employees who work from home will receive a prorated amount based on their working hours. </li>\n<li>Employees working from co-working spaces remain eligible for the WFH allowance, as long as they have a valid Telework Agreement in place. </li>\n<li>Employers may choose to offer a higher work-from-home allowance. To do so, they can add the gross amount through the Incentives tab on Remote.</li>\n</ul>\n<p><strong>See also:</strong> <a href="https://support.remote.com/hc/en-us/articles/32491634534925" target="_blank" rel="noopener noreferrer">Guide to telework regulations and work from home (WFH) allowance in Italy</a></p>\n<p><span class="wysiwyg-font-size-small"><em><span class="notion-enable-hover" data-token-index="0"><strong>Disclaimer:</strong> Please be advised that the information provided is for general guidance only and should not be considered legal or taxation advice. The Employee Handbook and supporting onboarding guidance provided is not a binding employment contract. Customers and Employees are strongly encouraged to contact the Remote team for expert guidance and assistance in navigating the intricate landscape of employee documentation requirements in need. Consulting with our team is imperative to ensure compliance with local employment standards legislation and is vital in making informed decisions whilst adhering to all relevant regulations. All responsibilities related to workplace policies, including but not limited to diversity and inclusion, background checks, equal opportunity employment and disciplinary actions, rest with the Customer. It is the Customers responsibility to ensure that their policies and practices comply with all applicable laws and regulations. Company policies may be subject to change in the future. This Handbook is updated regularly. Remote does not approve printing or offline copies of this Handbook, as key information may become outdated, potentially leading to misinformed decisions or breaches of employment obligations. Always refer to the live Help Centre version for the most accurate guidance. </span></em></span></p>',
              error: false,
              id: 37076397395213,
              title: 'Work from home (WFH) allowance in Italy',
            },
          },
        },
      },
      non_interference_halt_period: {
        description:
          'Non-interference clauses can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
        maximum: 12,
        minimum: 1,
        title: 'Non-interference clause duration, in months',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
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
      annual_gross_salary: {
        description:
          "In Italy, minimum salaries are established through collective bargaining agreements and differ depending on the employee's job level.",
        title: 'Annual gross salary',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-logic-computedAttrs': {
          minimum: 'minimum_annual_gross_salary_in_cents',
          'x-jsf-errorMessage': {
            minimum: 'Must be €{{minimum_annual_gross_salary}} or greater.',
          },
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<h2 id="h_01K4CMDCE7HV3YX15CCW1HX0BP">How do job levels work in Italy?</h2>\n<p>If you\'re working in Italy or managing team members there, understanding job levels can help you identify roles, responsibilities, and salary expectations. This article explains how job levels are structured in Italy, and includes the minimum wage for each level.</p>\n<h2 id="h_01K4CMDCE713MT9F2YFSXPXYBM">What are the job levels in Italy?</h2>\n<p>Job levels in Italy are defined by national labor agreements and are used across many industries. These levels help categorize team members based on their responsibilities and the skills required for their roles.</p>\n<ul>\n<li>\n<strong>Quadro:</strong> This category of managers, subordinate workers who perform functions of an ongoing nature that are of significance importance for the development and implementation of the company\'s objectives.</li>\n<li>\n<strong>First level</strong>: This includes sector leaders who are responsible for overseeing various departments within the company.</li>\n<li>\n<strong>Second level</strong>: These are employees who have managerial or control responsibilities within their specific areas.</li>\n<li>\n<strong>Third level</strong>: This group consists of employees with specialized technical skills for the company\'s operations.</li>\n<li>\n<strong>Fourth level</strong>: Employees who handle sales and are responsible for meeting the company\'s sales goals fall under this level.</li>\n<li>\n<strong>Fifth level</strong>: This level is for staff members with both technical and practical knowledge</li>\n<li>\n<strong>Sixth level</strong>: Workers who carry out tasks requiring simple knowledge.</li>\n<li>\n<strong>Seventh level</strong>: The seventh level includes cleaners and other roles performing similar duties.</li>\n</ul>\n<h2 id="h_01K4CMEB45T1CA9R9JYJ4C5J31">What are the minimum wages for each level?</h2>\n<p>Minimum wages for job levels in Italy are defined by collective bargaining agreements. These wages are updated periodically. Below are the latest agreed wages, split by the periods in which they apply.</p>\n<p> </p>\n<p><strong>Minimum wage from March 1, 2025 until October 31, 2025</strong></p>\n<table>\n<thead>\n<tr>\n<th>Job level</th>\n<th>Monthly minimum salary (EUR)</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Q (Quadro)</td>\n<td>€2942.81</td>\n</tr>\n<tr>\n<td>1</td>\n<td>€2468.03</td>\n</tr>\n<tr>\n<td>2</td>\n<td>€2204.15</td>\n</tr>\n<tr>\n<td>3</td>\n<td>€1958.55</td>\n</tr>\n<tr>\n<td>4</td>\n<td>€1763.28</td>\n</tr>\n<tr>\n<td>5</td>\n<td>€1642.63</td>\n</tr>\n<tr>\n<td>6</td>\n<td>€1527.2</td>\n</tr>\n<tr>\n<td>7</td>\n<td>€1387.04</td>\n</tr>\n</tbody>\n</table>\n<p> </p>\n<p><strong>Minimum wage from November 1, 2025 until October 31, 2026</strong></p>\n<table>\n<thead>\n<tr>\n<th>Job level</th>\n<th>Monthly minimum salary (EUR)</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Q (Quadro)</td>\n<td>€3003.75</td>\n</tr>\n<tr>\n<td>1</td>\n<td>€2522.93</td>\n</tr>\n<tr>\n<td>2</td>\n<td>€2251.64</td>\n</tr>\n<tr>\n<td>3</td>\n<td>€1999.15</td>\n</tr>\n<tr>\n<td>4</td>\n<td>€1798.39</td>\n</tr>\n<tr>\n<td>5</td>\n<td>€1674.34</td>\n</tr>\n<tr>\n<td>6</td>\n<td>€1555.68</td>\n</tr>\n<tr>\n<td>7</td>\n<td>€1411.42</td>\n</tr>\n</tbody>\n</table>\n<p> </p>\n<p>Please note that we cannot provide a employee with a “Dirigente”/Executive level.<!-- notionvc: 0fa13bbb-049f-47a3-a0c9-9b0623d457f5 --></p>\n<p>See also: <a href="https://support.remote.com/hc/en-us/articles/26033353995277-Understanding-the-NCBA-Tertiary-Renewal-2024-2027">Understanding the NCBA Tertiary Renewal (2024-2027)</a></p>\n<p><!-- notionvc: d40fa0fb-2056-4a68-9007-1ec2faa557c3 --></p>\n<!-- notionvc: 969263f0-c8dd-4e95-b611-946e9ef8b435 -->',
              error: false,
              id: 26340303835021,
              title: 'Italy Job Levels and Minimum Wage',
            },
          },
        },
      },
      non_interference_apply: {
        description:
          'Prevents the employee from interfering with your business or customer relationships after leaving.',
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
        title: 'Apply a non-interference clause?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      contract_duration_type: {
        const: 'indefinite',
        default: 'indefinite',
        description:
          'Under Italian work agency rules, employees are hired by an agency and assigned to a client. We currently support only indefinite contracts and do not offer fixed-term contracts.',
        oneOf: [
          {
            const: 'indefinite',
            title: 'Indefinite',
            'x-jsf-presentation': {
              recommended: true,
            },
          },
        ],
        title: 'Contract duration',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
          statement: {
            title: '<strong>Indefinite contract duration</strong> for Italy.',
          },
        },
      },
      available_pto: {
        minimum: 0,
        title: 'Paid time off days',
        type: 'number',
        'x-jsf-logic-computedAttrs': {
          const: 'minimum_pto_computed',
          default: 'minimum_pto_computed',
          'x-jsf-presentation': {
            statement: {
              description:
                'Employees in Italy are entitled to at least {{minimum_pto_computed}} working days of paid annual leave per year. Employees receive leave based on their working schedule.',
              title:
                '<strong>Minimum of {{minimum_pto_computed}} days of paid annual leave per year</strong>',
            },
          },
        },
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      probation_length: {
        description: '',
        minimum: 0,
        title: 'Probation period in months',
        type: 'number',
        'x-jsf-logic-computedAttrs': {
          maximum: 'maximum_probation',
          minimum: 'minimum_probation',
        },
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      experience_level: {
        description:
          'Please select the experience level that aligns with this role based on the job description (not the employees overall experience). The compliant probation period will be limited per the selected level and Italian law/NCBA.',
        oneOf: [
          {
            const: 'quadro',
            description:
              "Middle managers who perform functions of significant importance for the development and implementation of the company's objectives, with managerial authority over other workers.",
            title: 'Quadro',
          },
          {
            const: 'level_1',
            description:
              'Senior white-collar workers with directive responsibilities, high degree of operational autonomy, and executive or supervisory functions over other staff.',
            title: '1st Level',
          },
          {
            const: 'level_2',
            description:
              'White-collar workers who perform technical or conceptual tasks with operational autonomy, including coordination and control functions, without directive authority over others.',
            title: '2nd Level',
          },
          {
            const: 'level_3',
            description:
              'Skilled blue-collar workers with specialised technical knowledge and professional ability required to perform complex tasks within their scope of duties.',
            title: '3rd Level',
          },
          {
            const: 'level_4',
            description:
              'White-collar workers who perform clerical or administrative tasks under the direction and supervision of others, requiring standard knowledge and practical skills.',
            title: '4th Level',
          },
        ],
        title: 'Experience level',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
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
      non_solicitation_employees_number_of_months: {
        description:
          'Non-solicitation of employees clauses can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
        maximum: 12,
        minimum: 1,
        title: 'Duration in months',
        type: ['number', 'null'],
        'x-jsf-presentation': {
          inputType: 'number',
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
              content:
                '<div class="sc-8483994-0 sc-25e5b337-1 gagDAr dNpfwN">\n<header class="sc-8483994-0 sc-98ea0a46-0 cFaANn gAlQJD sc-704369bd-0 jOYBDY">\n<h2 class="sc-c090059b-0 lcffkV sc-704369bd-3 eWYhqz" id="01H7WSRV90B3R0X35RZ21B959A">Why do I need to define a role description?</h2>\n</header><span class="sc-c090059b-0 fISxvo">It will appear in the employment agreement. Be thorough and accurate, especially if your employee is applying for a visa.</span>\n</div>\n<div class="sc-8483994-0 sc-25e5b337-1 gagDAr dNpfwN"> </div>\n<h2 class="sc-8483994-0 gagDAr" id="01H7WSRV908B1DKFVDFKNTN2EZ"><span class="sc-c090059b-0 iaMkhB sc-25e5b337-3 jwgiWP">Tips for a better role description</span></h2>\n<ul>\n<li class="sc-8483994-0 gagDAr">Keep it short – up to 5 main responsibilities</li>\n<li class="sc-8483994-0 gagDAr"><span style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;">Include punctuation</span></li>\n<li class="sc-8483994-0 gagDAr">No need to mention your company, focus on the specific duties of the role</li>\n</ul>',
              error: false,
              id: 18019255579405,
              title: 'Role description',
            },
          },
        },
      },
      primary_point_of_contact: {
        description:
          'Enter the name of the person the employee will primarily work with or contact during the assignment.',
        maxLength: 255,
        title: 'Primary point of contact',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'text',
        },
      },
      available_pto_type: {
        const: 'fixed',
        default: 'fixed',
        title: 'Number of paid time off days',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      schedule_type: {
        oneOf: [
          {
            const: 'flexible',
            suffix: 'Can work any time or day',
            title: 'Flexible',
          },
          {
            const: 'core_business_hours',
            suffix: 'Must be present at specific times',
            title: 'Flexible within core hours',
          },
          {
            const: 'fixed_hours',
            suffix: 'Must work a set daily schedule',
            title: 'Fixed',
          },
        ],
        title: 'Employee work schedule',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      signing_bonus_amount: {
        minimum: 0,
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
      non_solicitation_employees: {
        description:
          'This prevents the employee from recruiting or attempting to hire your employees after leaving.',
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
        title: 'Apply a non-solicitation of employees clause?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
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
      professional_area: {
        title: 'Professional area',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      non_solicitation_customer_number_of_months: {
        description:
          'Non-solicitation of customers clauses can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
        maximum: 12,
        minimum: 1,
        title: 'Duration in months',
        type: ['number', 'null'],
        'x-jsf-presentation': {
          inputType: 'number',
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
      probation_length_minimum: {
        title: 'Probation length minimum',
        type: 'integer',
        'x-jsf-logic-computedAttrs': {
          const: 'minimum_probation',
          default: 'minimum_probation',
        },
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      non_compete_clause_halt_period_months: {
        description:
          'Non-compete clauses in Italy can last between 1 and 12 months. The clause begins after the termination of the employment agreement.',
        maximum: 12,
        minimum: 1,
        title: 'Duration in months',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      daily_schedule: {
        allOf: [
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    friday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'friday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['friday'],
                },
              },
            },
          },
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    thursday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'thursday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['thursday'],
                },
              },
            },
          },
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    wednesday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'wednesday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['wednesday'],
                },
              },
            },
          },
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    tuesday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'tuesday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['tuesday'],
                },
              },
            },
          },
          {
            else: {
              properties: {
                schedule: {
                  properties: {
                    monday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'monday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['monday'],
                },
              },
            },
          },
        ],
        properties: {
          schedule: {
            additionalProperties: false,
            properties: {
              friday: {
                properties: {
                  break_duration_minutes: {
                    default: 60,
                    minimum: 0,
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                  end_time: {
                    default: '18:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                  start_time: {
                    default: '09:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                required: ['start_time', 'end_time', 'break_duration_minutes'],
                title: 'Friday',
                type: 'object',
                'x-jsf-order': [
                  'start_time',
                  'end_time',
                  'break_duration_minutes',
                ],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
              monday: {
                properties: {
                  break_duration_minutes: {
                    default: 60,
                    minimum: 0,
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                  end_time: {
                    default: '18:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                  start_time: {
                    default: '09:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                required: ['start_time', 'end_time', 'break_duration_minutes'],
                title: 'Monday',
                type: 'object',
                'x-jsf-order': [
                  'start_time',
                  'end_time',
                  'break_duration_minutes',
                ],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
              thursday: {
                properties: {
                  break_duration_minutes: {
                    default: 60,
                    minimum: 0,
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                  end_time: {
                    default: '18:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                  start_time: {
                    default: '09:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                required: ['start_time', 'end_time', 'break_duration_minutes'],
                title: 'Thursday',
                type: 'object',
                'x-jsf-order': [
                  'start_time',
                  'end_time',
                  'break_duration_minutes',
                ],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
              tuesday: {
                properties: {
                  break_duration_minutes: {
                    default: 60,
                    minimum: 0,
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                  end_time: {
                    default: '18:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                  start_time: {
                    default: '09:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                required: ['start_time', 'end_time', 'break_duration_minutes'],
                title: 'Tuesday',
                type: 'object',
                'x-jsf-order': [
                  'start_time',
                  'end_time',
                  'break_duration_minutes',
                ],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
              wednesday: {
                properties: {
                  break_duration_minutes: {
                    default: 60,
                    minimum: 0,
                    title: 'Break duration (minutes)',
                    type: 'integer',
                    'x-jsf-presentation': {
                      inputType: 'number',
                    },
                  },
                  end_time: {
                    default: '18:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'End time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                  start_time: {
                    default: '09:00',
                    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
                    title: 'Start time',
                    type: 'string',
                    'x-jsf-presentation': {
                      inputType: 'time',
                    },
                  },
                },
                required: ['start_time', 'end_time', 'break_duration_minutes'],
                title: 'Wednesday',
                type: 'object',
                'x-jsf-order': [
                  'start_time',
                  'end_time',
                  'break_duration_minutes',
                ],
                'x-jsf-presentation': {
                  inputType: 'fieldset',
                },
              },
            },
            title: 'Schedule details',
            type: 'object',
            'x-jsf-order': [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
            ],
            'x-jsf-presentation': {
              inputType: 'fieldset',
              variant: 'focused',
            },
          },
          selected_days: {
            default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            items: {
              anyOf: [
                {
                  label: 'Monday',
                  value: 'monday',
                },
                {
                  label: 'Tuesday',
                  value: 'tuesday',
                },
                {
                  label: 'Wednesday',
                  value: 'wednesday',
                },
                {
                  label: 'Thursday',
                  value: 'thursday',
                },
                {
                  label: 'Friday',
                  value: 'friday',
                },
              ],
            },
            title: 'Work days',
            type: 'array',
            uniqueItems: true,
            'x-jsf-presentation': {
              inputType: 'select',
            },
          },
        },
        required: ['selected_days'],
        title: 'Daily schedule',
        type: 'object',
        'x-jsf-order': ['selected_days', 'schedule'],
        'x-jsf-presentation': {
          inputType: 'fieldset',
          metadata: {
            country_name: 'Italy',
            default_break_duration_minutes: 60,
            default_end_time: '18:00',
            default_schedule: [
              {
                break_duration_minutes: 60,
                day: 'monday',
                end_time: '18:00',
                hours: 8,
                start_time: '09:00',
              },
              {
                break_duration_minutes: 60,
                day: 'tuesday',
                end_time: '18:00',
                hours: 8,
                start_time: '09:00',
              },
              {
                break_duration_minutes: 60,
                day: 'wednesday',
                end_time: '18:00',
                hours: 8,
                start_time: '09:00',
              },
              {
                break_duration_minutes: 60,
                day: 'thursday',
                end_time: '18:00',
                hours: 8,
                start_time: '09:00',
              },
              {
                break_duration_minutes: 60,
                day: 'friday',
                end_time: '18:00',
                hours: 8,
                start_time: '09:00',
              },
            ],
            default_start_time: '09:00',
            subtract_breaks_in_work_hours: true,
            work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            work_hours_per_week: {
              baseline: {
                maximum: 40,
                minimum: 18,
              },
              full_time: {
                maximum: 40,
                minimum: 40,
              },
              part_time: {
                maximum: 39,
                minimum: 18,
              },
            },
          },
        },
      },
      role_is_onsite: {
        const: 'not_applicable',
        default: 'not_applicable',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      work_schedule: {
        oneOf: [
          {
            const: 'full_time',
            description: 'Typically works around 40 hours per week.',
            title: 'Full-time',
          },
          {
            const: 'part_time',
            description:
              'Works fewer than 40 hours per week on a regular schedule.',
            title: 'Part-time',
          },
        ],
        title: 'Type of employee',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
        },
      },
      probation_length_working_days: {
        description: '',
        minimum: 0,
        title: 'Probation period in working days',
        type: 'number',
        'x-jsf-logic-computedAttrs': {
          maximum: 'maximum_probation',
          minimum: 'minimum_probation',
        },
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      job_category: {
        title: 'Job category',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'hidden',
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
        oneOf: [
          {
            const: 'primary_school_certificate',
            title: 'Primary school certificate',
          },
          {
            const: 'lower_secondary_school_certificate',
            title: 'Lower secondary school certificate',
          },
          {
            const: 'vocational_qualification',
            title: 'Vocational qualification',
          },
          {
            const: 'upper_secondary_school_leaving_certificate',
            title: 'Upper secondary school leaving certificate',
          },
          {
            const: 'higher_technical_artistic_diploma',
            title: 'Higher technical/artistic diploma (ITS/AFAM)',
          },
          {
            const: 'bachelors_degree',
            title: "Bachelor's degree",
          },
          {
            const: 'masters_degree',
            title: "Master's degree",
          },
          {
            const: 'phd_research_doctorate',
            title: 'PhD / Research Doctorate',
          },
        ],
        title: 'Professional qualifications',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      additional_job_title_eligibility_check_slug: {
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      probation_length_days: {
        description: '',
        minimum: 0,
        title: 'Probation period in days',
        type: 'number',
        'x-jsf-logic-computedAttrs': {
          maximum: 'maximum_probation',
          minimum: 'minimum_probation',
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
      probation_length_fixed: {
        title: 'Probation length fixed',
        type: 'string',
        'x-jsf-logic-computedAttrs': {
          const: 'probation_fixed',
          default: 'probation_fixed',
        },
        'x-jsf-presentation': {
          inputType: 'hidden',
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
              callToAction: '(i) Guidance on drafting a commission plan here.',
              content:
                '<p>It is important to understand that commission plans are individual agreements between you, and each team member. Consequently, it is important that these plans are communicated directly between you and the respective team members. This direct communication ensures clarity, transparency, and a clear understanding of the agreed-upon terms for the commission plan.</p>\n<p>Performance-linked bonuses and commissions are payments that are contingent on various factors, including individual and team performance, business outcomes, and other metrics agreed upon by you and the employees providing you services. As these are rewards that are subject to your evaluation and adjustment based on the agreed-upon criteria, we strongly recommend that you document these plans as compliantly as possible, and their specifics separately in writing, with the employee providing you services, following the below guidelines:</p>\n<ul>\n<li>Please note if there is any doubt or lack of clarity due to ambiguous wording, it will be interpreted to the employee’s benefit. Therefore, the plan should be reviewed thoroughly to determine whether it could be interpreted various ways. If so, the respective wording should be amended in a way that is precise and can be understood in one way only.</li>\n<li>In some jurisdictions, bonus and commission plans can be contractually drafted as being discretionary, but still remain unambiguous.  Where this is legally possible, this is the recommended approach to legally best protect the employer/you from any potential disputes.  Please note, however, that employees may still have a claim for commission payments, even if an agreement is drafted as discretionary.</li>\n<li>Basis for Commission Calculation: The commission plan should clearly outline the basis on which the commission will be calculated. This may include factors such as sales revenue, units sold, profit margin, or other measurable performance indicators. The commission plan should also include the timeframe in which the respective target must be achieved.</li>\n<li>Commission Rate: The commission plan should specify the commission rate or rates applicable to different levels of performance. It should clearly define how the commission will be determined, based on achieving specific targets or milestones. In order to limit the financial risk, a commission plan can include a regulation on the maximum amount of commissions that can be earned.</li>\n<li>Target Goals: The commission plan should establish realistic and achievable target goals or sales quotas that the employee is expected to reach in order to earn commission. </li>\n<li>Calculation Period: The commission plan should specify the calculation period for commission payouts. This could be monthly or quarterly. It should also state the timeline for determining and disbursing commission payments. Furthermore, a commission plan should include a specification about the point in time until when targets are set each year. Commission targets should be given prior to the commencement of the plan period.</li>\n<li>Commission Calculation Method: The commission plan should outline the methodology for calculating the commission. It should specify any deductions, adjustments, or exclusions that may be applicable to the commission calculation.</li>\n<li>Payment Terms: The commission plan should detail the terms and conditions for commission payments, including the payment schedule, method of payment, and any additional requirements or conditions. It should also explain how leaves, for example, sick leave and maternity leave, influence payment of commission and bonus, considering local requirements and non discrimination rules.</li>\n<li>Termination or Modification: The commission plan should address how it may be terminated or modified, including the circumstances under which changes may be made and the notice period required.</li>\n<li>It is helpful to include terms regarding dispute resolution.</li>\n</ul>\n<p>Please be aware that this guideline does not constitute legal advice. It is advisable to consult with your legal counsel for expert advice while formulating such plans. We will not assume liability for any claims that may arise due to a non-compliant and/or ambiguous commission plan provided to employees.</p>',
              error: false,
              id: 17932049668109,
              title: 'Guidelines for bonus and commission plans',
            },
          },
        },
      },
    },
    required: [
      'ita_work_equipment_provided',
      'employee_travel_required',
      'non_solicitation_customers',
      'non_solicitation_employees',
      'non_interference_apply',
      'non_compete_clause_apply',
      'annual_gross_salary',
      'available_pto',
      'available_pto_type',
      'work_hours_per_week',
      'schedule_type',
      'probation_length_recommended',
      'job_title_check_enabled',
      'primary_point_of_contact',
      'role_description',
      'professional_qualifications',
      'experience_level',
      'contract_duration_type',
      'equity_compensation',
      'has_bonus',
      'has_commissions',
      'has_signing_bonus',
      'work_from_home_allowance_ack',
    ],
    type: 'object',
    'x-jsf-logic': {
      allOf: [
        {
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
              schedule_type: {
                const: 'fixed_hours',
                default: 'fixed_hours',
                'x-jsf-presentation': {
                  inputType: 'hidden',
                },
              },
            },
          },
        },
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
              schedule_type: {
                oneOf: [
                  {
                    const: 'flexible',
                    suffix: 'Can work any time or day',
                    title: 'Flexible',
                  },
                  {
                    const: 'core_business_hours',
                    suffix: 'Must be present at specific times',
                    title: 'Flexible within core hours',
                  },
                  {
                    const: 'fixed_hours',
                    suffix: 'Must work a set daily schedule',
                    title: 'Fixed',
                  },
                ],
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'fixed_hours',
              },
            },
            required: ['schedule_type'],
          },
          then: {
            properties: {
              daily_schedule: {
                properties: {
                  schedule: {
                    title: 'Fixed work hours',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'core_business_hours',
              },
            },
            required: ['schedule_type'],
          },
          then: {
            properties: {
              daily_schedule: {
                properties: {
                  schedule: {
                    title: 'Core working hours',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'fixed_hours',
              },
              work_schedule: {
                const: 'part_time',
              },
            },
            required: ['schedule_type', 'work_schedule'],
          },
          then: {
            properties: {
              work_hours_per_week: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_work_hours',
                  default: 'computed_work_hours',
                  description: '',
                },
                'x-jsf-logic-validations': ['fixed_part_time_within_bounds'],
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'fixed_hours',
              },
              work_schedule: {
                const: 'full_time',
              },
            },
            required: ['schedule_type', 'work_schedule'],
          },
          then: {
            properties: {
              work_hours_per_week: {
                'x-jsf-logic-computedAttrs': {
                  const: 'computed_work_hours',
                  default: 'computed_work_hours',
                  description: '',
                },
                'x-jsf-logic-validations': ['fixed_full_time_within_bounds'],
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'core_business_hours',
              },
              work_schedule: {
                const: 'part_time',
              },
            },
            required: ['schedule_type', 'work_schedule'],
          },
          then: {
            properties: {
              work_hours_per_week: {
                maximum: 39,
                'x-jsf-logic-computedAttrs': {
                  minimum: 'minimum_core_hours_part_time',
                  'x-jsf-errorMessage': {
                    maximum:
                      'The employee core business hours cannot exceed 39 hours',
                    minimum:
                      'The employee must work at least {{minimum_core_hours_part_time}} core business hours',
                  },
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              schedule_type: {
                const: 'core_business_hours',
              },
              work_schedule: {
                const: 'full_time',
              },
            },
            required: ['schedule_type', 'work_schedule'],
          },
          then: {
            properties: {
              work_hours_per_week: {
                const: 40,
                default: 40,
                maximum: 40,
                'x-jsf-logic-computedAttrs': {
                  minimum: 'minimum_core_hours_full_time',
                  'x-jsf-errorMessage': {
                    maximum:
                      'The employee core business hours cannot exceed 40 hours',
                    minimum:
                      'The employee must work at least {{minimum_core_hours_full_time}} core business hours',
                  },
                },
                'x-jsf-presentation': {
                  statement: {
                    title: 'Total of <b>40 hours</b> per week.',
                  },
                },
              },
            },
          },
        },
      ],
      computedValues: {
        computed_non_compete_clause_compensation_amount: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'non_compete_clause_compensation_percentage',
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
                                var: 'non_compete_clause_compensation_percentage',
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
                                    var: 'non_compete_clause_compensation_percentage',
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
                    var: 'non_compete_clause_compensation_percentage',
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
                            var: 'non_compete_clause_compensation_percentage',
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
                                var: 'non_compete_clause_compensation_percentage',
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
        computed_work_hours: {
          rule: {
            compute_work_hours: [
              {
                var: 'daily_schedule.selected_days',
              },
              {
                var: 'daily_schedule.schedule',
              },
              true,
            ],
          },
        },
        maximum_probation: {
          rule: {
            if: [
              {
                and: [
                  {
                    '==': [
                      {
                        var: 'contract_duration_type',
                      },
                      'fixed_term',
                    ],
                  },
                  {
                    var: 'contract_end_date',
                  },
                ],
              },
              {
                if: [
                  {
                    '<': [
                      {
                        date_difference_in_days: [
                          {
                            var: 'contract_end_date',
                          },
                          '2026-07-30',
                        ],
                      },
                      15,
                    ],
                  },
                  1,
                  {
                    max: [
                      {
                        if: [
                          {
                            '<': [
                              {
                                var: 'contract_end_date',
                              },
                              {
                                date_add_months: ['2026-07-30', 6],
                              },
                            ],
                          },
                          {
                            min: [
                              {
                                '+': [
                                  {
                                    '/': [
                                      {
                                        '-': [
                                          {
                                            date_difference_in_days: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-07-30',
                                            ],
                                          },
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                        ],
                                      },
                                      15,
                                    ],
                                  },
                                  {
                                    if: [
                                      {
                                        '==': [
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                          0,
                                        ],
                                      },
                                      0,
                                      1,
                                    ],
                                  },
                                ],
                              },
                              11,
                            ],
                          },
                          {
                            '<': [
                              {
                                var: 'contract_end_date',
                              },
                              {
                                date_add_months: ['2026-07-30', 12],
                              },
                            ],
                          },
                          {
                            min: [
                              {
                                '+': [
                                  {
                                    '/': [
                                      {
                                        '-': [
                                          {
                                            date_difference_in_days: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-07-30',
                                            ],
                                          },
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                        ],
                                      },
                                      15,
                                    ],
                                  },
                                  {
                                    if: [
                                      {
                                        '==': [
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                          0,
                                        ],
                                      },
                                      0,
                                      1,
                                    ],
                                  },
                                ],
                              },
                              13,
                            ],
                          },
                          true,
                          {
                            min: [
                              {
                                '+': [
                                  {
                                    '/': [
                                      {
                                        '-': [
                                          {
                                            date_difference_in_days: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-07-30',
                                            ],
                                          },
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                        ],
                                      },
                                      15,
                                    ],
                                  },
                                  {
                                    if: [
                                      {
                                        '==': [
                                          {
                                            '%': [
                                              {
                                                date_difference_in_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-07-30',
                                                ],
                                              },
                                              15,
                                            ],
                                          },
                                          0,
                                        ],
                                      },
                                      0,
                                      1,
                                    ],
                                  },
                                ],
                              },
                              30,
                            ],
                          },
                        ],
                      },
                      2,
                    ],
                  },
                ],
              },
              {
                and: [
                  {
                    '==': [
                      {
                        var: 'contract_duration_type',
                      },
                      'indefinite',
                    ],
                  },
                  {
                    '==': [
                      {
                        var: 'professional_area',
                      },
                      'A',
                    ],
                  },
                ],
              },
              6,
              {
                and: [
                  {
                    '==': [
                      {
                        var: 'contract_duration_type',
                      },
                      'indefinite',
                    ],
                  },
                  {
                    '==': [
                      {
                        var: 'professional_area',
                      },
                      'B',
                    ],
                  },
                ],
              },
              50,
              true,
              30,
            ],
          },
        },
        maximum_probation_pluralized: {
          rule: {
            if: [
              {
                var: 'probation_length_unit',
              },
              {
                cat: [
                  {
                    var: 'probation_length_maximum',
                  },
                  ' ',
                  {
                    if: [
                      {
                        '==': [
                          {
                            var: 'probation_length_unit',
                          },
                          'months',
                        ],
                      },
                      {
                        if: [
                          {
                            '==': [
                              {
                                var: 'probation_length_maximum',
                              },
                              1,
                            ],
                          },
                          'month',
                          'months',
                        ],
                      },
                      {
                        '==': [
                          {
                            var: 'probation_length_unit',
                          },
                          'days',
                        ],
                      },
                      {
                        if: [
                          {
                            '==': [
                              {
                                var: 'probation_length_maximum',
                              },
                              1,
                            ],
                          },
                          'day',
                          'days',
                        ],
                      },
                      {
                        '==': [
                          {
                            var: 'probation_length_unit',
                          },
                          'working_days',
                        ],
                      },
                      {
                        if: [
                          {
                            '==': [
                              {
                                var: 'probation_length_maximum',
                              },
                              1,
                            ],
                          },
                          'working day',
                          'working days',
                        ],
                      },
                    ],
                  },
                ],
              },
              null,
            ],
          },
        },
        minimum_annual_gross_salary: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'experience_level',
                  },
                  {
                    var: 'work_hours_per_week',
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
                            if: [
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'quadro',
                                ],
                              },
                              300375,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_1',
                                ],
                              },
                              252293,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_2',
                                ],
                              },
                              225164,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_3',
                                ],
                              },
                              199915,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_4',
                                ],
                              },
                              179839,
                            ],
                          },
                          14,
                          {
                            if: [
                              {
                                '===': [
                                  {
                                    var: 'work_schedule',
                                  },
                                  'part_time',
                                ],
                              },
                              {
                                '/': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  40,
                                ],
                              },
                              1,
                            ],
                          },
                        ],
                      },
                      {
                        '%': [
                          {
                            '*': [
                              {
                                if: [
                                  {
                                    '===': [
                                      {
                                        var: 'experience_level',
                                      },
                                      'quadro',
                                    ],
                                  },
                                  300375,
                                  {
                                    '===': [
                                      {
                                        var: 'experience_level',
                                      },
                                      'level_1',
                                    ],
                                  },
                                  252293,
                                  {
                                    '===': [
                                      {
                                        var: 'experience_level',
                                      },
                                      'level_2',
                                    ],
                                  },
                                  225164,
                                  {
                                    '===': [
                                      {
                                        var: 'experience_level',
                                      },
                                      'level_3',
                                    ],
                                  },
                                  199915,
                                  {
                                    '===': [
                                      {
                                        var: 'experience_level',
                                      },
                                      'level_4',
                                    ],
                                  },
                                  179839,
                                ],
                              },
                              14,
                              {
                                if: [
                                  {
                                    '===': [
                                      {
                                        var: 'work_schedule',
                                      },
                                      'part_time',
                                    ],
                                  },
                                  {
                                    '/': [
                                      {
                                        var: 'work_hours_per_week',
                                      },
                                      40,
                                    ],
                                  },
                                  1,
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
              0,
            ],
          },
        },
        minimum_annual_gross_salary_in_cents: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'experience_level',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '-': [
                  {
                    '*': [
                      {
                        if: [
                          {
                            '===': [
                              {
                                var: 'experience_level',
                              },
                              'quadro',
                            ],
                          },
                          300375,
                          {
                            '===': [
                              {
                                var: 'experience_level',
                              },
                              'level_1',
                            ],
                          },
                          252293,
                          {
                            '===': [
                              {
                                var: 'experience_level',
                              },
                              'level_2',
                            ],
                          },
                          225164,
                          {
                            '===': [
                              {
                                var: 'experience_level',
                              },
                              'level_3',
                            ],
                          },
                          199915,
                          {
                            '===': [
                              {
                                var: 'experience_level',
                              },
                              'level_4',
                            ],
                          },
                          179839,
                        ],
                      },
                      14,
                      {
                        if: [
                          {
                            '===': [
                              {
                                var: 'work_schedule',
                              },
                              'part_time',
                            ],
                          },
                          {
                            '/': [
                              {
                                var: 'work_hours_per_week',
                              },
                              40,
                            ],
                          },
                          1,
                        ],
                      },
                    ],
                  },
                  {
                    '%': [
                      {
                        '*': [
                          {
                            if: [
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'quadro',
                                ],
                              },
                              300375,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_1',
                                ],
                              },
                              252293,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_2',
                                ],
                              },
                              225164,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_3',
                                ],
                              },
                              199915,
                              {
                                '===': [
                                  {
                                    var: 'experience_level',
                                  },
                                  'level_4',
                                ],
                              },
                              179839,
                            ],
                          },
                          14,
                          {
                            if: [
                              {
                                '===': [
                                  {
                                    var: 'work_schedule',
                                  },
                                  'part_time',
                                ],
                              },
                              {
                                '/': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  40,
                                ],
                              },
                              1,
                            ],
                          },
                        ],
                      },
                      1,
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
        minimum_core_hours_full_time: {
          rule: 40,
        },
        minimum_core_hours_part_time: {
          rule: {
            max: [
              {
                compute_work_hours: [
                  {
                    var: 'daily_schedule.selected_days',
                  },
                  {
                    var: 'daily_schedule.schedule',
                  },
                  true,
                ],
              },
              18,
            ],
          },
        },
        minimum_probation: {
          rule: {
            if: [
              {
                and: [
                  {
                    '==': [
                      {
                        var: 'contract_duration_type',
                      },
                      'fixed_term',
                    ],
                  },
                  {
                    var: 'contract_end_date',
                  },
                ],
              },
              {
                if: [
                  {
                    '<': [
                      {
                        date_difference_in_days: [
                          {
                            var: 'contract_end_date',
                          },
                          '2026-07-30',
                        ],
                      },
                      15,
                    ],
                  },
                  1,
                  2,
                ],
              },
              0,
            ],
          },
        },
        minimum_pto_computed: {
          rule: {
            if: [
              {
                '<': [
                  {
                    if: [
                      {
                        '===': [
                          {
                            var: 'work_schedule',
                          },
                          'part_time',
                        ],
                      },
                      {
                        reduce: [
                          {
                            var: 'daily_schedule.selected_days',
                          },
                          {
                            '+': [
                              1,
                              {
                                var: 'accumulator',
                              },
                            ],
                          },
                          0,
                        ],
                      },
                      5,
                    ],
                  },
                  5,
                ],
              },
              {
                '-': [
                  {
                    '/': [
                      {
                        '*': [
                          22,
                          {
                            var: 'work_hours_per_week',
                          },
                        ],
                      },
                      40,
                    ],
                  },
                  {
                    '%': [
                      {
                        '/': [
                          {
                            '*': [
                              22,
                              {
                                var: 'work_hours_per_week',
                              },
                            ],
                          },
                          40,
                        ],
                      },
                      1,
                    ],
                  },
                ],
              },
              22,
            ],
          },
        },
        probation_fixed: {
          rule: {
            if: [
              {
                '==': [
                  {
                    var: 'probation_length_minimum',
                  },
                  {
                    var: 'probation_length_maximum',
                  },
                ],
              },
              'yes',
              'no',
            ],
          },
        },
      },
      validations: {
        fixed_full_time_within_bounds: {
          errorMessage:
            'The fixed work hours must be within 40 and 40 work hours per week',
          rule: {
            and: [
              {
                '>=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  40,
                ],
              },
              {
                '<=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  40,
                ],
              },
            ],
          },
        },
        fixed_part_time_within_bounds: {
          errorMessage:
            'The fixed work hours must be within 18 and 39 work hours per week',
          rule: {
            and: [
              {
                '>=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  18,
                ],
              },
              {
                '<=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  39,
                ],
              },
            ],
          },
        },
        ita_work_equipment_provided_must_include_computer_and_keyboard: {
          errorMessage: 'Computer and Keyboard must be provided.',
          rule: {
            and: [
              {
                in: [
                  'computer',
                  {
                    var: 'ita_work_equipment_provided',
                  },
                ],
              },
              {
                in: [
                  'keyboard',
                  {
                    var: 'ita_work_equipment_provided',
                  },
                ],
              },
            ],
          },
        },
      },
    },
    'x-jsf-order': [
      'contract_duration_type',
      'work_schedule',
      'schedule_type',
      'daily_schedule',
      'available_pto',
      'employee_travel_required',
      'ita_work_equipment_provided',
      'work_hours_per_week',
      'experience_level',
      'professional_qualifications',
      'probation_length_recommended',
      'probation_length_unit',
      'probation_length',
      'probation_length_days',
      'probation_length_working_days',
      'probation_length_minimum',
      'probation_length_maximum',
      'probation_length_fixed',
      'available_pto_type',
      'role_description',
      'role_is_onsite',
      'role_requires_license',
      'employer_acknowledges_risk',
      'job_title_check_enabled',
      'additional_job_title_eligibility_check_slug',
      'additional_job_title_eligibility_check_result',
      'job_category',
      'professional_area',
      'primary_point_of_contact',
      'primary_point_of_contact_email',
      'annual_gross_salary',
      'annual_bonus_ack',
      'part_time_salary_confirmation',
      'work_from_home_allowance_ack',
      'has_signing_bonus',
      'signing_bonus_amount',
      'has_bonus',
      'bonus_amount',
      'bonus_details',
      'has_commissions',
      'commissions_details',
      'commissions_ack',
      'equity_compensation',
      'non_compete_clause_apply',
      'non_compete_clause_halt_period_months',
      'non_compete_clause_compensation_amount',
      'non_compete_clause_compensation_percentage',
      'non_solicitation_employees',
      'non_solicitation_employees_number_of_months',
      'non_solicitation_customers',
      'non_solicitation_customer_number_of_months',
      'non_interference_apply',
      'non_interference_halt_period',
    ],
    'x-rmt-flatFieldsets': {
      additional_job_title_eligibility_check: {
        propertiesByName: [
          'professional_qualifications',
          'additional_job_title_eligibility_check_slug',
          'additional_job_title_eligibility_check_result',
          'job_title_check_enabled',
          'role_description',
          'role_is_onsite',
          'role_requires_license',
          'employer_acknowledges_risk',
          'primary_point_of_contact',
          'primary_point_of_contact_email',
        ],
        title: 'Role/position',
      },
      annual_gross_salary_fieldset: {
        propertiesByName: [
          'annual_gross_salary',
          'annual_bonus_ack',
          'part_time_salary_confirmation',
        ],
        title: 'Annual gross salary',
      },
      employee_schedule_fieldset: {
        propertiesByName: [
          'schedule_type',
          'daily_schedule',
          'work_hours_per_week',
        ],
        title: 'Employee schedule',
      },
      non_compete_fieldset: {
        propertiesByName: [
          'non_compete_clause_apply',
          'non_compete_clause_halt_period_months',
          'non_compete_clause_compensation_percentage',
          'non_compete_clause_compensation_amount',
        ],
        title: 'Non-compete',
      },
      non_interference: {
        propertiesByName: [
          'non_interference_apply',
          'non_interference_halt_period',
        ],
        title: 'Non-interference',
      },
      non_solicitation: {
        description:
          'In Italy, post-termination restrictions are governed by local Italian law. These clauses help protect your business relationships while ensuring compliance with employment regulations.',
        propertiesByName: [
          'non_solicitation_employees',
          'non_solicitation_employees_number_of_months',
          'non_solicitation_customers',
          'non_solicitation_customer_number_of_months',
        ],
        title: 'Non-solicitation',
      },
      work_location_mobility_fieldset: {
        description:
          '<strong>Telework agreement required</strong><br/>The employee will need to sign a Telework Agreement confirming their home address as their primary workplace, as part of the requirements for setting up a compliant remote work arrangement.',
        propertiesByName: ['employee_travel_required'],
        title: 'Work location & mobility',
      },
    },
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

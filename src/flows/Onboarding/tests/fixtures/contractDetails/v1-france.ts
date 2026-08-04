export const contractDetailsSchemaV1France = {
  data: {
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
            non_compete_compensation_salary_percentage: {
              type: 'number',
            },
          },
          required: [
            'non_compete_clause_apply',
            'annual_gross_salary',
            'non_compete_compensation_salary_percentage',
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
                      '{{computed_non_compete_clause_compensation_amount}} EUR non-compete compensation amount',
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
                    'Remote AI has flagged this role as risky to hire in France',
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
              role_requires_license: false,
              non_compete_clause_apply: false,
              probation_length_recommended: false,
              contract_end_date: false,
              business_allowance_ack: false,
              work_hours_per_week: false,
              non_compete_restricted_activities: false,
              work_experience: false,
              has_commissions: false,
              employer_acknowledges_risk: false,
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
              role_is_onsite: false,
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
              'role_requires_license',
              'role_is_onsite',
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
            role_requires_license: false,
            non_compete_clause_apply: false,
            probation_length_recommended: false,
            contract_end_date: false,
            business_allowance_ack: false,
            work_hours_per_week: false,
            non_compete_restricted_activities: false,
            work_experience: false,
            has_commissions: false,
            employer_acknowledges_risk: false,
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
            role_is_onsite: false,
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
          "A probation period allows for more flexible termination, especially for performance-related issues. Below are our recommendations, aligned with the wage portage collective agreement. Termination during probation requires notice based on the employee's tenure.",
        oneOf: [
          {
            const: 'recommended',
            title: '4 months',
            'x-jsf-logic-computedAttrs': {
              description: '{{recommended_probation_description}}',
              title: '{{recommended_probation_label}}',
            },
            'x-jsf-presentation': {
              meta: {
                helpCenter: {
                  callToAction: 'Learn more about renewals',
                  content:
                    '<p>This article explains how probation period renewals work for employees hired on a <strong>indefinite-term CDI (</strong><em><strong>contrat à durée indéterminée</strong></em><strong>) </strong>contract under the French wage portage CBA, including renewal rules and important timelines. </p><p>Extension of probation period is <strong>not possible</strong> for fixed term contracts CDD (Contrat à durée déterminée). </p><h3 id="h_01KJD36KFGRX1D1NT14JVDJNBS">Overview of probation periods in France</h3><p>Probation periods in France apply to employees hired on indefinite-term CDI (<em>contrat à durée indéterminée</em>) contracts through Remote\'s EOR service. These periods allow both the employer and employee to assess whether the role is a good fit before the contract becomes fully confirmed.</p><p>The length of the initial probation period depends on the employee\'s role and is outlined in their employment agreement.</p><h3 id="h_01KJD36KFHZVAVX11D7BJTRK3J">Renewing a probation period</h3><p>Probation periods in France for indefinite-term CDI (<em>contrat à durée indéterminée</em>) contracts can be renewed once, for a duration similar to the initial probation period.</p><p><strong>Example:</strong> If the initial probation period is four months, it can be extended for an additional four months, resulting in a total of eight months.</p><p><strong>Important:</strong> Extension is not automatic. Remote must follow a strict legal process for the extension to be valid. </p><p><strong>See also:</strong></p><ul>\n<li data-list-item-id="e850efef07d29d72c970f0bb40dcd13cd"><a href="https://support.remote.com/hc/en-us/articles/6754165371789-How-to-request-a-probation-confirmation-letter" target="_self" rel="undefined">How to request a probation confirmation letter</a></li>\n<li data-list-item-id="ee522733786a118c8380e611620247d33"><a style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;" href="https://support.remote.com/hc/en-us/articles/6743692226189-How-to-request-a-probation-extension">How to request a probation extension</a></li>\n</ul><h3 id="h_01KJD36KFK30AWXZGSPYVYKAPH">Important timelines and deadlines</h3><p>If you want to extend an employee\'s probation period, you must notify Remote <strong>at least one month before the end date of the initial probation period</strong>.</p><p>To request an extension, <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support">reach out to Remote.</a></p><p>Remote needs advance notice to complete the required legal steps for the extension to be effective.</p><h3 id="h_01KJD36KFNZAZK4ST4X14372VT">What happens if no extension is requested</h3><p>The probation period is <strong>automatically validated</strong> unless you or the employee notify Remote of your intent to extend or terminate before the end date.</p><p>Once the probation period ends without notification, the employee\'s contract is fully confirmed and standard termination rules apply.</p><p><strong>See also:</strong></p><ul>\n<li data-list-item-id="ed20c935f093dff9930092283b45c3bba"><a href="https://remote.zendesk.com/knowledge/editor/01KJD2VV40JM62SNY8E0HX9R8Q/en-us?brand_id=360004990531" tabindex="0" data-token-index="0" rel="noopener noreferrer">How do probation periods work in France for wage portage employees?</a></li>\n<li data-list-item-id="e776155f88e682b763228a90be62dd139"><a href="https://remote.zendesk.com/knowledge/editor/01KJD33J65S0XXKFQ4MH4YDJ0E/en-us?brand_id=360004990531" tabindex="0" data-token-index="0" rel="noopener noreferrer">How do I terminate an employee during their probation period in France (wage portage)?</a></li>\n</ul><p><span class="wysiwyg-font-size-small"><em><span class="notion-enable-hover" data-token-index="0"><strong>Disclaimer:</strong> Please be advised that the information provided is for general guidance only and should not be considered legal or taxation advice. The Employee Handbook and supporting onboarding guidance provided is not a binding employment contract. Customers and Employees are strongly encouraged to contact the Remote team for expert guidance and assistance in navigating the intricate landscape of employee documentation requirements in need. Consulting with our team is imperative to ensure compliance with local employment standards legislation and is vital in making informed decisions whilst adhering to all relevant regulations. All responsibilities related to workplace policies, including but not limited to diversity and inclusion, background checks, equal opportunity employment and disciplinary actions, rest with the Customer. It is the Customers responsibility to ensure that their policies and practices comply with all applicable laws and regulations. Company policies may be subject to change in the future. This Handbook is updated regularly. Remote does not approve printing or offline copies of this Handbook, as key information may become outdated, potentially leading to misinformed decisions or breaches of employment obligations. Always refer to the live Help Centre version for the most accurate guidance. </span></em></span></p>',
                  error: false,
                  id: 43837455998221,
                  title:
                    'How Do Probation Period Renewals Work for Wage Portage Employees on a indefinite-term CDI (Contrat à Durée Indéterminée) contract?',
                },
              },
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
          meta: {
            helpCenter: {
              callToAction:
                'Learn more about probation periods and terminations during probation',
              content:
                '<p>Probation periods in France under wage portage contracts allow both the employer and the employee to assess the working relationship during the initial employment period. This article explains how probation periods work for indefinite and fixed-term wage portage contracts in France.</p><h2 id="h_01KJD2SRMFP9EK08F1TGV36PD8">Indefinite contracts (CDI)</h2><p>For indefinite-term wage portage contracts in France, probation periods vary based on the employee\'s classification:</p><ul>\n<li data-list-item-id="e8c06d4c5b886bc956c88d14151aea62d">\n<strong>Employees and technicians (non-cadres):</strong> Up to 3 months, renewable once for an additional 3 months</li>\n<li data-list-item-id="e18ea33feb094626c5af1a54657fd89d9">\n<strong>Managers/High responsibility individual contributors (cadres):</strong> Up to 4 months, renewable once for an additional 4 months</li>\n</ul><p>The standard probation period for cadres employees under wage portage is 4 months.</p><p>During the probation period, either party can terminate the contract with reduced notice requirements compared to a regular termination.</p><h2 id="h_01KJD2SRMJCCXSKVRTZYGB0PQM">Fixed-term contracts (CDD)</h2><p>For fixed-term wage portage contracts, the probation period depends on the contract duration:</p><ul>\n<li data-list-item-id="e241540272debc0156f97b8a923bfe0aa">\n<strong>Contracts up to 6 months:</strong> 1 day per week worked, capped at 2 weeks</li>\n<li data-list-item-id="e4beb26ae5a27188f64c8dc1fefa571f4">\n<strong>Contracts longer than 6 months:</strong> Capped at 1 month</li>\n</ul><p>The probation period for fixed-term contracts cannot be renewed.</p><p><strong>Example:</strong> If an employee has a 3-month fixed-term contract (approximately 12 weeks), the probation period would be 12 days, which is under the 2-week maximum.</p><p> </p><p>In the event that termination becomes necessary during the initial employment phase, probation periods make the process simpler and more flexible. Without a probation period:</p><ul>\n<li data-list-item-id="e49ef9a410312934cdf68b23905dc8b83">A reason to dismiss is required</li>\n<li data-list-item-id="ec52a2fad831fab9485307a8f85d93c94">Longer notice periods apply</li>\n<li data-list-item-id="eb2d0a0bc7c9290cc5a7beca7f7e3628b">There is a higher risk of employment disputes</li>\n</ul><p>A probation period simplifies termination if the working relationship is not suitable for either party.</p><h2 id="h_01KJD2SRMMJ8Z01KT0Y5R4YB24">Why Remote recommends including a probation period<a href="#h_01KJD2SRMMJ8Z01KT0Y5R4YB24"></a>\n</h2><p>Remote recommends selecting <strong>Yes</strong> when asked about including a probation period in your wage portage contract.</p><p>In the event that termination becomes necessary during the initial employment phase, probation periods make the process simpler and more flexible. Without a probation period:</p><ul>\n<li data-list-item-id="e428a95907b066f1e7dc5e4abac47e456">Higher risk of employment disputes</li>\n<li data-list-item-id="e5ac335e6ce9344cce37d0f6631a76281">More complex legal procedures</li>\n</ul><p>A probation period keeps the initial fit assessment flexible and simplifies termination if the working relationship is not suitable.</p><p><strong>Choosing "No" is allowed but discouraged in France (wage portage).</strong> Without a probation period, ending employment carries higher legal risks.</p><h2 id="h_01KY9YJTYYKY74MPHKJD88CWEW">How do I terminate an employee during their probation period in France (wage portage)?</h2><p>In France, terminating employment during the probation period requires specific notice based on how long the employee has worked. These rules apply to all employees, including those hired through wage portage arrangements.</p><p>All probation terminations must be confirmed in writing and submitted through Remote with appropriate advance notice.</p><h3 id="h_01KJD30912GA9X76D6AAJ4DKYR">Required notice periods</h3><p>The notice period depends on the employee\'s tenure:</p><ul>\n<li data-list-item-id="e4b7f094cd2f76fb80a37ff0eaaca8cc9">\n<strong>Less than 8 days of employment</strong>: 24 hours notice</li>\n<li data-list-item-id="e55317d04bea368b3d73e7f6906af614d">\n<strong>8 days to 1 month of employment</strong>: 48 hours notice</li>\n<li data-list-item-id="ec685ed856ab7fea0960da3cddb1dd2c8">\n<strong>1 to 3 months of employment</strong>: 2 weeks notice</li>\n<li data-list-item-id="e52e6d1cd450d907b6d153431c9876ca0">\n<strong>More than 3 months of employment</strong>: 1 month notice</li>\n</ul><p>You must give notice at least 1 day before the end of the probation period.</p><h3 id="h_01KJD30915N4CTX46XRJP85VTF">How to submit a probation termination</h3><p><strong>Step 1:</strong> Submit the termination request through Remote at least 1 day before the start of the applicable notice period.</p><p><strong>Step 2:</strong> Ensure you provide the required notice period based on the employee\'s tenure (see table above).</p><p><strong>Step 3:</strong> Prepare written confirmation of the termination. All probation terminations must be documented in writing.</p><p><strong>Step 4:</strong> Remote will process the termination and handle the required administrative steps.</p><p>If you wish to terminate the employee during the probation period but have notified Remote too late to comply with the applicable notice period, we can still proceed subject to paying an indemnity equivalent to the notice period the employee was deprived of.</p><h3 id="h_01KJD309166QE63ZJ094NV657W">Special circumstances</h3><p><strong>Exceptions to standard notice periods</strong></p><p>Standard notice requirements do not apply in cases of:</p><ul>\n<li data-list-item-id="e33cd63e1342d19408af67e4028cf7a14">Gross misconduct</li>\n<li data-list-item-id="e86a84caa899fcc89971cc6765fef8961">Mutual agreement between both parties</li>\n</ul><p>In these situations, different terms may apply. <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support">Contact Remote for guidance on your specific case.</a></p><h3 id="h_01KJD309199X22S8J6SFJTW7F1">Example scenario</h3><p>Alex has been employed through wage portage in France for 45 days and is still within their probation period. The company decides to terminate the employment.</p><p>Based on Alex\'s tenure (45 days falls into the "1 to 3 months" category), the company must provide 2 weeks notice. They submit the termination request through Remote on March 1st, providing notice that the employment will end on March 15th. This meets both the 2-week notice requirement and the 7-day advance submission requirement.</p><p><strong>See also:</strong></p><ul>\n<li data-list-item-id="eaa64ce5183d808aeee62707b9a9c74c0"><a href="https://support.remote.com/hc/en-us/articles/43462351138189-What-is-the-Wage-Portage-employment-in-France-and-how-does-it-work">What is the Wage Portage employment in France and how does it work?</a></li>\n<li data-list-item-id="ecec6d79bac46e41ff72f45a10a933a49"><a href="https://support.remote.com/hc/en-us/articles/43837455998221" target="_blank" rel="noopener noreferrer">How Do Probation Period Renewals Work for Wage Portage Employees on a indefinite-term CDI (Contrat à Durée Indéterminée) contract?</a></li>\n</ul><p><span class="wysiwyg-font-size-small"><em><span class="notion-enable-hover" data-token-index="0"><strong>Disclaimer:</strong> Please be advised that the information provided is for general guidance only and should not be considered legal or taxation advice. The Employee Handbook and supporting onboarding guidance provided is not a binding employment contract. Customers and Employees are strongly encouraged to contact the Remote team for expert guidance and assistance in navigating the intricate landscape of employee documentation requirements in need. Consulting with our team is imperative to ensure compliance with local employment standards legislation and is vital in making informed decisions whilst adhering to all relevant regulations. All responsibilities related to workplace policies, including but not limited to diversity and inclusion, background checks, equal opportunity employment and disciplinary actions, rest with the Customer. It is the Customers responsibility to ensure that their policies and practices comply with all applicable laws and regulations. Company policies may be subject to change in the future. This Handbook is updated regularly. Remote does not approve printing or offline copies of this Handbook, as key information may become outdated, potentially leading to misinformed decisions or breaches of employment obligations. Always refer to the live Help Centre version for the most accurate guidance. </span></em></span></p>',
              error: false,
              id: 43837197759501,
              title:
                'How do probation periods work in France for wage portage employees?',
            },
          },
          statement: {
            description:
              'You’re able to terminate a team member’s employment during their probation period, but you’ll need to give the appropriate amount of notice according to their tenure.\n<details data-component="Accordion"><summary>Learn more</summary>Required notice periods:\n<ul>\n<li>24 hours notice if they’ve been employed for less than 8 days.</li>\n<li>48 hours notice if they’ve been employed for 8-30 days.</li>\n<li>2 weeks notice if they’ve been employed for 1 to 3 months.</li>\n<li>1 month notice if they’ve been employed for more than 3 months.</li>\n</ul>\n<p>You must give notice at least 1 day before the end of their probation period, and submit the termination request at least 7 days before. If you’re termination a fixed-term employment agreement (CDD), the employee may be entitled to 1 month’s salary.</p>\n<p>These rules apply unless in the case of gross misconduct or mutual agreement. All probation terminations must be confirmed in writing.</p></details>',
            severity: 'info',
            title: 'Information on termination - probation',
          },
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
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about mandatory allowances',
              content:
                '<p>This article explains the mandatory allowances and reserves that apply to employees hired under the French wage portage framework through Remote\'s Employer of Record (EOR) service.</p><h2 id="h_01KJD3K5PENTQNRDTCW1HXCE0N">Who this applies to</h2><p>This information applies to employees hired in 🇫🇷 France under the wage portage (<em>portage salarial</em>) model through Remote\'s EOR service. Different allowances and reserves apply depending on whether the employee is on an indefinite-term (CDI) or fixed-term (CDD) employment agreement.</p><h2 id="h_01KJD3K5PETEVGSYDTNJP88XYT">The 5% mandatory contribution allowance</h2><p>Under the French wage portage collective bargaining agreement, a mandatory 5% allowance is added to the employee\'s gross pay each month.</p><h3 id="h_01KJD3K5PFT0HMJB8VWNSKVD71">What it covers</h3><p>This allowance compensates for specific obligations and contributions unique to the wage portage model. It is calculated automatically as 5% of the employee\'s total monthly gross salary.</p><h3 id="h_01KJD3K5PF05AXVZA88RTZGN21">Key details</h3><ul>\n<li data-list-item-id="efeda0a017f3a43694d472d891272cfa4">The allowance is fixed and required by the CBA</li>\n<li data-list-item-id="e542221722a88e8f42ade43858d178d66">It is paid on top of the gross salary amount</li>\n<li data-list-item-id="edbde1c35c1fe50cc43a730a7b5b4c083">It cannot be changed, reduced, or removed</li>\n<li data-list-item-id="e493744dfaf4b861d3519c75ff476fd19">Remote calculates and applies this automatically</li>\n</ul><h3 id="h_01KJD3K5PHS9S2TYBEC5T87JAD">Example</h3><p>If an employee\'s monthly gross salary is 3,000 EUR, the 5% contribution allowance would be 150 EUR. The employee receives 3,150 EUR in total gross pay before taxes and other deductions.</p><h2 id="h_01KJD3K5PHPS6ZE6NKXMMEBQDN">The 10% financial reserve (CDI contracts only)</h2><p>Employees hired under an indefinite-term (CDI) employment agreement are subject to a mandatory 10% financial reserve.</p><h3 id="h_01KJD3K5PJXWA8KH1ED3TFSV36">What it is</h3><p>This reserve is a financial buffer required by the French wage portage collective bargaining agreement. It ensures income continuity when an assignment with a client ends and the employee enters an intermission period while seeking a new mission.</p><h3 id="h_01KJD3K5PJM92MCEJH37D1KKZA">How it works</h3><p><strong>Step 1: During active assignments</strong></p><p>Remote retains 10% of the employee\'s monthly base salary and adds it to a reserve fund.</p><p><strong>Step 2: Between assignments (intermission)</strong></p><p>When a client assignment finishes, the employee remains employed by Remote under their CDI agreement. During this intermission period while the employee seeks a new mission, Remote can use the reserve to pay the employee for up to three months.</p><p><strong>Step 3: When employment ends</strong></p><p>Any unused portion of the reserve is paid out to the employee when the employment agreement terminates.</p><h3 id="h_01KJD3K5PK8P0E0TNMC8EE3GYW">Key details</h3><ul>\n<li data-list-item-id="ebb6e13718cc0acefd290504b9703f66b">This reserve is mandatory and cannot be waived or adjusted</li>\n<li data-list-item-id="ecafc9a4ec2cc201a4dd5ade936c1b256">It only applies to indefinite-term (CDI) wage portage employees</li>\n<li data-list-item-id="ee37856c4144848f0ab2d37854e03c880">It is separate from other statutory allowances</li>\n</ul><h3 id="h_01KJD3K5PNC073GZW2RNAVMCSF">Example</h3><p>An employee on a CDI contract earns a base salary of 4,000 EUR per month. Remote retains 400 EUR (10%) each month and adds it to the reserve. After six months of active assignments, the reserve contains 2,400 EUR. When the client assignment ends, the employee can receive payments from this reserve for up to three months while searching for a new mission.</p><h2 id="h_01KJD3K5PN1A1VTVD2Y9HP7Z7R">The 10% end-of-contract indemnity (CDD contracts only)</h2><p>Employees hired under a fixed-term (CDD) employment agreement are entitled to a mandatory 10% end-of-contract indemnity (<em>prime de précarité</em>).</p><h3 id="h_01KJD3K5PPJMKA8DGN5SM74WQT">What it is</h3><p>This indemnity compensates for the temporary nature of the fixed-term contract. It is required under French labour law and the wage portage collective bargaining agreement.</p><h3 id="h_01KJD3K5PPT635642HDYFA46T6">How it works</h3><p>Remote calculates the indemnity as 10% of the total gross remuneration earned during the entire contract period. This amount is paid in full with the employee\'s final payslip when the contract ends.</p><h3 id="h_01KJD3K5PPD92S7PXNRG0WN5AD">Key details</h3><ul>\n<li data-list-item-id="e51bb8e3aed91d6838056395429f79d29">The indemnity is paid by Remote as the employer</li>\n<li data-list-item-id="e9ae8fcbd353c696ee49d72ddaa449162">It is paid at the end of the contract, in addition to all gross salary and allowances earned during the contract</li>\n<li data-list-item-id="e6b8f285789f8441fb496d21db690da8a">It is separate from other statutory allowances such as paid leave or the 5% contribution allowance</li>\n</ul><h3 id="h_01KJD3K5PQ4RZP39AM2SK742XG">Example</h3><p>An employee works on a CDD contract for three months with a monthly gross salary of 3,000 EUR. The total gross remuneration for the contract period is 9,000 EUR. At the end of the contract, Remote pays the employee a 10% indemnity of 900 EUR with the final payslip.</p><p><strong>See also:</strong></p><ul>\n<li data-list-item-id="e0ac8e7d3ad86379855f9d8703c40f2e7"><a href="https://support.remote.com/hc/en-us/articles/43462351138189-What-is-the-Wage-Portage-employment-in-France-and-how-does-it-work">What is the Wage Portage employment in France and how does it work?</a></li>\n<li data-list-item-id="e1080565425d06fda2cbad5eba3ab0d79"><a href="https://remote.zendesk.com/knowledge/editor/new/en-us?brand_id=360004990531" tabindex="0" data-token-index="0" rel="noopener noreferrer">Wage portage contract durations in France?</a></li>\n</ul>',
              error: false,
              id: 43837622285709,
              title: 'Wage Portage France Mandatory Allowances',
            },
          },
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
          'Please define the specific professional activities the employee is prohibited from engaging in after leaving the company, not just a general "no competition" clause.',
        maxLength: 5000,
        minLength: 20,
        title: 'Restricted activities',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<p>This article explains what restricted activities are in a non-compete clause in France and how to define them clearly in an employment agreement.</p><h3 id="h_01KJD3YEB26HQ1DTCQTMC65TXK">What are restricted activities in a non-compete clause?</h3><p>Restricted activities define the specific professional actions that an employee cannot engage in after leaving the company. These restrictions must be clearly stated in the employment agreement and directly relate to the work the employee performed during their employment.</p><p>A non-compete clause is not just about preventing competition in general. It must specify exactly what the employee cannot do, not simply state that they cannot compete.</p><h3 id="h_01KJD3YEB363DXPSSHWH005NFF">How to define restricted activities</h3><p>When drafting a non-compete clause in France, restricted activities must be:</p><ul>\n<li data-list-item-id="edfe354f0e93a92c778a86637f6e9d6ba">\n<strong>Specific</strong>: Clearly describe the actions the employee is prohibited from doing</li>\n<li data-list-item-id="ea602d5bb465c5e1cd33f21285d2641cc">\n<strong>Related to their role</strong>: Connect directly to the functions they performed</li>\n<li data-list-item-id="ed9a5d6752204518078ec904afa204ec1">\n<strong>Limited in scope</strong>: Focus on the confidential information, clients, or expertise they had access to</li>\n</ul><p>The restrictions should answer these questions:</p><ol>\n<li data-list-item-id="ec26ebd9e696c88200c8f8526b801a795">What specific services or activities are prohibited?</li>\n<li data-list-item-id="e418a0b03301c80f8d5d479b02377def4">Which clients or markets are protected?</li>\n<li data-list-item-id="edae752f44919e950b6412f24e8c874ac">What confidential information or expertise must be protected?</li>\n</ol><p><strong>Incorrect example</strong>: "Cannot engage in similar activities"</p><p>This is too vague and would not be enforceable.</p><p><strong>Correct example</strong>: "Cannot provide software development services for e-commerce platforms to retail clients"</p><p>This clearly defines what the employee cannot do and relates to their specific role.</p><h3 id="h_01KJD3YEB7YPAVAHDGN2ESFSQY">What makes a restriction legally valid</h3><p>For a non-compete clause to be enforceable in France, the restricted activities must:</p><ul>\n<li data-list-item-id="e9dd3c6aaf99c1c657e45d528e6449936">Be proportionate to the legitimate interests of the employer</li>\n<li data-list-item-id="ea1dd8266c01674304a64c5e2af204c11">Be limited in duration, geography, and scope</li>\n<li data-list-item-id="e3dfd25839f574a555cd965af70fd153a">Include financial compensation for the employee</li>\n<li data-list-item-id="e1eb08875540d025124e0d1c5663c2f95">Be necessary to protect the company\'s business interests</li>\n</ul><p>The activities you restrict must directly relate to:</p><ul>\n<li data-list-item-id="e4755c8e473b6519510ddb48e4a9e79d4">The specific functions the employee performed</li>\n<li data-list-item-id="e8555a9e055d02db138b8eb02e92a4606">The clients they had access to</li>\n<li data-list-item-id="efd8f9a64147e8bcf22955f1a49d762b8">The confidential information they handled</li>\n<li data-list-item-id="efcc1c381f95b7811e31709219e72e102">The expertise they developed while employed</li>\n</ul><h3 id="h_01KJD3YEB904V3ZAF0XXCVZA5V">Examples of well-defined restricted activities</h3><p><strong>Example 1: Sales role</strong></p><p>"The employee cannot contact, solicit, or provide services to any clients they worked with during the last 12 months of employment, for the purpose of selling software solutions in the healthcare sector."</p><p><strong>Example 2: Technical role</strong></p><p>"The employee cannot develop, design, or consult on artificial intelligence solutions for financial technology companies, using the proprietary algorithms or methodologies they worked with during their employment."</p><p><strong>Example 3: Management role</strong></p><p>"The employee cannot recruit, hire, or solicit any team members from the marketing department to work for a competing digital advertising agency."</p><p>See also: <a href="https://remote.zendesk.com/knowledge/editor/01KJD3TG030VG2PCVH1H5HB69S/en-us?brand_id=360004990531" tabindex="0" data-token-index="0" rel="noopener noreferrer">Non-compete under wage portage (portage salarial)</a></p>',
              error: false,
              id: 43837822723981,
              title:
                'How do non-compete restricted activities work in France wage portage?',
            },
          },
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
      has_wage_portage_higher_degree: {
        description: "(e.g. BTS, DUT, Licence, Master's degree, or equivalent)",
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
              content:
                '<h3 id="h_01J0M6K7HK8T2HKK15Y263AP1D">Gross Pay Formulas </h3><ul>\n<li data-list-item-id="e935c9f03892acd39638a10ce24d029b8">\n<strong>Hourly</strong> = Employee\'s Hourly Rate x Hour Worked </li>\n<li data-list-item-id="eba539294216cb2982e65a2371c7481cf">\n<strong>Salary</strong> = Annual Salary / Number of Pay Periods </li>\n<li data-list-item-id="edd4703e52ceac70cf8bb1e02176ba420">\n<strong>Net Pay</strong> = Gross Pay - Deductions</li>\n</ul><p> </p><h3 id="h_01J0M6JY1PK5A6RSQTPH73M1W7">Salaried Employees’ gross salary</h3><p><strong>Gross pay</strong> equals their annual salary divided by the number of pay periods in a year.</p><p><em>Note</em>: This is a simplified summary of pay periods.</p><figure class="wysiwyg-table wysiwyg-table-align-left" style="width: 100%;"><table style="border-collapse: collapse; border-style: solid; border-width: 1px;">\n<thead><tr>\n<th style="border-style: solid; border-width: 1px; text-align: center; width: 50%;">Pay Schedule</th>\n<th style="border-style: solid; border-width: 1px; text-align: center; width: 50%;">Pay Periods</th>\n</tr></thead>\n<tbody>\n<tr>\n<td style="border-style: solid; border-width: 1px; width: 50%;">Weekly</td>\n<td style="border-style: solid; border-width: 1px; width: 50%;">52</td>\n</tr>\n<tr>\n<td style="border-style: solid; border-width: 1px; width: 50%;">Semi-monthly</td>\n<td style="border-style: solid; border-width: 1px; width: 50%;">24</td>\n</tr>\n<tr>\n<td style="border-style: solid; border-width: 1px; width: 50%;">Monthly</td>\n<td style="border-style: solid; border-width: 1px; width: 50%;">12</td>\n</tr>\n</tbody>\n</table></figure><p> </p><p>Pay periods and the options available will be country-specific and vary further.</p><p>i.e. Some countries such as Italy 🇮🇹, Austria 🇦🇹 Portugal 🇵🇹, Brazil 🇧🇷, and Spain 🇪🇸 etc have 13th and 14th-month salary payments.</p><p><em>Example</em>:</p><p>Employees make $60,000/ year and are paid monthly (12 installments).</p><p>Their gross pay will be:</p><p>60000 / 12 = $5,000.</p><p>Employees make $48,000/year and are paid semi-monthly (24 installments).</p><p>Their gross pay will be:</p><p>48000 / 24 = $2,000.</p><p> </p><h3 id="h_01J0M6K21EMM9ANAS8M4DQXRHQ">Hourly Employees</h3><p>Multiply the hourly rate of the employee by the hours worked during a pay period.</p><p>An employee works 40 hours a week with an hourly rate of $14.</p><p>Their gross pay will be 40 hours x 14 = $560.</p>',
              error: false,
              id: 27657390602637,
              title: 'How is gross pay calculated?',
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
              content:
                '<p>Wage portage (<em>portage salarial</em>) is an employment arrangement in France that allows independent professionals to work through a portage company in order to maintain the benefits and protections of an employment contract. This article explains how wage portage works, including contract types, mission durations, and key rules.</p><h3 id="h_01KJD2FJSXPEPXTMTFWVKXYCV6">What is wage portage?</h3><p>Under France\'s wage portage rules, the employee performs work through time-boxed <strong>missions</strong> for a client. These missions sit under either a <strong>fixed-term (CDD)</strong> or <strong>indefinite-term (CDI)</strong> employment contract with the wage portage company.</p><p>The wage portage company (for example, Remote) acts as the legal employer, while the employee works for the client company.</p><h3 id="h_01KJD2FJSY0MYVXVVK9PB1M5VC">Types of employment contracts</h3><p>There are two types of employment contracts under wage portage:</p><ul>\n<li data-list-item-id="e1cda5782492686276c65a5c9591bfb13">\n<strong>Fixed-term contract (CDD)</strong>: A contract with a specific end date</li>\n<li data-list-item-id="e1a1f2d9134420e65c6bc5f86660c3525">\n<strong>Indefinite-term contract (CDI)</strong>: A contract with no fixed end date</li>\n</ul><p>Both contract types are subject to mission duration limits with the same client.</p><h3 id="h_01KJD2FJSZ4MD92AKF4VRVN488">Mission duration limits</h3><h4 id="h_01KJD2FJT0VZS9YF9WR26ETM2R">Fixed-term (CDD) missions</h4><p>A CDD mission with the same client may not exceed <strong>18 months</strong>, including renewals.</p><p>The fixed-term contract can be terminated before the 18-month term, but only under strictly limited legal conditions defined by French labor law.</p><h4 id="h_01KJD2FJT0W2D6A73V3EKB2QD7">Indefinite-term (CDI) missions</h4><p>A CDI mission with the same client may not exceed <strong>36 months</strong>.</p><p>The 36-month period refers to the maximum duration of a mission with the same client, not the employment contract itself. The indefinite-term contract can be terminated before the end of the mission, but only under strictly limited legal conditions defined by French labor law.</p><h3 id="h_01KJD2FJT18ZYD4ES9EFMTDWMK">Options after reaching the maximum mission duration</h3><p>When an employee reaches the maximum mission duration with a client, there are two main options:</p><h4 id="h_01KJD2FJT1MW1WEEAKY3D4D2A3">1. New mission for the same client</h4><p>If the employee starts a genuinely different mission for the same client, the new mission can have its own duration limit (18 months for CDD or 36 months for CDI).</p><p><strong>Example</strong>: The employee works 18 months as a software developer for Client A, then begins a new, genuinely different mission as a project manager for the same Client A. This would be considered a new mission.</p><p>The missions must be genuinely distinct in:</p><ul>\n<li data-list-item-id="e1391038e2c077923d107c4f8eb19a18e">Scope and objectives</li>\n<li data-list-item-id="e70a423251cd532d5a341c9d04b595c59">Deliverables</li>\n<li data-list-item-id="ed36c4acec90c3fe39316de03784a850a">Nature of work performed</li>\n<li data-list-item-id="e3f2b2c6ae8d30c30be01bf889b4cd830">Skills required</li>\n</ul><h4 id="h_01KJD2FJT3GGQGF6VCKH66FM6Y">2. Contact our Help Team for further options</h4><p>If a new mission is not applicable and you are approaching the 18-month (CDD) or 36-month (CDI) limit, please <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support"><strong>reach out to our Support team</strong>.</a></p><p>We will work with you to review the specific circumstances of the engagement and discuss potential alternative pathways to ensure continued compliance with French labor regulations after the current mission ends.</p><h3 id="h_01KJD2FJT4YQHM7Y6AWHEPTKTA">Contract renewals for fixed-term contracts</h3><p>A fixed-term contract (CDD) can be renewed up to <strong>2 times</strong>. The total duration of the fixed-term contract, including renewals, cannot exceed <strong>18 months</strong>.</p><h3 id="h_01KJD2FJT4XF07DX8C6QY3089B">Related links</h3><ul><li data-list-item-id="ead6ad00d28ff393cfdaaacc59c571f95"><a href="https://support.remote.com/hc/en-us/articles/43462351138189-What-is-the-Wage-Portage-employment-in-France-and-how-does-it-work">What is the Wage Portage employment in France and how does it work?</a></li></ul>',
              error: false,
              id: 43837143193357,
              title: 'Wage portage contract durations in France?',
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
            title: 'Salarié porté premier niveau — First-Level Ported Employee',
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
              content:
                '<p>Under the <strong>French Portage Salarial Collective Agreement</strong>, employees are classified into four professional levels based on their <strong>experience and type of missions</strong>.</p><p>These classifications determine expectations, minimum salary thresholds, and access to certain allowances.</p><ol>\n<li data-list-item-id="e2c0ab98b88d70ebf49d7f2abd94842e4">\n<strong>Salarié porté premier niveau — First-Level Ported Employee</strong>: Entry-level professional performing straightforward services in accordance with the client\'s requests.<ul>\n<li data-list-item-id="e8321cb6ad9d2e2ac2a764f397aecbb35">Takes into account the client\'s constraints.</li>\n<li data-list-item-id="e12ba3b1c6bc8e205af8a30c22ed595b8">May not remain at this level for more than 24 months for the same type of mission.</li>\n</ul>\n</li>\n<li data-list-item-id="ee904f864e86880444b7b0f9a8805b3ca">\n<strong>Salarié porté junior — Junior Ported Employee</strong>: Professional with moderate experience who can assess the needs of their client company, propose improvements and participate in their implementation.<ul><li class="wysiwyg-list-bold" data-list-item-id="ef8491aa161308386fe1199c41bcc1acf"><strong>Takes initiatives and assumes the associated responsibilities.</strong></li></ul>\n</li>\n<li data-list-item-id="eebaef9022cb109cf07b390d0dd7087c9">\n<strong>Salarié porté senior — Senior Ported Employee</strong>: Experienced professional who performs complex services, which involve a significant level of initiative and responsibility.<ul><li data-list-item-id="e6a0da8914e35fab621d0f8e3a3040892">Demonstrates solid experience and expertise in the same professional domain.</li></ul>\n</li>\n<li data-list-item-id="e66f5050a914cb945d87c0038658e7119">\n<strong>Salarié porté expert — Expert Ported Employee</strong>: Highly skilled professional who performs particularly complex services, the management of which requires a very high level of initiative and responsibility.<ul><li data-list-item-id="e2d23eb9309ef06c8562ceeca795ff0fa">Possesses deep experience and expertise in the same professional domain.</li></ul>\n</li>\n</ol>',
              error: false,
              id: 41652078093965,
              title: 'Employee Seniority Levels (France – Portage Salarial)',
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
              content:
                '<div class="sc-8483994-0 sc-25e5b337-1 gagDAr dNpfwN">\n<header class="sc-8483994-0 sc-98ea0a46-0 cFaANn gAlQJD sc-704369bd-0 jOYBDY">\n<h2 class="sc-c090059b-0 lcffkV sc-704369bd-3 eWYhqz" id="01H7WSRV90B3R0X35RZ21B959A">Why do I need to define a role description?</h2>\n</header><span class="sc-c090059b-0 fISxvo">It will appear in the employment agreement. Be thorough and accurate, especially if your employee is applying for a visa.</span>\n</div>\n<div class="sc-8483994-0 sc-25e5b337-1 gagDAr dNpfwN"> </div>\n<h2 class="sc-8483994-0 gagDAr" id="01H7WSRV908B1DKFVDFKNTN2EZ"><span class="sc-c090059b-0 iaMkhB sc-25e5b337-3 jwgiWP">Tips for a better role description</span></h2>\n<ul>\n<li class="sc-8483994-0 gagDAr">Keep it short – up to 5 main responsibilities</li>\n<li class="sc-8483994-0 gagDAr"><span style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;">Include punctuation</span></li>\n<li class="sc-8483994-0 gagDAr">No need to mention your company, focus on the specific duties of the role</li>\n</ul>',
              error: false,
              id: 18019255579405,
              title: 'Role description',
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
          currency: 'EUR',
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
        description:
          'In France, non-compete pay must be at least 30% of monthly base salary throughout the post termination restrictions.',
        maximum: 100,
        minimum: 30,
        title: 'Non-compete salary percentage',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
          percentage: true,
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
          'The minimum expected duration of the mission. Missions can have a maximum duration of 36 months for employees. Employment Fees remain payable until the Employment Agreement is terminated, even if the minimum duration or service agreement ends earlier.',
        maximum: 36,
        minimum: 1,
        title: 'Mission duration (months)',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<p>Under France\'s wage portage rules, the employee performs work through time-boxed <strong>missions</strong> that sit under either a <strong>fixed-term (CDD)</strong> or <strong>indefinite-term (CDI)</strong> employment contract with the wage portage company.</p><h3 id="h_01KJD3BSQXJFG4W4W84G414E13">CDD mission duration limits</h3><p>A <strong>CDD mission</strong> with the same client may not exceed <strong>18 months</strong>, including renewals (2 maximum).</p><p><strong>Example:</strong> If an employee starts a CDD mission on January 1, 2026, the mission cannot extend beyond June 30, 2027, including renewals.</p><h3 id="h_01KJD3BSQYYHJKDBQK7X301H4A">CDI mission duration limits</h3><p>A <strong>CDI mission</strong> with the same client may not exceed <strong>36 months</strong>.</p><p><strong>Example:</strong> If an employee begins a CDI mission on March 1, 2026, the mission must end by February 28, 2029.</p><h3 id="h_01KJD3BSQZYV6CHEV39B90DC8Y">What happens when limits are exceeded</h3><p>If a mission with the same client exceeds the maximum duration:</p><ul>\n<li data-list-item-id="eaf4d1733bc44535f0568c708e858e600">The arrangement may no longer qualify under wage portage rules</li>\n<li data-list-item-id="e6d1ab66e2626855d81e64c3eeaf81ee7">The employee-client relationship may be requalified</li>\n<li data-list-item-id="eb2351009e0aa2b7dc13e8cfad644d41c">Legal and tax implications may arise</li>\n</ul><p>If you\'re approaching these limits or need to extend a mission, <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support">reach out to Remote</a> to discuss your options.</p><p><strong>See also:</strong> <a href="https://support.remote.com/hc/en-us/articles/43462351138189-What-is-the-Wage-Portage-employment-in-France-and-how-does-it-work">What is the Wage Portage employment in France and how does it work?</a></p>',
              error: false,
              id: 43837551686541,
              title: 'Mission Minimum Duration France Wage Portage',
            },
          },
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
                  'For fixed-term contracts up to 6 months, the probation period is 1 day per week worked, capped at a maximum of 14 days. This cannot be renewed.',
                  'For fixed-term contracts exceeding 6 months, the probation period is capped at 1 month. This cannot be renewed.',
                ],
              },
              'Can be renewed once. To request a renewal, contact help@remote.com at least 1 month before the initial probation period ends.',
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
      'role_is_onsite',
      'role_requires_license',
      'employer_acknowledges_risk',
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
      additional_job_title_eligibility_check: {
        propertiesByName: [
          'additional_job_title_eligibility_check_slug',
          'additional_job_title_eligibility_check_result',
          'job_title_check_enabled',
          'role_description',
          'role_is_onsite',
          'role_requires_license',
          'employer_acknowledges_risk',
        ],
        title: 'Role Requirements',
      },
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
          "<strong>No exclusivity or non-compete</strong> during employment<br/>Exclusivity and non-compete clauses are not permitted during the contract. Any post-termination non-compete must be agreed directly with the employee outside of Remote's Employment Agreement and handled entirely by your company.",
        meta: {
          helpCenter: {
            callToAction: 'Learn more',
            content:
              '<p>This article explains the rules and limitations for including non-compete clauses in employment agreements in France under the wage portage (<em>portage salarial</em>) model.</p><h3 id="h_01KJD3RGDNK72B9VNSEWY5J9TD">What is a non-compete clause?</h3><p>A non-compete clause is a contractual provision that restricts an employee from working for a competitor or starting a competing business. This clause protects the company\'s business interests by limiting the employee\'s ability to use confidential information or relationships gained during employment.</p><h3 id="h_01KJD3RGDN4YK5J7R087RBK5X3">Can a non-compete clause be included during the employment period?</h3><p><strong>No.</strong> French law requires that the wage portage employee remains free to work with multiple clients. For this reason, no exclusivity or non-compete clause can be included in the employment agreement while the contract is active.</p><h3 id="h_01KJD3RGDPA41VYAA1QVPAHYEG">When can a post-termination non-compete clause be enforced?</h3><p>A post-termination non-compete clause may only be enforced after the employment contract ends, and only if it meets strict French legal requirements:</p><ul>\n<li data-list-item-id="e9c3bbe7ebc5655374fd8017eb6bea09d">\n<strong>Legitimate business interest</strong>: The clause must protect a genuine business need</li>\n<li data-list-item-id="e4d20af5a30640b59c0c2afe3a4faea3b">\n<strong>Limited duration</strong>: Generally no more than 12 months</li>\n<li data-list-item-id="eb9da0de69e2c7afbb48658a59372470f">\n<strong>Geographic limitation</strong>: Must specify a reasonable geographic area</li>\n<li data-list-item-id="e426de47e3b29f8f536c458375fbe3165">\n<strong>Scope limitation</strong>: Must clearly define the type of activities restricted</li>\n<li data-list-item-id="eab0118060dd0fab2ad05355c36af6e88">\n<strong>Financial compensation</strong>: The employee must be compensated during the restricted period</li>\n</ul><h3 id="h_01KJD3RGDSNVR38R3HDYAT2T7W">What compensation is required for a non-compete clause?</h3><p>The employer is responsible for compensating the employee for any loss of income resulting from the non-compete restriction. This compensation must be:</p><ul>\n<li data-list-item-id="ea4e3fa4f85218a6f8a4eaf9de9474d72">\n<strong>At least 35% of the employee\'s monthly base salary</strong> before termination</li>\n<li data-list-item-id="e5571ec179c1356c661bb4e426ccfa543">Paid for the <strong>full duration</strong> of the non-compete period</li>\n<li data-list-item-id="eae53181b97958c952a915f8792ab961a">Calculated based on the employee\'s salary at the time of termination</li>\n</ul><p><strong>Example</strong>: If an employee earns 3,000 EUR per month and has a 12-month non-compete period, the employer must pay at least 1,050 EUR per month (35% of 3,000 EUR) for 12 months, totaling 12,600 EUR.</p><h3 id="h_01KJD3RGDVSYSXGHYRM0Z0F690">What are the financial obligations for the client?</h3><p>Remote requires an <strong>upfront financial reserve</strong> equal to the total compensation payable to the employee over the entire non-compete period. This reserve will be <strong>automatically recalculated</strong> if the employee\'s salary increases in the future. Onboarding for the employee will begin only once the reserve has been paid.</p><h3 id="h_01KJD3RGDV3SMR1SKZ55SSPZJY">What penalties apply if the employee breaches the non-compete?</h3><p>Under French law, the breach penalty (also called liquidated damages) must be proportionate to the compensation paid for the non-compete. A safe and common practice is to set the penalty at an amount less than or equal to the total non-compete compensation amount.</p><p><strong>Recommended amount</strong>: 3 to 6 months of the employee\'s gross salary, or equal to the total non-compete compensation paid.</p><p><strong>Example</strong>: If the total non-compete compensation is 12,600 EUR over 12 months, the breach penalty could be set between 9,000 EUR (3 months of salary) and 18,000 EUR (6 months of salary), or equal to the total compensation of 12,600 EUR.</p><p><strong>Legal note</strong>: A court may reduce or increase the penalty if it is found to be manifestly excessive or insufficient. The client will bear all costs incurred by Remote in exercising this right. Remote will remit any damages obtained to the client as soon as possible.</p><p>For more information about employment contracts in France, <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support">reach out to Remote support.</a></p>',
            error: false,
            id: 43837716053005,
            title: 'Non-compete under wage portage (portage salarial)',
          },
        },
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
        meta: {
          helpCenter: {
            callToAction: 'Learn more about professional qualifications',
            content:
              '<h2 id="h_01KJD2237CCQ95YYTG4EQRT1DZ">Why are qualifications required?</h2><p>Under Article L1254-2 of the French Labor Code, a wage portage employee (salarié porté) must have the expertise, qualification, and autonomy to find their own missions and negotiate their own contracts.</p><p>Providing qualifications is essential for:</p><ul>\n<li data-list-item-id="ed3e9d33139c6fd4eb38c8112e639d018">\n<strong>Legal Compliance</strong>: Ensuring the individual is eligible for wage portage status.</li>\n<li data-list-item-id="e18830361933b1ff4f9deda371e919f1e">\n<strong>Salary Classification</strong>: Determining their professional grade (Junior, Senior, or Expert) and the corresponding minimum legal salary.</li>\n</ul><h2 id="h_01KJD1TCSZ95HC800B0T4N21PQ">What are the minimum requirements?</h2><p>To qualify for wage portage, the individual must meet one of the following criteria:</p><ul>\n<li data-list-item-id="e47d5e76dc2279099e9e4551bb32a15bb">\n<strong>A Diploma of Level 5 (Bac+2) or higher</strong>: This includes qualifications such as a BTS, DUT, or any University or Master\'s degree related to their field of work</li>\n<li data-list-item-id="eb64d19b6a43033f1bb442b9d0d1f3beb">\n<strong>Significant Professional Experience</strong>: If the individual does not have a Bac+2 degree in the specific field, they must have at least 3 years of experience in that sector</li>\n</ul><h2 id="h_01KJD1TCT2T1011Z0NAWT2AYK7">How to complete the qualification form</h2><p>When completing the qualification form, you need to provide the following information:</p><h3 id="h_01KJD1TCT2S9GMR03GMJCBR4K2">Professional Qualification(s)</h3><p>Select the individual\'s highest relevant diploma or certification. If their expertise is based solely on experience, select the "Experience-based" option (if available) or their highest general diploma.</p><p><strong>Example</strong>: Master\'s Degree in Computer Science, MBA, or Bachelor degree in Marketing</p><h3 id="h_01KJD1TCT3R9WS45XHGK0BHQCM">Relevant Experience</h3><p>Briefly summarize the individual\'s career path. Demonstrate that they have the seniority required to work autonomously. Mention the total years of experience and key roles held.</p><p><strong>Example</strong>: "8 years of experience in digital marketing, including 3 years as a Head of Growth for a SaaS company."</p><h3 id="h_01KJD1TCT4GWSDHCZY1873XG6T">Relevant Field of Work</h3><p>Identify the specific industry or functional area where the individual provides services. Wage portage is generally limited to "intellectual services" such as consulting, IT, HR, and marketing.</p><p><strong>Note</strong>: Personal services (childcare, cleaning) and regulated professions (lawyers, doctors) are generally excluded from this status. (Link to the article on regulated professions)</p><h3 id="h_01KJD1TCT5F4N7AR55M4V9A642">Required Key Skills</h3><p>List the technical and soft skills necessary to perform the missions the individual plans to undertake. This helps validate that their profile matches the services they are billing to clients.</p><p><strong>Example</strong>: Python, Data Analysis, Stakeholder Management, Strategic Consulting</p><h2 id="h_01KJD1TCT6Y1W1VESFZ2RFT1MR">Need help?</h2><p>If you need support or have questions about wage portage qualifications, <a href="https://support.remote.com/hc/en-us/articles/13279781622669-How-do-I-contact-Remote-for-support">please reach out to us.</a></p>',
            error: false,
            id: 43836880214285,
            title: 'Understanding Professional Qualifications in Wage Portage',
          },
        },
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
};

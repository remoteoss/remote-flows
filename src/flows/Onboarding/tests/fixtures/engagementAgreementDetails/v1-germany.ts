export const engagementAgreementDetailsDefaultResponseGermany = {
  data: {
    details: {
      work_hours_per_week: null,
      available_pto: null,
      pension_scheme: null,
      working_days: null,
      has_business_presence: 'yes',
      has_cba: 'no',
      cba: null,
      has_similar_roles: 'yes',
      similar_roles: null,
      has_similar_work_conditions: null,
      similar_work_conditions_details: null,
      has_illness_remuneration: null,
      illness_remuneration_details: null,
      min_annual_gross_salary: null,
      max_annual_gross_salary: null,
      has_signing_bonus: null,
      has_bonus: null,
      has_commissions: null,
      has_allowances: null,
      allowances_details: null,
      has_business_expenses: null,
      business_expenses: null,
      has_pension_scheme: null,
      break_time_per_day: null,
      has_overtime_compensation: null,
      overtime_compensation_begins: null,
      overtime_compensation_type: null,
      overtime_pay_percentage: null,
      has_covenants: null,
      covenants: null,
    },
    slug: '7758b87d-fc56-466d-85fd-90a775f1cffc',
  },
};

export const engagementAgreementDetailsSchemaV1Germany = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
        {
          else: {
            properties: {
              has_cba: false,
            },
          },
          if: {
            properties: {
              has_business_presence: {
                const: 'yes',
              },
            },
            required: ['has_business_presence'],
          },
          then: {
            required: ['has_cba'],
          },
        },
        {
          else: {
            properties: {
              cba: false,
              cba_document: false,
            },
          },
          if: {
            properties: {
              has_cba: {
                const: 'yes',
              },
            },
            required: ['has_cba'],
          },
          then: {
            required: ['cba', 'cba_document'],
          },
        },
        {
          else: {
            properties: {
              similar_work_conditions_details: false,
            },
          },
          if: {
            properties: {
              has_similar_work_conditions: {
                const: 'yes',
              },
            },
            required: ['has_similar_work_conditions'],
          },
          then: {
            required: ['similar_work_conditions_details'],
          },
        },
        {
          else: {
            properties: {
              illness_remuneration_details: false,
            },
          },
          if: {
            properties: {
              has_illness_remuneration: {
                const: 'yes',
              },
            },
            required: ['has_illness_remuneration'],
          },
          then: {
            required: ['illness_remuneration_details'],
          },
        },
        {
          else: {
            properties: {
              allowances_details: false,
            },
          },
          if: {
            properties: {
              has_allowances: {
                const: 'yes',
              },
            },
            required: ['has_allowances'],
          },
          then: {
            required: ['allowances_details'],
          },
        },
        {
          else: {
            properties: {
              business_expenses: false,
            },
          },
          if: {
            properties: {
              has_business_expenses: {
                const: 'yes',
              },
            },
            required: ['has_business_expenses'],
          },
          then: {
            required: ['business_expenses'],
          },
        },
        {
          else: {
            properties: {
              pension_scheme: false,
            },
          },
          if: {
            properties: {
              has_pension_scheme: {
                const: 'yes',
              },
            },
            required: ['has_pension_scheme'],
          },
          then: {
            required: ['pension_scheme'],
          },
        },
        {
          else: {
            properties: {
              overtime_compensation_begins: false,
              overtime_compensation_type: false,
            },
          },
          if: {
            properties: {
              has_overtime_compensation: {
                const: 'yes',
              },
            },
            required: ['has_overtime_compensation'],
          },
          then: {
            required: [
              'overtime_compensation_begins',
              'overtime_compensation_type',
            ],
          },
        },
        {
          else: {
            properties: {
              overtime_pay_percentage: false,
            },
          },
          if: {
            properties: {
              overtime_compensation_type: {
                const: 'extra_pay',
              },
            },
            required: ['overtime_compensation_type'],
          },
          then: {
            required: ['overtime_pay_percentage'],
          },
        },
        {
          else: {
            properties: {
              covenants: false,
            },
          },
          if: {
            properties: {
              has_covenants: {
                const: 'yes',
              },
            },
            required: ['has_covenants'],
          },
          then: {
            required: ['covenants'],
          },
        },
        {
          else: {
            properties: {
              available_pto: false,
              break_time_per_day: false,
              business_expenses: false,
              has_allowances: false,
              has_bonus: false,
              has_business_expenses: false,
              has_commissions: false,
              has_covenants: false,
              has_illness_remuneration: false,
              has_overtime_compensation: false,
              has_pension_scheme: false,
              has_signing_bonus: false,
              has_similar_work_conditions: false,
              illness_remuneration_details: false,
              max_annual_gross_salary: false,
              min_annual_gross_salary: false,
              overtime_compensation_begins: false,
              overtime_compensation_type: false,
              overtime_pay_percentage: false,
              similar_roles: false,
              similar_work_conditions_details: false,
              work_hours_per_week: false,
              working_days: false,
            },
          },
          if: {
            properties: {
              has_similar_roles: {
                const: 'yes',
              },
            },
            required: ['has_similar_roles'],
          },
          then: {
            required: [
              'similar_roles',
              'has_similar_work_conditions',
              'has_illness_remuneration',
              'min_annual_gross_salary',
              'max_annual_gross_salary',
              'has_signing_bonus',
              'has_bonus',
              'has_commissions',
              'has_allowances',
              'has_business_expenses',
              'has_pension_scheme',
              'work_hours_per_week',
              'working_days',
              'break_time_per_day',
              'available_pto',
              'has_overtime_compensation',
              'has_covenants',
            ],
          },
        },
      ],
      properties: {
        allowances_details: {
          description:
            'Let us know what each allowance covers and its monthly amount.',
          items: {
            anyOf: [
              {
                const: 'meal_allowance',
                title: 'Meal Allowance',
              },
              {
                const: 'transportation_commuter_allowance',
                title: 'Transportation / Commuter Allowance',
              },
              {
                const: 'car_allowance',
                title: 'Car Allowance',
              },
              {
                const: 'housing_allowance',
                title: 'Housing Allowance',
              },
              {
                const: 'phone_internet_allowance',
                title: 'Phone / Internet Allowance',
              },
              {
                const: 'remote_work_home_office_allowance',
                title: 'Remote Work / Home Office Allowance',
              },
              {
                const: 'childcare_allowance',
                title: 'Childcare Allowance',
              },
              {
                const: 'training_education_allowance',
                title: 'Training & Education Allowance',
              },
            ],
          },
          title: 'Select applicable allowances',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        available_pto: {
          minimum: 0,
          title:
            'How many vacation days do you provide for similar roles annually?',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        break_time_per_day: {
          description:
            'How much break time do team members in similar roles take during a standard workday?',
          minimum: 0,
          title: 'Break time (minutes per day)',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        business_expenses: {
          description:
            'Describe reimbursable expenses. E.g., travel costs, training budget.',
          maxLength: 1000,
          title:
            'What business expenses can team members in similar roles claim?',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        cba: {
          description:
            "Select the relevant collective bargaining agreement (CBA). <a href='https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Tarifverdienste-Tarifbindung/TDB/_TDB/_inhalt.html' target='_blank'>Collective bargaining database</a>",
          maxLength: 255,
          title: 'Collective bargaining agreement (CBA)',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        cba_document: {
          title: 'Upload collective bargaining agreement (CBA)',
          type: 'string',
          'x-jsf-presentation': {
            accept: '.pdf,.doc,.docx',
            disableSkippableCheck: true,
            inputType: 'file',
            maxFileSize: 20480,
          },
        },
        covenants: {
          items: {
            anyOf: [
              {
                const: 'confidentiality',
                description:
                  'Limits employees from sharing proprietary or sensitive company information.',
                title: 'Confidentiality',
              },
              {
                const: 'non_compete',
                description:
                  'Restricts employees from working for competitors during employment.',
                title: 'Non-compete',
              },
              {
                const: 'post_contractual_non_compete',
                description:
                  'Restricts employees from working for competitors after leaving the company.',
                title: 'Post-contractual non-compete',
              },
              {
                const: 'non_solicitation',
                description:
                  'Prevents employees from soliciting clients or colleagues after leaving the company.',
                title: 'Non-solicitation',
              },
            ],
          },
          title: 'Restrictive covenants present?',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'checkbox',
          },
        },
        has_allowances: {
          description: 'Do employees in similar roles receive allowances?',
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
          title: 'Allowances',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_bonus: {
          description:
            'Do employees in similar roles receive discretionary or performance bonuses?',
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
          title: 'Discretionary/performance bonus',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_business_expenses: {
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
            'Can the team members in similar roles claim business expenses?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_business_presence: {
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
          title: 'Do you currently have any business presence in Germany?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_cba: {
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
            'Are your German employees covered by any collective bargaining agreement (CBA)?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_commissions: {
          description: 'Do employees in similar roles receive commission?',
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
          title: 'Commission',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_covenants: {
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
            'Do you use confidentiality, non-compete, or non-solicitation clauses for team members in similar roles?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_illness_remuneration: {
          description:
            'Is there any compensation provided beyond the statutory sick pay?',
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
            'Do you offer additional pay during illness for employees in similar roles?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_overtime_compensation: {
          description:
            'Under German labor law, you may still be required to pay for overtime. Currently, only employees receiving more than 101,400 EUR (gross) fixed salary per year are exempt from overtime pay.',
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
          title: 'Do you compensate for overtime work in similar roles?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_pension_scheme: {
          description:
            'This question asks if comparable employees were given access to pension benefits, not if they chose to enroll in them.',
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
            'Were team members in similar roles offered to participate in a pension scheme?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_signing_bonus: {
          description: 'Do employees in similar roles receive a signing bonus?',
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
          title: 'Signing bonus',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_similar_roles: {
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
            'Do you currently have team members in similar roles to this hire?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        has_similar_work_conditions: {
          description: 'E.g. safety equipment provided, protective gear, etc.',
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
            'Any substantial working conditions for team members in similar roles?',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        illness_remuneration_details: {
          maxLength: 1000,
          title: 'Please describe the additional pay provided during illness',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        max_annual_gross_salary: {
          description:
            'The highest salary generally offered for comparable roles in Germany.',
          title: 'Maximum average salary',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            minimum: 'minimum_max_avg_annual_gross_salary_in_cents',
            'x-jsf-errorMessage': {
              minimum:
                'Must be {{minimum_max_avg_annual_gross_salary}} EUR or greater.',
            },
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        min_annual_gross_salary: {
          description:
            'The lowest salary generally offered for comparable roles in Germany. Salaries offered through Remote must meet or exceed this amount.',
          minimum: 1,
          title: 'Minimum average salary',
          type: 'integer',
          'x-jsf-logic-computedAttrs': {
            minimum: 'minimum_annual_gross_salary_in_cents',
            'x-jsf-errorMessage': {
              minimum:
                'Must be {{minimum_annual_gross_salary}} EUR or greater.',
            },
          },
          'x-jsf-presentation': {
            currency: 'EUR',
            inputType: 'money',
          },
        },
        overtime_compensation_begins: {
          minimum: 1,
          title: 'Overtime pay begins at (hours)',
          type: ['number', 'null'],
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        overtime_compensation_type: {
          oneOf: [
            {
              const: 'extra_pay',
              title: 'Extra pay percentage',
            },
            {
              const: 'time_off',
              title: 'Time off',
            },
          ],
          title: 'Compensation type',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        overtime_pay_percentage: {
          description:
            'The percentage of the regular salary that is paid for overtime work.',
          minimum: 0,
          title: 'What is the overtime percentage rate payment?',
          type: ['number', 'null'],
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        pension_scheme: {
          maxLength: 1000,
          title: 'Describe the details of the pension scheme',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        similar_roles: {
          description: 'Please add at least 1 comparable role.',
          maxLength: 1000,
          title: 'Describe the comparable roles',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
            meta: {
              helpCenter: {
                callToAction: 'Why do I need to do this?',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 43002165606541,
                title: 'Help center unavailable',
              },
            },
          },
        },
        similar_work_conditions_details: {
          maxLength: 1000,
          title: 'Please describe the working conditions',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'textarea',
          },
        },
        work_hours_per_week: {
          description:
            'Number of hours do team members typically worked in a full week',
          minimum: 1,
          title: 'Work hours per week',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        working_days: {
          default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          description: 'Select the workdays for team members in similar roles.',
          items: {
            anyOf: [
              {
                const: 'monday',
                title: 'Monday',
              },
              {
                const: 'tuesday',
                title: 'Tuesday',
              },
              {
                const: 'wednesday',
                title: 'Wednesday',
              },
              {
                const: 'thursday',
                title: 'Thursday',
              },
              {
                const: 'friday',
                title: 'Friday',
              },
              {
                const: 'saturday',
                title: 'Saturday',
              },
            ],
          },
          title: 'Select the work days',
          type: 'array',
          uniqueItems: true,
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
      },
      required: ['has_business_presence', 'has_similar_roles'],
      type: 'object',
      'x-jsf-fieldsets': {
        compensation: {
          description:
            'What’s the compensation for similar roles at your company? Tell us about the average salary, bonuses, allowances, and special payments (e.g. holiday payments).',
          propertiesByName: [
            'min_annual_gross_salary',
            'max_annual_gross_salary',
            'has_signing_bonus',
            'has_bonus',
            'has_commissions',
            'has_allowances',
            'allowances_details',
          ],
          title: 'Compensation package',
        },
        employment_terms: {
          propertiesByName: ['has_covenants', 'covenants'],
          title: 'Employment terms',
        },
        expenses: {
          propertiesByName: ['has_business_expenses', 'business_expenses'],
          title: 'Business expenses',
        },
        german_operations: {
          propertiesByName: [
            'has_business_presence',
            'has_cba',
            'cba',
            'cba_document',
          ],
          title: 'German operations',
        },
        pension: {
          propertiesByName: ['has_pension_scheme', 'pension_scheme'],
          title: 'Pension scheme details',
        },
        pto: {
          propertiesByName: [
            'available_pto',
            'has_overtime_compensation',
            'overtime_compensation_begins',
            'overtime_compensation_type',
            'overtime_pay_percentage',
          ],
          title: 'Paid time off',
        },
        team: {
          propertiesByName: [
            'has_similar_roles',
            'similar_roles',
            'has_illness_remuneration',
            'illness_remuneration_details',
          ],
          title: 'Team',
        },
        working_hours: {
          propertiesByName: [
            'work_hours_per_week',
            'working_days',
            'break_time_per_day',
          ],
          title: 'Working hours',
        },
      },
      'x-jsf-logic': {
        computedValues: {
          minimum_annual_gross_salary: {
            rule: {
              if: [
                {
                  var: 'work_hours_per_week',
                },
                {
                  '/': [
                    {
                      '-': [
                        {
                          '*': [
                            {
                              var: 'work_hours_per_week',
                            },
                            14.53,
                            52,
                            100,
                          ],
                        },
                        {
                          '%': [
                            {
                              '*': [
                                {
                                  var: 'work_hours_per_week',
                                },
                                14.53,
                                52,
                                100,
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
                  var: 'work_hours_per_week',
                },
                {
                  '/': [
                    {
                      '-': [
                        {
                          '*': [
                            {
                              var: 'work_hours_per_week',
                            },
                            1453,
                            52,
                            100,
                          ],
                        },
                        {
                          '%': [
                            {
                              '*': [
                                {
                                  var: 'work_hours_per_week',
                                },
                                1453,
                                52,
                                100,
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
          minimum_max_avg_annual_gross_salary: {
            rule: {
              '/': [
                {
                  var: 'min_annual_gross_salary',
                },
                100,
              ],
            },
          },
          minimum_max_avg_annual_gross_salary_in_cents: {
            rule: {
              var: 'min_annual_gross_salary',
            },
          },
        },
      },
      'x-jsf-order': [
        'has_business_presence',
        'has_cba',
        'cba',
        'cba_document',
        'has_similar_roles',
        'similar_roles',
        'has_illness_remuneration',
        'illness_remuneration_details',
        'work_hours_per_week',
        'working_days',
        'break_time_per_day',
        'min_annual_gross_salary',
        'max_annual_gross_salary',
        'has_signing_bonus',
        'has_bonus',
        'has_commissions',
        'has_allowances',
        'allowances_details',
        'has_business_expenses',
        'business_expenses',
        'has_pension_scheme',
        'pension_scheme',
        'available_pto',
        'has_overtime_compensation',
        'overtime_compensation_begins',
        'overtime_compensation_type',
        'overtime_pay_percentage',
        'has_covenants',
        'covenants',
        'has_similar_work_conditions',
        'similar_work_conditions_details',
      ],
      'x-rmt-meta': {
        jsfVersion: '1',
      },
    },
  },
};

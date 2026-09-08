// Real-world production Germany contract-details schema (jsfVersion 1),
// copied verbatim from src/germanyJsonSchemaDailySchedule.ts's .data.schema
// fixture. Kept in the example app so it does not ship in the published
// bundle. Used to iterate on the daily_schedule field (PAY-2868) before it
// currently renders as the generic nested-fieldset UI.
export const GERMANY_CONTRACT_DETAILS_SCHEMA = {
  name: 'Germany Contract Details Schema',
  description:
    'Real production Germany contract-details schema, including the daily_schedule fieldset',
  schema: {
    additionalProperties: false,
    allOf: [
      {
        else: {
          else: {
            properties: {
              notice_period: false,
            },
          },
          if: {
            properties: {
              notice_period_choice: {
                const: 'custom',
              },
            },
            required: ['notice_period_choice'],
          },
          then: {
            properties: {
              notice_period: {
                readOnly: false,
                'x-jsf-presentation': {
                  inputType: 'number',
                },
              },
            },
            required: ['notice_period'],
          },
        },
        if: {
          properties: {
            notice_period_choice: {
              const: 'recommended',
            },
          },
          required: ['notice_period_choice'],
        },
        then: {
          properties: {
            notice_period: {
              const: 1,
              default: 1,
              readOnly: true,
              'x-jsf-presentation': {
                inputType: 'hidden',
              },
            },
          },
          required: ['notice_period'],
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
              maximum: 30,
              minimum: 1,
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
              maximum: 48,
              minimum: 31,
            },
          },
        },
      },
      {
        else: {
          properties: {
            professional_licenses: false,
          },
        },
        if: {
          properties: {
            role_requires_license: {
              const: 'yes',
            },
          },
          required: ['role_requires_license'],
        },
        then: {
          required: ['professional_licenses'],
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
                    'Unfortunately based on the information entered, we cannot hire this role in Germany.',
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
                    "Remote AI isn't sure if we can hire this role in Germany",
                },
              },
            },
          },
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
                      '{{computed_non_compete_clause_compensation_amount}} EUR non-compete compensation amount',
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
            additional_pto: false,
          },
        },
        if: {
          properties: {
            additional_holiday_days: {
              const: 'yes',
            },
          },
          required: ['additional_holiday_days'],
        },
        then: {
          required: ['additional_pto'],
        },
      },
      {
        else: {
          properties: {
            additional_holiday_days: false,
          },
        },
        if: {
          properties: {
            available_pto_type: {
              const: 'fixed',
            },
          },
          required: ['available_pto_type'],
        },
        then: {
          required: ['additional_holiday_days'],
        },
      },
      {
        else: {
          properties: {
            probation_length: {
              description: '',
              'x-jsf-logic-computedAttrs': {
                const: 'maximum_probation',
                default: 'maximum_probation',
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
                'x-jsf-logic-computedAttrs': {
                  maximum: 'maximum_probation',
                },
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
            },
            required: ['probation_length'],
          },
          then: {
            properties: {
              probation_length: {
                'x-jsf-logic-computedAttrs': {
                  maximum: 'maximum_probation',
                },
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
          properties: {
            work_equipment: false,
          },
        },
        if: {
          properties: {
            work_equipment_provided: {
              const: 'yes',
            },
          },
          required: ['work_equipment_provided'],
        },
        then: {
          required: ['work_equipment'],
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
    ],
    properties: {
      role_requires_license: {
        description:
          'Some roles in Germany are regulated professions, meaning they can only be performed if the worker holds a required professional license from the appropriate authority.',
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
          'Prevents the employee from joining or starting a competing business. Not allowed during employment. Post-termination only, with limits and required compensation.',
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
      professional_licenses: {
        description:
          'If this role requires any specific licenses, please list them here so we can confirm whether Remote can legally and operationally support this position under AUG.',
        maxLength: 5000,
        minLength: 3,
        title: 'Employee required license(s)',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      probation_length_recommended: {
        description:
          'A probation period is a set time to assess a new employee. After probation, terminating an employee needs a formal reason and can be challenged. The recommended value is the longest probation allowed for a fixed-term contract of this length. <details data-component="Accordion"><summary>Important information about probation periods in Germany</summary><p>In Germany, post-probation terminations are very difficult and require a valid reason to not be disputed. As a lot of employees have legal insurance in Germany, disputing a termination has no risk for the employees. During the probationary period no reason is required ensuring more flexibility.</p></details>',
        oneOf: [
          {
            const: 'recommended',
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
        title: 'Probation period',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
        },
      },
      notice_period: {
        default: 1,
        description:
          'In Germany, the notice period can last between 1 and 3 months.',
        maximum: 3,
        minimum: 1,
        readOnly: true,
        title: 'Notice period in months',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      contract_end_date: {
        description:
          'Please note that fixed-term contracts are limited to 18 months.',
        format: 'date',
        maxLength: 255,
        title: 'Contract end date',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'date',
          maxDate: '2028-04-28',
          minDate: '2026-10-29',
        },
      },
      work_equipment: {
        description: 'List the equipment you will provide to the employee.',
        maxLength: 1000,
        title: 'Employee equipment list',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      work_hours_per_week: {
        description:
          'Please note that full-time employees are expected to work 31 or more hours per week, and part-time employees are defined as employees with any working time below the comparable full-time employee in the same company.',
        maximum: 48,
        minimum: 1,
        title: 'Work hours per week',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      salary_overview: {
        const: 'salary_overview',
        default: 'salary_overview',
        description:
          'We will request a reserve payment for salaries at or above €150,000.00.',
        oneOf: [
          {
            const: 'salary_overview',
            title: 'Salary overview',
          },
        ],
        title: 'Salary overview',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn about reserve payments',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 12695731865229,
              title: 'Help center unavailable',
            },
            ignoreValue: true,
          },
        },
      },
      non_compete_clause_compensation_percentage: {
        default: 50,
        description:
          "In Germany, non-compete pay must be 50% of monthly base salary throughout the post termination restrictions. A reserve is required to cover the mandatory payments. <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment-in-Employ-of-Record' target='_blank'>Learn about reserve payments</a>",
        readOnly: true,
        title: 'Non-compete salary percentage',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
          percentage: true,
          readOnly: true,
          value: 50,
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
      notice_period_choice: {
        description:
          "<a href='https://support.remote.com/hc/en-us/articles/5831900985613-Notice-Period-for-Terminations-by-Country' target='_blank'>Learn more about notice periods</a>",
        oneOf: [
          {
            const: 'recommended',
            title: '1 month',
            'x-jsf-presentation': {
              recommended: true,
            },
          },
          {
            const: 'custom',
            description:
              "We may request a reserve payment for custom notice periods. <br/> <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment' target='_blank'>Learn more about reserve payments</a>.",
            title: 'Choose your own length',
          },
        ],
        title: 'Notice period in months',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
        },
      },
      business_model: {
        deprecated: true,
        oneOf: [
          {
            const: null,
            title: 'N/A',
          },
          {
            const: 'aug',
            title: 'AUG',
          },
          {
            const: 'solutions',
            title: 'Solutions',
          },
        ],
        readOnly: true,
        title: '(Deprecated) Business model',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description:
              'This field no longer needs to be filled out since now we have separate entities for the separate business models.',
          },
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
      part_time_salary_confirmation: {
        const: 'acknowledged',
        description:
          "We'll include the salary in the employment agreement, so please double-check that it's correct.",
        title:
          'I confirm that this amount is the full annual salary for this part-time employee.',
        type: ['string', 'null'],
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
                equity_description: false,
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
            then: {
              properties: {
                equity_description: {
                  type: ['string'],
                },
              },
              required: ['equity_description'],
            },
          },
        ],
        properties: {
          equity_cliff: {
            deprecated: true,
            description:
              'When the first portion of the stock option grant will vest.',
            maximum: 100,
            minimum: 0,
            readOnly: true,
            title: 'Cliff (in months)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
              inputType: 'number',
            },
          },
          equity_description: {
            description:
              'Please share any information related to the upcoming equity grant.',
            maxLength: 1000,
            title: 'Number of options, RSUs, and other equity',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'textarea',
            },
          },
          equity_vesting_period: {
            deprecated: true,
            description:
              'The number of years it will take for the employee to vest all their options.',
            maximum: 100,
            minimum: 0,
            readOnly: true,
            title: 'Vesting period (in years)',
            type: ['number', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
              inputType: 'number',
            },
          },
          number_of_stock_options: {
            deprecated: true,
            description: "Tell us the type of equity you're granting as well.",
            maxLength: 255,
            readOnly: true,
            title: 'Number of options, RSUs, or other equity granted',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              deprecated: {
                description: 'Deprecated in favour of equity_description',
              },
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
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 38303424407821,
              title: 'Help center unavailable',
            },
          },
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
        title: 'Annual gross salary',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-logic-computedAttrs': {
          description: '{{annual_gross_salary_reserve_description}}',
          minimum: 'minimum_annual_gross_salary_in_cents',
          'x-jsf-errorMessage': {
            minimum: 'Must be {{minimum_annual_gross_salary}} EUR or greater.',
          },
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
        },
      },
      notice_period_statement: {
        const: null,
        default: null,
        description:
          "Notice periods are always equally applicable to employer and employee. German law prescribes statutory minimum notice periods, which increase with tenure. Employers are not permitted to offer less than these notice periods when employees have worked for them for the requisite time.<details data-component=\"Accordion\"><summary>More about notice periods</summary><p>Here are they based on the length of employment:</p><ul gap='none' size='sm'><li><strong>Tenure less than 2 years:</strong> 4 weeks to the 1st or 15th of each month.</li><li><strong>Tenure 2+ years:</strong> 1 calendar months to the end of a month.</li></ul></details>",
        title: 'Notice period information',
        type: 'null',
        'x-jsf-presentation': {
          inputType: 'text',
          meta: {
            ignoreValue: true,
          },
          statement: {
            title:
              'The statutory notice period for the <strong>employer is defined at termination</strong>',
          },
        },
      },
      contract_duration_type: {
        const: 'fixed_term',
        default: 'fixed_term',
        description:
          'In Germany, we currently support fixed-term contracts but not indefinite contracts.',
        oneOf: [
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
              callToAction: 'Learn about contract duration',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 4410443814157,
              title: 'Help center unavailable',
            },
          },
          statement: {
            title: '<strong>Fixed-term contract duration</strong> for Germany.',
          },
        },
      },
      available_pto: {
        description:
          "Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above. <details data-component=\"Accordion\"><summary>More about paid time off calculation</summary><p>If similar roles have a higher paid time off entitlement than the statutory minimum based on working days, the employee is entitled to that higher amount.</p><ul gap='none' size='sm'><li>6 working days -> 24 vacation days</li><li>5 working days -> 20 vacation days</li><li>4 working days -> 16 vacation days</li><li>3 working days -> 12 vacation days</li><li>2 working days -> 8 vacation days</li><li>1 working day -> 4 vacation days</li></ul></details>",
        title: 'Minimum paid time off days',
        type: 'number',
        'x-jsf-logic-computedAttrs': {
          const: 'minimum_days_computed',
          default: 'minimum_days_computed',
          statement: {
            title:
              '<strong>{{minimum_days_computed}} vacation days per year</strong>, automatically calculated to match similar roles.',
          },
        },
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      probation_length: {
        description:
          'In Germany, the maximum length of probation is based on the contract duration.<br />If you enter a value of ‘0’, the employee will not have a probation period.',
        minimum: 0,
        title: 'Probation period in months',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
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
          'General description of the services the employee will be providing for you. Please include a minimum of three tasks.',
        maxLength: 10000,
        minLength: 100,
        title: 'Project description and tasks',
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
      available_pto_type: {
        oneOf: [
          {
            const: 'unlimited',
            description:
              'Gives the employee an uncapped number of paid time off days per year. The number below is the mandatory minimum number of days they must take.',
            title: 'Unlimited paid time off',
          },
          {
            const: 'fixed',
            description:
              'The employee gets a set number of paid time off days per year based on similar roles and the work schedule. You can choose to offer additional days.',
            title: 'Fixed paid time off',
          },
        ],
        title: 'Paid time off policy',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'column',
          inputType: 'radio',
        },
      },
      schedule_type: {
        const: 'fixed_hours',
        default: 'fixed_hours',
        title: 'Employee work schedule',
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
      overtime_statement: {
        description:
          'Please note that under German labor law, you may still be legally required to pay for overtime. In 2026, only employees receiving more than EUR 101,400 (gross) as a fixed salary per year are exempted from overtime payments.',
        title: 'Overtime',
        type: 'null',
        'x-jsf-presentation': {
          inputType: 'hidden',
          meta: {
            ignoreValue: true,
          },
          statement: {
            description:
              'Please note that under German labor law, you may still be legally required to pay for overtime. In 2026, only employees receiving more than EUR 101,400 (gross) as a fixed salary per year are exempted from overtime payments.',
          },
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
      contract_duration: {
        deprecated: true,
        description:
          "We can support both open term and fixed-term contracts. Please state duration and if there's possibility for renewal. (Fixed-term agreement limit is 18 months).",
        maxLength: 255,
        readOnly: true,
        title: 'Contract duration (deprecated)',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description:
              "Deprecated field in favor of 'contract_duration_type'.",
          },
          inputType: 'text',
        },
      },
      additional_holiday_days: {
        description:
          'This can include things like self-care days or paid time off for birthdays.',
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
        title: 'Offer additional paid time off?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
        },
      },
      non_compete_clause_halt_period_months: {
        description:
          'Non-compete clauses in Germany can last between 1 and 24 months. The clause begins after the termination of the employment agreement.',
        maximum: 24,
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
                    saturday: false,
                  },
                },
              },
            },
            if: {
              properties: {
                selected_days: {
                  contains: {
                    pattern: 'saturday',
                  },
                },
              },
              required: ['selected_days'],
            },
            then: {
              properties: {
                schedule: {
                  required: ['saturday'],
                },
              },
            },
          },
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
              saturday: {
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
                title: 'Saturday',
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
              'saturday',
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
                {
                  label: 'Saturday',
                  value: 'saturday',
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
            country_name: 'Germany',
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
            work_days: [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
            ],
            work_hours_per_week: {
              baseline: {
                maximum: 48,
                minimum: 1,
              },
              full_time: {
                maximum: 48,
                minimum: 31,
              },
              part_time: {
                maximum: 30,
                minimum: 1,
              },
            },
          },
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
      work_address: {
        allOf: [
          {
            else: {
              properties: {
                address: false,
                address_line_2: false,
                city: false,
                postal_code: false,
                work_in_person_days_per_week: false,
              },
            },
            if: {
              properties: {
                is_home_address: {
                  const: 'no',
                },
              },
              required: ['is_home_address'],
            },
            then: {
              required: [
                'address',
                'city',
                'postal_code',
                'work_in_person_days_per_week',
              ],
            },
          },
        ],
        properties: {
          address: {
            description: 'Address number and street name.',
            maxLength: 255,
            title: 'Work address line 1',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          address_line_2: {
            description: 'Apartment number or building number if applicable.',
            maxLength: 255,
            title: 'Work address line 2',
            type: ['string', 'null'],
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          city: {
            maxLength: 255,
            title: 'City',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          is_home_address: {
            oneOf: [
              {
                const: 'yes',
                description:
                  'Select this option if the employee is fully remote.',
                title: "Same as the employee's residential address",
              },
              {
                const: 'no',
                description:
                  'Select this option if the employee is under a hybrid work regime.',
                title: "Different than the employee's residential address",
              },
            ],
            title: 'Local',
            type: 'string',
            'x-jsf-presentation': {
              direction: 'column',
              inputType: 'radio',
            },
          },
          postal_code: {
            maxLength: 255,
            title: 'Postal code',
            type: 'string',
            'x-jsf-presentation': {
              inputType: 'text',
            },
          },
          work_in_person_days_per_week: {
            description:
              'The number of days per week the employee will work from this location.',
            maximum: 6,
            minimum: 1,
            title: 'Number of days per week',
            type: 'number',
            'x-jsf-logic-validations': [
              'work_in_person_days_per_week_validation',
            ],
            'x-jsf-presentation': {
              inputType: 'number',
            },
          },
        },
        required: ['is_home_address'],
        title: 'Work Address',
        type: 'object',
        'x-jsf-order': [
          'is_home_address',
          'address',
          'address_line_2',
          'city',
          'postal_code',
          'work_in_person_days_per_week',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      work_address_is_home_address: {
        deprecated: true,
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
            description: 'N/A',
            title: 'N/A',
          },
        ],
        readOnly: true,
        title: '(Deprecated) Work address',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description: "Deprecated in favor of 'work_address'.",
          },
          direction: 'row',
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
      additional_job_title_eligibility_check_slug: {
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      required_qualifications: {
        oneOf: [
          {
            const: 'no_school_leaving_qualification',
            title: 'No school-leaving qualification',
          },
          {
            const: 'lower_secondary_school_certificate',
            title: 'Lower secondary school certificate',
          },
          {
            const: 'secondary_school_intermediate_certificate',
            title: 'Secondary school (intermediate certificate)',
          },
          {
            const:
              'entrance_qualification_for_universities_of_applied_sciences',
            title:
              'Entrance qualification for universities of applied sciences',
          },
          {
            const: 'general_university_entrance_qualification',
            title: 'General university entrance qualification',
          },
          {
            const: 'no_vocational_training',
            title: 'No vocational training',
          },
          {
            const: 'completed_vocational_training',
            title: 'Completed vocational training',
          },
          {
            const: 'master_craftsman_certified_technician',
            title: 'Master craftsman / Certified technician',
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
            const: 'diploma',
            title: 'Diploma (University/University of Applied Sciences)',
          },
          {
            const: 'state_examination',
            title: 'State examination',
          },
          {
            const: 'doctorate_phd',
            title: 'Doctorate / PhD',
          },
          {
            const: 'post_doctoral_qualification',
            title: 'Post-doctoral qualification',
          },
          {
            const: 'professional_certificates',
            title: 'Professional certificates (e.g., IT, healthcare)',
          },
          {
            const: 'further_education_training',
            title: 'Further education / training',
          },
        ],
        title: 'What are the employee required qualifications for this role?',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'select',
        },
      },
      work_equipment_provided: {
        description: 'E.g. laptop, mobile phone',
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
          'Will you provide the required equipment for the employee to perform their duties?',
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
      additional_pto: {
        description:
          'Enter the number of extra days on top of the mandatory minimum.',
        minimum: 1,
        title: 'Additional days',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      ancillary_positions_clause_apply: {
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
          'Do you want to prohibit the employee from holding ancillary positions during employment?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 42727997381133,
              title: 'Help center unavailable',
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
      'notice_period',
      'notice_period_choice',
      'work_address',
      'work_hours_per_week',
      'schedule_type',
      'role_requires_license',
      'job_title_check_enabled',
      'required_qualifications',
      'non_compete_clause_apply',
      'probation_length',
      'probation_length_recommended',
      'contract_duration_type',
      'annual_gross_salary',
      'ancillary_positions_clause_apply',
      'work_equipment_provided',
      'equity_compensation',
      'experience_level',
      'has_signing_bonus',
      'has_bonus',
      'has_commissions',
      'role_description',
    ],
    type: 'object',
    'x-jsf-logic': {
      allOf: [
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
                maximum: 30,
                'x-jsf-logic-computedAttrs': {
                  minimum: 'minimum_core_hours_part_time',
                  'x-jsf-errorMessage': {
                    maximum:
                      'The employee core business hours cannot exceed 30 hours',
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
                maximum: 48,
                'x-jsf-logic-computedAttrs': {
                  minimum: 'minimum_core_hours_full_time',
                  'x-jsf-errorMessage': {
                    maximum:
                      'The employee core business hours cannot exceed 48 hours',
                    minimum:
                      'The employee must work at least {{minimum_core_hours_full_time}} core business hours',
                  },
                },
              },
            },
          },
        },
        {
          else: {
            properties: {
              available_pto: {
                'x-jsf-logic-computedAttrs': {
                  statement: {
                    title:
                      '<strong>{{minimum_days_computed}} vacation days per year</strong>, automatically calculated from the work schedule definition.',
                  },
                },
              },
            },
          },
          if: {
            validations: {
              similar_roles_minimum_higher: {
                const: true,
              },
            },
          },
          then: {
            properties: {
              available_pto: {
                'x-jsf-logic-computedAttrs': {
                  statement: {
                    title:
                      '<strong>{{minimum_days_computed}} vacation days per year</strong>, automatically calculated to match similar roles.',
                  },
                },
              },
            },
          },
        },
      ],
      computedValues: {
        annual_gross_salary_reserve_description: {
          rule: {
            if: [
              {
                '>=': [
                  {
                    var: 'annual_gross_salary',
                  },
                  15000000,
                ],
              },
              {
                cat: [
                  '<strong>Minimum salary depending on work hours per week.</strong> In Germany, there are minimum salaries related to work hours per week.',
                  ' ',
                  'A reserve payment will be required, as described above.',
                ],
              },
              '<strong>Minimum salary depending on work hours per week.</strong> In Germany, there are minimum salaries related to work hours per week.',
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
                var: 'contract_end_date',
              },
              {
                if: [
                  false,
                  {
                    if: [
                      {
                        '==': [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          1,
                        ],
                      },
                      {
                        cat: [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          ' ',
                          'month',
                        ],
                      },
                      {
                        cat: [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          ' ',
                          'months',
                        ],
                      },
                    ],
                  },
                  {
                    '+': [
                      {
                        min: [
                          {
                            max: [
                              {
                                '/': [
                                  {
                                    if: [
                                      {
                                        '==': [
                                          {
                                            date_difference_in_months: [
                                              {
                                                date_add_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  1,
                                                ],
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        '+': [
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                          1,
                                        ],
                                      },
                                      {
                                        date_difference_in_months: [
                                          {
                                            var: 'contract_end_date',
                                          },
                                          '2026-10-29',
                                        ],
                                      },
                                    ],
                                  },
                                  2,
                                ],
                              },
                              0,
                            ],
                          },
                          6,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
              null,
            ],
          },
        },
        maximum_probation_pluralized: {
          rule: {
            if: [
              {
                var: 'contract_end_date',
              },
              {
                if: [
                  true,
                  {
                    if: [
                      {
                        '==': [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          1,
                        ],
                      },
                      {
                        cat: [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          ' ',
                          'month',
                        ],
                      },
                      {
                        cat: [
                          {
                            min: [
                              {
                                max: [
                                  {
                                    '/': [
                                      {
                                        if: [
                                          {
                                            '==': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    date_add_days: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      1,
                                                    ],
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              {
                                                '+': [
                                                  {
                                                    date_difference_in_months: [
                                                      {
                                                        var: 'contract_end_date',
                                                      },
                                                      '2026-10-29',
                                                    ],
                                                  },
                                                  1,
                                                ],
                                              },
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                        ],
                                      },
                                      2,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              6,
                            ],
                          },
                          ' ',
                          'months',
                        ],
                      },
                    ],
                  },
                  {
                    '+': [
                      {
                        min: [
                          {
                            max: [
                              {
                                '/': [
                                  {
                                    if: [
                                      {
                                        '==': [
                                          {
                                            date_difference_in_months: [
                                              {
                                                date_add_days: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  1,
                                                ],
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                          {
                                            '+': [
                                              {
                                                date_difference_in_months: [
                                                  {
                                                    var: 'contract_end_date',
                                                  },
                                                  '2026-10-29',
                                                ],
                                              },
                                              1,
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        '+': [
                                          {
                                            date_difference_in_months: [
                                              {
                                                var: 'contract_end_date',
                                              },
                                              '2026-10-29',
                                            ],
                                          },
                                          1,
                                        ],
                                      },
                                      {
                                        date_difference_in_months: [
                                          {
                                            var: 'contract_end_date',
                                          },
                                          '2026-10-29',
                                        ],
                                      },
                                    ],
                                  },
                                  2,
                                ],
                              },
                              0,
                            ],
                          },
                          6,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
              {
                cat: [0, ' ', 'months'],
              },
            ],
          },
        },
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
                          19.78,
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
                              19.78,
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
                          1978,
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
                              1978,
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
        minimum_core_hours_full_time: {
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
              31,
            ],
          },
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
              1,
            ],
          },
        },
        minimum_days_computed: {
          rule: {
            if: [
              {
                '>': [
                  {
                    '*': [
                      {
                        '/': [
                          {
                            if: [
                              {
                                in: [
                                  {
                                    var: 'schedule_type',
                                  },
                                  ['core_business_hours', 'fixed_hours'],
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
                              0,
                            ],
                          },
                          5,
                        ],
                      },
                      20,
                    ],
                  },
                  0,
                ],
              },
              {
                '*': [
                  {
                    '/': [
                      {
                        if: [
                          {
                            in: [
                              {
                                var: 'schedule_type',
                              },
                              ['core_business_hours', 'fixed_hours'],
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
                          0,
                        ],
                      },
                      5,
                    ],
                  },
                  20,
                ],
              },
              0,
            ],
          },
        },
      },
      validations: {
        fixed_full_time_within_bounds: {
          errorMessage:
            'The fixed work hours must be within 31 and 48 work hours per week',
          rule: {
            and: [
              {
                '>=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  31,
                ],
              },
              {
                '<=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  48,
                ],
              },
            ],
          },
        },
        fixed_part_time_within_bounds: {
          errorMessage:
            'The fixed work hours must be within 1 and 30 work hours per week',
          rule: {
            and: [
              {
                '>=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  1,
                ],
              },
              {
                '<=': [
                  {
                    var: 'work_hours_per_week',
                  },
                  30,
                ],
              },
            ],
          },
        },
        similar_roles_minimum_higher: {
          rule: {
            '>=': [
              0,
              {
                var: 'available_pto',
              },
            ],
          },
        },
        work_in_person_days_per_week_validation: {
          errorMessage:
            "The number of days cannot exceed the days on the employee's schedule",
          rule: {
            '<=': [
              {
                var: 'work_address.work_in_person_days_per_week',
              },
              {
                if: [
                  {
                    in: [
                      {
                        var: 'schedule_type',
                      },
                      ['core_business_hours', 'fixed_hours'],
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
                  6,
                ],
              },
            ],
          },
        },
      },
    },
    'x-jsf-order': [
      'business_model',
      'contract_duration',
      'contract_duration_type',
      'contract_end_date',
      'work_schedule',
      'schedule_type',
      'daily_schedule',
      'work_hours_per_week',
      'probation_length_recommended',
      'probation_length',
      'notice_period_choice',
      'notice_period',
      'notice_period_statement',
      'available_pto_type',
      'available_pto',
      'additional_holiday_days',
      'additional_pto',
      'required_qualifications',
      'professional_licenses',
      'role_description',
      'role_requires_license',
      'job_title_check_enabled',
      'additional_job_title_eligibility_check_slug',
      'additional_job_title_eligibility_check_result',
      'experience_level',
      'work_address_is_home_address',
      'work_address',
      'salary_overview',
      'annual_gross_salary',
      'part_time_salary_confirmation',
      'overtime_statement',
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
      'ancillary_positions_clause_apply',
      'work_equipment_provided',
      'work_equipment',
    ],
    'x-rmt-flatFieldsets': {
      additional_job_title_eligibility_check: {
        propertiesByName: [
          'required_qualifications',
          'additional_job_title_eligibility_check_slug',
          'additional_job_title_eligibility_check_result',
          'job_title_check_enabled',
          'role_description',
          'role_requires_license',
          'professional_licenses',
        ],
        title: 'Role Requirements',
      },
      annual_gross_salary_fieldset: {
        propertiesByName: [
          'salary_overview',
          'annual_gross_salary',
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
      equipment_fieldset: {
        propertiesByName: ['work_equipment_provided', 'work_equipment'],
        title: 'Laptop/mobile equipment',
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
      notice_period_fieldset: {
        propertiesByName: [
          'notice_period_statement',
          'notice_period_choice',
          'notice_period',
        ],
        title: 'Notice period',
      },
      paid_time_off: {
        propertiesByName: [
          'available_pto_type',
          'available_pto',
          'additional_holiday_days',
          'additional_pto',
        ],
        title: 'Paid time off',
      },
    },
    'x-rmt-meta': {
      jsfVersion: '1',
    },
    'x-rmt-schema-changelog': {
      changelog:
        'Correct the comparable-role salary threshold for German AUG employments with fractional weekly hours.',
      upgradePath:
        'When submitting German AUG contract details with comparable-role data, ensure annual_gross_salary meets the corrected minimum.',
    },
  },
};

export const contractDetailsSchemaV1Portugal = {
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
          properties: {
            part_time_salary_confirmation: false,
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
            part_time_salary_confirmation: {
              const: 'acknowledged',
            },
            work_hours_per_week: {
              maximum: 39,
              minimum: 1,
            },
          },
          required: ['part_time_salary_confirmation', 'work_hours_per_week'],
        },
      },
      {
        else: {
          properties: {
            maximum_working_hours_regime: false,
          },
        },
        if: {
          properties: {
            working_hours_exemption: {
              const: 'yes',
            },
          },
          required: ['working_hours_exemption'],
        },
        then: {
          required: ['maximum_working_hours_regime'],
        },
      },
      {
        else: {
          properties: {
            working_hours_exemption_allowance: false,
          },
        },
        if: {
          properties: {
            annual_gross_salary: {
              minimum: 1,
            },
            maximum_working_hours_regime: {
              enum: ['yes', 'no'],
            },
            work_hours_per_week: {
              minimum: 1,
            },
            working_hours_exemption: {
              const: 'yes',
            },
          },
          required: [
            'working_hours_exemption',
            'maximum_working_hours_regime',
            'work_hours_per_week',
          ],
        },
        then: {
          else: {
            properties: {
              working_hours_exemption_allowance: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'working_hours_exemption_allowance_no_max_hours_value_in_cents',
                  default:
                    'working_hours_exemption_allowance_no_max_hours_value_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'As this employee will need to work outside regular hours, you’ll need to pay them an <strong>additional {{working_hours_exemption_allowance_no_max_hours_value}} EUR monthly</strong>, on top of their salary.',
                      severity: 'info',
                      title:
                        'You’ll need to pay an extended work hours allowance',
                    },
                  },
                },
              },
            },
            required: ['working_hours_exemption_allowance'],
          },
          if: {
            properties: {
              maximum_working_hours_regime: {
                const: 'yes',
              },
            },
            required: ['maximum_working_hours_regime'],
          },
          then: {
            properties: {
              working_hours_exemption_allowance: {
                'x-jsf-logic-computedAttrs': {
                  const:
                    'working_hours_exemption_allowance_with_max_hours_value_in_cents',
                  default:
                    'working_hours_exemption_allowance_with_max_hours_value_in_cents',
                  'x-jsf-presentation': {
                    statement: {
                      description:
                        'As this employee will need to work outside regular hours and for more than 8 hours a day, you’ll need to pay them an <strong>additional {{working_hours_exemption_allowance_with_max_hours_value}} EUR monthly</strong>, on top of their salary.',
                      severity: 'info',
                      title:
                        'You’ll need to pay an extended work hours allowance',
                    },
                  },
                },
              },
            },
            required: ['working_hours_exemption_allowance'],
          },
        },
      },
      {
        else: {
          properties: {
            signing_bonus_amount: false,
            signing_bonus_clawback: false,
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
          required: ['signing_bonus_amount', 'signing_bonus_clawback'],
        },
      },
      {
        else: {
          else: {
            properties: {
              available_pto: {
                minimum: 22,
              },
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
              available_pto: {
                minimum: 0,
              },
            },
          },
        },
        if: {
          properties: {
            available_pto_type: {
              const: 'unlimited',
            },
          },
          required: ['available_pto_type'],
        },
        then: {
          properties: {
            available_pto: {
              const: 22,
              default: 22,
              title: 'Minimum paid time off days',
              'x-jsf-presentation': {
                statement: {
                  description:
                    'In Portugal, employees are entitled to a minimum of 22 paid time off days per year. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
                  title:
                    'Minimum of <strong>22 days</strong> of paid time off.',
                },
              },
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
        if: {
          properties: {
            probation_length_days: {
              const: 0,
            },
          },
          required: ['probation_length_days'],
        },
        then: {
          properties: {
            probation_length_days: {
              'x-jsf-presentation': {
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
    ],
    anyOf: [
      {
        required: ['probation_length_days'],
      },
      {
        required: ['probation_length'],
      },
    ],
    properties: {
      annual_gross_salary: {
        description:
          "The minimum annual salary is calculated based on the country's applicable laws.",
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
      annual_training_hours_ack: {
        const: 'acknowledged',
        description:
          "In Portugal, employees with indefinite contracts must complete 40 hours of training annually during work hours. If training hours aren't met, employees get paid for unused hours at offboarding.",
        title: "I acknowledge Portugal's annual training requirement",
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18006437022605,
              title: 'Help center unavailable',
            },
          },
        },
      },
      available_pto: {
        description:
          'In Portugal, employees are entitled to a minimum of 22 paid time off days per year. Please pro-rate for part-time employment. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
        title: 'Number of paid time off days',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      available_pto_type: {
        description:
          'For personal time off. Also called vacation or annual leave.',
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
              'The employee gets a set number of paid time off days per year that you establish.',
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
      bonus_details: {
        description: 'Bonus type, payment frequency, and more.',
        maxLength: 1000,
        title: 'Other bonus details',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'textarea',
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
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 17932049668109,
              title: 'Help center unavailable',
            },
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
          "Indefinite or fixed-term contract. If the latter, please state duration and if there's possibility for renewal.",
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
      contract_duration_type: {
        const: 'indefinite',
        description:
          'I acknowledge that only Indefinite-term Contracts are available. Remote does not support Fixed-term Contracts in Portugal.',
        title: 'Contract duration',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn about contract duration',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 4410443814157,
              title: 'Help center unavailable',
            },
          },
        },
      },
      contract_end_date: {
        deprecated: true,
        format: 'date',
        maxLength: 255,
        readOnly: true,
        title: 'Contract End Date (deprecated)',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description:
              "Deprecated because Contract Duration can only be 'indefinite'.",
          },
          inputType: 'date',
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
            title:
              'Number of options, RSUs (or other equity types), vesting schedule, strike price, etc.',
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
            helpCenter: {
              callToAction: 'Learn more about equity management at Remote',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019182760333,
              title: 'Help center unavailable',
            },
          },
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
      maximum_working_hours_regime: {
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
        title: 'Will this employee need to work more than 8 hours a day?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
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
      probation_length: {
        deprecated: true,
        description:
          'Please enter a value between 0 and 6 months (legal maximum). Not electing a probationary period will adversely impact other employment actions including background checks.',
        maximum: 6,
        minimum: 0,
        readOnly: true,
        title: 'Probation period (in months) (deprecated)',
        type: ['number', 'null'],
        'x-jsf-presentation': {
          deprecated: {
            description: "Deprecated in favor of 'Probation period (in days)'.",
          },
          inputType: 'number',
          statement: {
            description:
              'If you need Remote to terminate a post-probation employee in Portugal because of your company’s economic or organizational circumstances, a mutual termination agreement must be entered into with the employee.\n\nPerformance-related terminations must meet a high threshold of compliance.\n\nIt is common for employees in Remote to bring claims and employers to pay settlements or to opt for termination by mutual agreement.\n\nDuring probation, you have some more flexibility on termination; for example, when the termination reason is the employee’s performance. For this reason, we recommend setting the probation period to the maximum allowed.',
            severity: 'info',
            title: 'Information on termination - probation',
          },
        },
      },
      probation_length_days: {
        description:
          'Please enter a value between 15 and 240 days (legal maximum).',
        maximum: 240,
        minimum: 15,
        title: 'Probation period, in days',
        type: 'number',
        'x-jsf-errorMessage': {
          maximum: 'Probation must be at most 240 days',
          minimum: 'Probation must be at least 15 days',
        },
        'x-jsf-presentation': {
          inputType: 'number',
          meta: {
            helpCenter: {
              callToAction: 'Learn about probation period',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 9013034328205,
              title: 'Help center unavailable',
            },
          },
          statement: {
            description:
              'If you need Remote to terminate a post-probation employee in Portugal because of your company’s economic or organizational circumstances, a mutual termination agreement must be entered into with the employee.\n\nPerformance-related terminations must meet a high threshold of compliance.\n\nIt is common for employees in Remote to bring claims and employers to pay settlements or to opt for termination by mutual agreement.\n\nDuring probation, you have some more flexibility on termination; for example, when the termination reason is the employee’s performance. For this reason, we recommend setting the probation period to the maximum allowed.',
            severity: 'info',
            title: 'Information on termination - probation',
          },
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
              callToAction: 'Why do I need to do this?',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 18019255579405,
              title: 'Help center unavailable',
            },
          },
        },
      },
      salary_installments_confirmation: {
        const: 'acknowledged',
        description:
          "In Portugal, employees receive 13th and 14th month salaries (usually called vacation and Christmas allowances) as part of their annual gross salary. The 13th and 14th salary amounts are based on an employee's regular salary and aren't affected by bonuses or commissions.",
        title:
          'I confirm the annual gross salary includes 13th and 14th salaries',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more about bonus salaries',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 21980576563725,
              title: 'Help center unavailable',
            },
          },
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
      signing_bonus_clawback: {
        description:
          'This would require the employee to return the bonus if they leave your company before the first year.',
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
        title: 'Apply a signing bonus clawback?',
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
            title: 'Work address line 2 (optional)',
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
            enum: ['yes', 'no'],
            title: 'Local',
            type: 'string',
            'x-jsf-presentation': {
              direction: 'column',
              inputType: 'radio',
              options: [
                {
                  description:
                    'Select this option if the employee is fully remote.',
                  label: "Same as the employee's residential address",
                  value: 'yes',
                },
                {
                  description:
                    'Select this option if the employee is under a hybrid work regime.',
                  label: "Different than the employee's residential address",
                  value: 'no',
                },
              ],
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
            maximum: 7,
            minimum: 1,
            title: 'Number of days per week',
            type: 'number',
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
      work_from_home_allowance: {
        deprecated: true,
        description:
          "This helps employees cover additional work-from-home expenses. We recommend EUR 50 based on Portugal's practices.",
        minimum: 5000,
        readOnly: true,
        title: 'Monthly work-from-home allowance',
        type: ['integer', 'null'],
        'x-jsf-errorMessage': {
          minimum: 'Must be greater or equal to 50 EUR.',
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          deprecated: {
            description:
              "Deprecated because of the new 'I acknowledge Portugal's work-from-home allowance' field. No longer available to customers.",
          },
          inputType: 'money',
        },
      },
      work_from_home_allowance_ack: {
        const: 'acknowledged',
        description:
          'In Portugal, this allowance is required by law. However, the allowance amount is based on a few different factors.',
        title: "I acknowledge Portugal's work-from-home allowance",
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'checkbox',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content: 'The help center content is currently unavailable.',
              error: true,
              id: 20498497190285,
              title: 'Help center unavailable',
            },
          },
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
      working_hours_exemption: {
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
        title: 'Will this employee need to work outside regular work hours?',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              content:
                '<h1 data-component="HeadingIcon">What do I need to know?</h1><p>Portuguese law allows 3 types of employees to work outside legally defined regular work hours:</p><ul><li>Those on company boards or in senior management.</li><li>Those whose work by nature has to take place outside regular work hours.</li><li>Those who do remote work.</li></ul><p>Employers must pay every employee who works outside regular work hours a monthly allowance. The value of this allowance depends on which days and what time an employee works outside work hour.</p><p>If you have an employee in Portugal who will work outside regular work hours, we\'ll calculate their allowance for you and you\'ll pay it on top of their salary.</p>',
              title: 'Working hours exemption',
            },
          },
        },
      },
      working_hours_exemption_allowance: {
        description: '',
        title: 'Extended work hours allowance',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-presentation': {
          currency: 'EUR',
          inputType: 'money',
          statement: {
            severity: 'info',
            title: 'You’ll need to pay an extended work hours allowance',
          },
        },
      },
    },
    required: [
      'annual_gross_salary',
      'contract_duration_type',
      'work_schedule',
      'work_from_home_allowance_ack',
      'annual_training_hours_ack',
      'salary_installments_confirmation',
      'has_signing_bonus',
      'has_bonus',
      'has_commissions',
      'equity_compensation',
      'available_pto',
      'available_pto_type',
      'role_description',
      'experience_level',
      'work_address',
      'working_hours_exemption',
    ],
    type: 'object',
    'x-jsf-fieldsets': {
      annual_gross_salary_fieldset: {
        propertiesByName: [
          'annual_gross_salary',
          'salary_installments_confirmation',
        ],
        title: 'Annual gross salary',
      },
      extended_work_hours: {
        propertiesByName: [
          'working_hours_exemption',
          'maximum_working_hours_regime',
          'working_hours_exemption_allowance',
        ],
        title: 'Extended work hours',
      },
    },
    'x-jsf-logic': {
      computedValues: {
        working_hours_exemption_allowance_no_max_hours_value: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
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
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              2,
                              4,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      {
                        '%': [
                          {
                            '/': [
                              {
                                '*': [
                                  {
                                    var: 'annual_gross_salary',
                                  },
                                  12,
                                  1.25,
                                  2,
                                  4,
                                ],
                              },
                              {
                                '*': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  52,
                                  14,
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
        working_hours_exemption_allowance_no_max_hours_value_in_cents: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '-': [
                  {
                    '/': [
                      {
                        '*': [
                          {
                            var: 'annual_gross_salary',
                          },
                          12,
                          1.25,
                          2,
                          4,
                        ],
                      },
                      {
                        '*': [
                          {
                            var: 'work_hours_per_week',
                          },
                          52,
                          14,
                        ],
                      },
                    ],
                  },
                  {
                    '%': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              2,
                              4,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
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
        working_hours_exemption_allowance_with_max_hours_value: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
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
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              22,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
                            ],
                          },
                        ],
                      },
                      {
                        '%': [
                          {
                            '/': [
                              {
                                '*': [
                                  {
                                    var: 'annual_gross_salary',
                                  },
                                  12,
                                  1.25,
                                  22,
                                ],
                              },
                              {
                                '*': [
                                  {
                                    var: 'work_hours_per_week',
                                  },
                                  52,
                                  14,
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
        working_hours_exemption_allowance_with_max_hours_value_in_cents: {
          rule: {
            if: [
              {
                and: [
                  {
                    var: 'annual_gross_salary',
                  },
                  {
                    var: 'work_hours_per_week',
                  },
                ],
              },
              {
                '-': [
                  {
                    '/': [
                      {
                        '*': [
                          {
                            var: 'annual_gross_salary',
                          },
                          12,
                          1.25,
                          22,
                        ],
                      },
                      {
                        '*': [
                          {
                            var: 'work_hours_per_week',
                          },
                          52,
                          14,
                        ],
                      },
                    ],
                  },
                  {
                    '%': [
                      {
                        '/': [
                          {
                            '*': [
                              {
                                var: 'annual_gross_salary',
                              },
                              12,
                              1.25,
                              22,
                            ],
                          },
                          {
                            '*': [
                              {
                                var: 'work_hours_per_week',
                              },
                              52,
                              14,
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
      },
    },
    'x-jsf-order': [
      'contract_duration',
      'contract_duration_type',
      'contract_end_date',
      'work_schedule',
      'work_hours_per_week',
      'probation_length',
      'probation_length_days',
      'available_pto_type',
      'available_pto',
      'role_description',
      'experience_level',
      'work_address',
      'annual_gross_salary',
      'part_time_salary_confirmation',
      'salary_installments_confirmation',
      'work_from_home_allowance_ack',
      'annual_training_hours_ack',
      'work_from_home_allowance',
      'working_hours_exemption',
      'maximum_working_hours_regime',
      'working_hours_exemption_allowance',
      'has_signing_bonus',
      'signing_bonus_amount',
      'signing_bonus_clawback',
      'has_bonus',
      'bonus_amount',
      'bonus_details',
      'has_commissions',
      'commissions_details',
      'commissions_ack',
      'equity_compensation',
    ],
  },
};


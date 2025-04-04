export const jsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      allOf: [
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
        {
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
                maximum: 40,
                minimum: 30,
              },
            },
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
          else: {
            else: {
              properties: {
                available_pto: {
                  minimum: 20,
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
                const: 20,
                default: 20,
                title: 'Minimum paid time off days',
                'x-jsf-presentation': {
                  statement: {
                    description:
                      'In Germany, employees are entitled to a minimum of 20 paid time off days per year. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
                    title:
                      'Minimum of <strong>20 days</strong> of paid time off.',
                  },
                },
              },
            },
          },
        },
      ],
      properties: {
        annual_gross_salary: {
          description:
            'Minimum salary depending on work hours per week. In Germany, there are minimum salaries related to work hours per week.',
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
            description:
              '<strong>Minimum salary depending on work hours per week.</strong> In Germany, there are minimum salaries related to work hours per week.',
            inputType: 'money',
          },
        },
        available_pto: {
          description:
            'In Germany, employees are entitled to a minimum of 20 paid time off days per year. Please pro-rate for part-time employment. Please note that Statutory, Bank Holidays and Public Holidays are excluded from the above.',
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
          description:
            'Please note that fixed-term contracts are limited to 18 months.',
          format: 'date',
          maxLength: 255,
          title: 'Contract end date',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            inputType: 'date',
            maxDate: '2026-10-01',
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
              description:
                "Tell us the type of equity you're granting as well.",
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
                'This is for tracking purposes only. Employment agreements will not include equity compensation. To offer equity, you need to work with your own lawyers and accountants to set up a plan that covers your team members.',
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
        non_compete_clause_apply: {
          deprecated: true,
          description:
            'In Germany, employees may be entitled to up to 50% of their salary for the length of a non-compete or non-solicit post termination. Because of this significant sum and because we cannot guarantee the effectiveness of a non-compete or a non-solicit clause, we recommend selecting no. Selecting yes may make you liable for extra costs.',
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
          title: '(Deprecated) Apply non-compete and non-solicitation clauses?',
          type: ['string', 'null'],
          'x-jsf-presentation': {
            deprecated: {
              description:
                'Deprecated because the option is redundant and remote has no intention of utilizing the clause, and clients can not make use of it',
            },
            direction: 'row',
            inputType: 'radio',
          },
        },
        non_compete_clause_halt_period_months: {
          deprecated: true,
          description:
            'Non-compete clauses in Germany can range from 1 to 12 months.',
          maximum: 12,
          minimum: 1,
          readOnly: true,
          title: '(Deprecated) Length of non-compete clause (in months)',
          type: ['number', 'null'],
          'x-jsf-errorMessage': {
            maximum: 'Must be no more than 12 months.',
            minimum: 'Must be at least 1 month.',
          },
          'x-jsf-presentation': {
            deprecated: {
              description:
                'Deprecated because the option non_compete_clause_apply is deprecated',
            },
            inputType: 'number',
          },
        },
        notice_period: {
          description:
            'Please input the duration of the notice period in months. In Germany the maximum is six months.',
          maximum: 6,
          minimum: 1,
          title: 'Notice period (months)',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
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
          description:
            'Please enter a value between 0 and 6 months (legal maximum).',
          maximum: 6,
          minimum: 0,
          title: 'Probation period in months',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
            meta: {
              helpCenter: {
                callToAction: 'Learn about probation period',
                content: 'The help center content is currently unavailable.',
                error: true,
                id: 19858883586445,
                title: 'Help center unavailable',
              },
            },
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
        work_address: {
          allOf: [
            {
              else: {
                properties: {
                  address: false,
                  address_line_2: false,
                  city: false,
                  postal_code: false,
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
                required: ['address', 'city', 'postal_code'],
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
        work_equipment_provided: {
          description:
            'Will you provide the required equipment for the employee to perform their duties? (e.g. laptop, mobile phone)',
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
          title: 'Laptop/mobile equipment',
          type: 'string',
          'x-jsf-presentation': {
            direction: 'row',
            inputType: 'radio',
          },
        },
        work_hours_per_week: {
          description:
            'Note that full-time employees are expected to work between 30 hours and 40 hours per week and part-time employees are expected to work a maximum of 30 hours per week.',
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
        'contract_duration_type',
        'annual_gross_salary',
        'available_pto_type',
        'equity_compensation',
        'experience_level',
        'has_signing_bonus',
        'has_bonus',
        'has_commissions',
        'notice_period',
        'probation_length',
        'role_description',
        'work_equipment_provided',
        'work_address',
      ],
      type: 'object',
      'x-jsf-logic': {
        computedValues: {
          minimum_annual_gross_salary: {
            rule: {
              '/': [
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'work_hours_per_week',
                        },
                        12.41,
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
                            12.41,
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
          },
          minimum_annual_gross_salary_in_cents: {
            rule: {
              '/': [
                {
                  '-': [
                    {
                      '*': [
                        {
                          var: 'work_hours_per_week',
                        },
                        1241,
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
                            1241,
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
          },
        },
      },
      'x-jsf-order': [
        'business_model',
        'contract_duration',
        'contract_duration_type',
        'contract_end_date',
        'probation_length',
        'work_schedule',
        'work_hours_per_week',
        'annual_gross_salary',
        'part_time_salary_confirmation',
        'has_signing_bonus',
        'signing_bonus_amount',
        'has_bonus',
        'bonus_amount',
        'bonus_details',
        'has_commissions',
        'commissions_details',
        'commissions_ack',
        'equity_compensation',
        'available_pto_type',
        'available_pto',
        'role_description',
        'notice_period',
        'work_equipment_provided',
        'experience_level',
        'work_address_is_home_address',
        'work_address',
        'non_compete_clause_apply',
        'non_compete_clause_halt_period_months',
      ],
    },
  },
};

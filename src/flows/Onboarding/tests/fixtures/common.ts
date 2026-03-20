export const employmentCreatedResponse = {
  data: {
    employment: {
      id: 'f3b9ee0a-b50c-4a20-8c5e-9303781479a1',
      type: 'employee',
      country_code: 'PRT',
      updated_at: '2025-05-20T08:20:04',
      external_id: null,
      created_at: '2025-05-20T08:20:02',
      full_name: 'John Doe',
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      provisional_start_date: '2025-05-29',
      job_title: 'Software Engineer',
      manager_id: null,
      department_id: null,
      user_status: 'created',
      basic_information: {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        provisional_start_date: '2025-05-29',
        job_title: 'Software Engineer',
        tax_servicing_countries: [],
        work_email: 'john.doe@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'operations',
      },
      seniority_date: null,
      personal_email: 'john.doe@gmail.com',
      employment_lifecycle_stage: 'employment_creation',
      short_id: 'D02YZR',
      eligible_for_onboarding_cancellation: true,
      probation_period_end_date: null,
      active_contract_id: '126758da-5e2a-4032-b05e-6ff62832b08c',
    },
  },
};
export const employmentUpdatedResponse = {
  data: {
    employment: {
      files: [],
      manager_id: null,
      termination_date: null,
      administrative_details: null,
      job_title: 'pm',
      user_status: 'created',
      employment_lifecycle_stage: 'employment_creation',
      billing_address_details: null,
      eligible_for_onboarding_cancellation: true,
      user_id: '26bc68f3-c767-4e1f-84a9-e871fb736d96',
      emergency_contact_details: null,
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      status: 'created',
      manager: null,
      contract_details: {
        annual_gross_salary: 2000000,
        annual_training_hours_ack: 'acknowledged',
        available_pto: 22,
        available_pto_type: 'unlimited',
        bonus_amount: null,
        bonus_details: null,
        commissions_ack: null,
        commissions_details: null,
        contract_duration_type: 'indefinite',
        contract_end_date: null,
        equity_compensation: {
          offer_equity_compensation: 'no',
        },
        experience_level:
          'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
        has_bonus: 'no',
        has_commissions: 'no',
        has_signing_bonus: 'no',
        maximum_working_hours_regime: null,
        part_time_salary_confirmation: null,
        probation_length: null,
        probation_length_days: 30,
        role_description:
          'dskdsffalljkfdssfdjkajdfsajkdflkfdlajksfddafdasdfsfdafdfdfddsafdkfdlkfdkjakldfjfkdlkdfjlkfdljfdljkajldfkajldfkjkafdjkla',
        salary_installments_confirmation: 'acknowledged',
        signing_bonus_amount: null,
        signing_bonus_clawback: null,
        work_address: {
          is_home_address: 'yes',
        },
        work_from_home_allowance: null,
        work_from_home_allowance_ack: 'acknowledged',
        work_hours_per_week: 40,
        work_schedule: 'full_time',
        working_hours_exemption: 'no',
        working_hours_exemption_allowance: null,
      },
      seniority_date: null,
      basic_information: {
        name: 'gabriel',
        email: 'john.doe@example.com',
        job_title: 'pm',
        provisional_start_date: '2025-05-30',
        tax_servicing_countries: [],
        work_email: 'john.doe@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'operations',
      },
      full_name: 'gabriel',
      manager_email: null,
      probation_period_end_date: '2025-06-28',
      updated_at: '2025-05-20T14:26:58',
      provisional_start_date: '2025-05-30',
      address_details: null,
      pricing_plan_details: null,
      work_email: 'john.doe@remote.com',
      bank_account_details: [],
      short_id: 'R1XTJD',
      external_id: null,
      id: '4e9ee7a3-5f54-480b-a390-49a0a2d31dcb',
      country: {
        code: 'PRT',
        name: 'Portugal',
        alpha_2_code: 'PT',
        supported_json_schemas: [
          'additional_documents',
          'administrative_details',
          'contract_details',
          'employment_basic_information',
          'emergency_contact',
          'address_details',
        ],
      },
      manager_employment_id: null,
      department_id: null,
      type: 'employee',
      onboarding_tasks: {
        bank_account_details: {
          status: 'pending',
          description: 'Bank account used for receiving salary payments.',
        },
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        contract_details: {
          status: 'completed',
          description:
            'Employee-specific details for their employment agreement.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'pending',
          description:
            'How often Remote will bill employers for management fees.',
        },
        billing_address_details: {
          status: 'pending',
          description: "Address associated with the employee's bank account.",
        },
        employment_document_details: {
          status: 'pending',
          description: 'We need some additional documents.',
        },
        employment_eligibility: {
          status: 'pending',
          description:
            'We’ll make sure you can work in the country where you live.',
        },
      },
      personal_details: null,
      created_at: '2025-05-20T14:17:29',
      personal_email: 'john.doe@example.com',
      active_contract_id: '54e4e0e0-6c73-405f-8a91-f4b98065b65b',
      department: null,
    },
  },
};
export const benefitOffersUpdatedResponse = { data: { status: 'ok' } };

export const inviteResponse = { data: { status: 'ok' } };

export const benefitOffersResponse = {
  data: [
    {
      benefit_group: {
        name: 'Meal Benefit',
        filter: null,
        slug: '0e0293ae-eec6-4d0e-9176-51c46eed435e',
      },
      benefit_tier: {
        name: 'Meal Card Standard 2025',
        slug: '601d28b6-efde-4b8f-b9e2-e394792fc594',
        display_cost: '~160 EUR/mo',
      },
    },
    {
      benefit_group: {
        name: 'Health Insurance 2025',
        filter: {
          name: 'Single',
          slug: '866c0615-a810-429b-b480-3a4f6ca6157d',
        },
        slug: 'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
      },
      benefit_tier: {
        name: 'Basic Health Plan 2025 (Single)',
        slug: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
        display_cost: '45.40 EUR/mo',
      },
    },
    {
      benefit_group: {
        name: 'Life Insurance 2.0',
        filter: {
          name: 'Basic',
          slug: '73a134db-4743-4d81-a1ec-1887f2240c5c',
        },
        slug: '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      },
      benefit_tier: {
        name: 'Life Insurance - $50K',
        slug: '0b097ff7-8b59-49dc-9cba-16543bd6a44c',
        display_cost: '5.64 USD/mo',
      },
    },
  ],
};

export const employmentDefaultResponse = {
  data: {
    employment: {
      company_id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      personal_details: null,
      contract_details: {
        annual_gross_salary: 2000000,
        annual_training_hours_ack: 'acknowledged',
        available_pto: 22,
        available_pto_type: 'unlimited',
        benefits: {
          health_insurance_2025:
            'Basic Health Plan 2025 (Single) (Advance Care/ Tranquilidade - Basic Health Plan 2025 (Single))',
          life_insurance_2_0:
            'Life Insurance - $100K (Allianz Life - Global Life - Life 100k)',
          meal_benefit:
            'Meal Card Standard 2025 (Coverflex - Meal Card Standard 2025)',
        },
        bonus_amount: null,
        bonus_details: null,
        commissions_ack: null,
        commissions_details: null,
        contract_duration_type: 'indefinite',
        contract_end_date: null,
        equity_compensation: {
          offer_equity_compensation: 'no',
        },
        experience_level:
          'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
        has_bonus: 'no',
        has_commissions: 'no',
        has_signing_bonus: 'no',
        maximum_working_hours_regime: null,
        part_time_salary_confirmation: null,
        probation_length: null,
        probation_length_days: 40,
        role_description:
          'A Product Manager is responsible for guiding the development and success of a product from concept to launch. They act as the bridge between business, design, and engineering teams, ensuring alignment with user needs and company goals. Product Managers conduct market research, define product requirements, prioritize features, and manage the product roadmap. They communicate clearly with stakeholders, analyze performance data, and make decisions to optimize user experience and business outcomes. Strategic thinking, problem-solving, and leadership are key traits. A Product Manager must balance customer desires, technical feasibility, and business viability to deliver valuable, innovative products in a competitive market.',
        salary_installments_confirmation: 'acknowledged',
        signing_bonus_amount: null,
        signing_bonus_clawback: null,
        work_address: {
          is_home_address: 'yes',
        },
        work_from_home_allowance: null,
        work_from_home_allowance_ack: 'acknowledged',
        work_hours_per_week: 40,
        work_schedule: 'full_time',
        working_hours_exemption: 'no',
        working_hours_exemption_allowance: null,
      },
      external_id: null,
      onboarding_tasks: {
        bank_account_details: {
          status: 'pending',
          description: 'Bank account used for receiving salary payments.',
        },
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        contract_details: {
          status: 'completed',
          description:
            'Employee-specific details for their employment agreement.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'pending',
          description:
            'How often Remote will bill employers for management fees.',
        },
        billing_address_details: {
          status: 'pending',
          description: "Address associated with the employee's bank account.",
        },
        employment_document_details: {
          status: 'pending',
          description: 'We need some additional documents.',
        },
        employment_eligibility: {
          status: 'pending',
          description:
            'We’ll make sure you can work in the country where you live.',
        },
      },
      job_title: 'pm',
      manager_employment_id: null,
      manager_id: null,
      work_email: 'john.doe@remote.com',
      pricing_plan_details: null,
      personal_email: 'john.doe@example.com',
      billing_address_details: null,
      full_name: 'Gabriel',
      basic_information: {
        name: 'Gabriel',
        email: 'john.doe@example.com',
        provisional_start_date: '2025-05-29',
        job_title: 'pm',
        tax_servicing_countries: ['Belarus'],
        work_email: 'john.doe@remote.com',
        has_seniority_date: 'no',
        tax_job_category: 'engineering_it',
      },
      status: 'created',
      manager: null,
      provisional_start_date: '2025-05-29',
      probation_period_end_date: '2025-07-07',
      created_at: '2025-05-19T08:12:18',
      manager_email: null,
      user_status: 'created',
      country: {
        code: 'PRT',
        name: 'Portugal',
        alpha_2_code: 'PT',
        supported_json_schemas: [
          'additional_documents',
          'administrative_details',
          'contract_details',
          'employment_basic_information',
          'emergency_contact',
          'address_details',
        ],
      },
      seniority_date: null,
      user_id: '36081a5d-4e4a-492b-afcd-6d859a98ea9e',
      short_id: 'DWS1T3',
      department_id: null,
      active_contract_id: 'a52001cb-05fa-4b63-b80a-7830c0c664e3',
      bank_account_details: [],
      department: null,
      employment_lifecycle_stage: 'employment_creation',
      files: [],
      emergency_contact_details: null,
      eligible_for_onboarding_cancellation: true,
      id: '38d8bb00-3d78-4dd7-98f8-bd735e68d9a9',
      administrative_details: null,
      updated_at: '2025-05-20T15:44:02',
      type: 'employee',
      termination_date: null,
      address_details: null,
    },
  },
};

export const conversionFromUSDToEUR = {
  data: {
    conversion_data: {
      exchange_rate: '0.85',
      target_currency: { code: 'EUR', name: 'Euro', symbol: '€' },
      source_currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      source_amount: 100000,
      target_amount: 85000,
    },
  },
};

export const conversionFromEURToUSD = {
  data: {
    conversion_data: {
      exchange_rate: '1.17647',
      target_currency: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
      },
      source_currency: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
      },
      source_amount: 100000,
      target_amount: 117647,
    },
  },
};

export const benefitOffersSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        '072e0edb-bfca-46e8-a449-9eed5cbaba33': {
          allOf: [
            {
              if: {
                properties: {
                  filter: {
                    const: '73a134db-4743-4d81-a1ec-1887f2240c5c',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '0b097ff7-8b59-49dc-9cba-16543bd6a44c',
                        title: 'Life Insurance 50K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $50,000. This means that regardless of an employee's salary, the payout will not exceed $50,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-plan-50k',
                            display_cost: '5.64 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '425df8c9-7832-412a-afbb-afae3ef32db6',
                        title: 'Life Insurance - $100K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $100,000. This means that regardless of an employee's salary, the payout will not exceed $100,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-100k',
                            display_cost: '11.28 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '0b925f7a-8e3d-4936-a3d9-8003b2636937',
                        title: 'Life Insurance - $200K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $200,000. This means that regardless of an employee's salary, the payout will not exceed $200,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-200k',
                            display_cost: '22.56 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'e6e05143-4e81-4981-9e86-288ef4eb1a4c',
                        title: 'Life Insurance - $400K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $400,000. This means that regardless of an employee's salary, the payout will not exceed $400,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-400k',
                            display_cost: '45.12 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '6fb56cc8-f6be-4525-a467-2fa6698e78c4',
                        title: 'Life Insurance - $500K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $500,000. This means that regardless of an employee's salary, the payout will not exceed $500,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-500k',
                            display_cost: '56.40 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '5d190d1e-3627-480b-9c8c-b9767b2100a0',
                        title: 'Life Insurance - $600K',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance only. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary. However, this compensation is capped at a maximum of $600,000. This means that regardless of an employee's salary, the payout will not exceed $600,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-basic-600k',
                            display_cost: '67.68 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'no',
                        title: "I don't want to offer this benefit.",
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
            {
              if: {
                properties: {
                  filter: {
                    const: '3a038ee7-5eda-42d5-8113-35336c0a4b52',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '50d0d279-00eb-42be-94a3-d533c512f6a2',
                        title:
                          'Life, Accidental Death & Permanent Disability - $50k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \nIn the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $50,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $50,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $50,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-50k',
                            display_cost: '12.04 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '9dfaf128-fecb-4022-8436-7db2620c65f0',
                        title:
                          'Life, Accidental Death & Permanent Disability - $100k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $100,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $100,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $100,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-100k',
                            display_cost: '24.08 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '48dedc51-a717-437e-88ac-8e76e9e684fb',
                        title:
                          'Life, Accidental Death & Permanent Disability - $200k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $200,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $200,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $200,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-200k',
                            display_cost: '48.14 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'ca518425-2a77-4ef1-aaad-37d21504d5e0',
                        title:
                          'Life, Accidental Death & Permanent Disability - $400k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $400,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $400,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $400,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-400k',
                            display_cost: '96.28 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'ff367cab-d9cb-4aa9-adea-13562a151d7f',
                        title:
                          'Life, Accidental Death & Permanent Disability - $500k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $500,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $500,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $500,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-500k',
                            display_cost: '120.36 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '8ede3bc9-83ec-439d-b141-f75005781976',
                        title:
                          'Life, Accidental Death & Permanent Disability - $600k',
                        'x-jsf-presentation': {
                          description:
                            "Covers Life Insurance, Accidental Death & Dismemberment, and Permanent Disability. \n In the unfortunate event of an employee's demise, their beneficiary will receive a payout equivalent to up to 6 times the employee's annual salary, capped at a maximum of $600,000. In cases of accidental death, dismemberment, or permanent disability, the compensation is equivalent to up to 5 times the employee's annual salary, also with a $600,000 limit. Regardless of the specifics of an incident or an employee's salary, payouts will never exceed $600,000.",
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-global-life-comprehensive-600k',
                            display_cost: '144.43 USD/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'no',
                        title: "I don't want to offer this benefit.",
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
          ],
          properties: {
            filter: {
              default: '73a134db-4743-4d81-a1ec-1887f2240c5c',
              oneOf: [
                {
                  const: '73a134db-4743-4d81-a1ec-1887f2240c5c',
                  title: 'Basic',
                },
                {
                  const: '3a038ee7-5eda-42d5-8113-35336c0a4b52',
                  title: 'Comprehensive',
                },
              ],
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
            value: {
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Life Insurance 2.0',
          type: 'object',
          'x-jsf-order': ['filter', 'value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'life',
            },
          },
        },
        '0e0293ae-eec6-4d0e-9176-51c46eed435e': {
          properties: {
            value: {
              oneOf: [
                {
                  const: '2ad419c1-7f65-4be0-bcb8-94468d01fe6d',
                  title: 'Meal Allowance Standard 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer paid Meal Allowance (4,77 EUR per working day)\nPaid on the payslip together with the salary',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-allowance',
                      display_cost: '~100 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '4b4514ad-689a-4600-94f1-1ca7be871d2b',
                  title: 'Meal Allowance Premium 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer-Paid Meal Allowance with Maximum Exempt Amount: Currently costing €6.00 EUR per worked day.\n\nPaid on the payslip together with the salary',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-allowance-premium',
                      display_cost: '~126 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '601d28b6-efde-4b8f-b9e2-e394792fc594',
                  title: 'Meal Card Standard 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer paid – Meal Card (7,63 EUR per working day)\nPaid through Coverflex',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-card',
                      display_cost: '~160 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
                {
                  const: '9d053f8b-e2c2-4aa3-878d-8af9f3e4e842',
                  title: 'Meal Card Premium 2025',
                  'x-jsf-presentation': {
                    description:
                      '100% Employer-Paid Meal Card with Maximum Exempt Amount: Currently costing €10.20 EUR per worked day.\n\nPaid through Coverflex',
                    meta: {
                      details_url:
                        'https://remote.com/benefits-guide/employee-benefits-portugal-meal-card-premium',
                      display_cost: '~212 EUR/mo',
                      display_cost_disclaimer: null,
                    },
                  },
                },
              ],
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Meal Benefit',
          type: 'object',
          'x-jsf-order': ['value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'meal',
            },
          },
        },
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': {
          allOf: [
            {
              if: {
                properties: {
                  filter: {
                    const: '866c0615-a810-429b-b480-3a4f6ca6157d',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
                        title: 'Basic Health Plan 2025',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, and dental care. Employee covers 20% for dental; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-basic',
                            display_cost: '45.40 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '5c0c0abf-ab5c-44dd-b462-183bd306a1ed',
                        title: 'Standard Health Plan 2025 (Single)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, dental care, and vision. Employee covers 20% for dental and vision; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-standard',
                            display_cost: '51.81 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '09a2a692-c12c-4b42-8f73-6af44e5573e3',
                        title: 'Premium Health Plan 2025 (Single)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee only for hospitalization, childbirth, outpatient services, dental, vision, medications and serious illness. Employee covers 20% for dental, vision, and medications; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-health-premium',
                            display_cost: '76.33 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
            {
              if: {
                properties: {
                  filter: {
                    const: '5fd6b1a5-e453-4d9d-bdcc-ccf7fcb19b2d',
                  },
                },
              },
              then: {
                properties: {
                  value: {
                    oneOf: [
                      {
                        const: 'b31a505f-22cc-4bcc-8f18-101490934495',
                        title: 'Basic Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, and dental care. Employee covers 20% for dental; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-basic-family',
                            display_cost: '~162.74 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: 'bccffede-49fc-47cf-a2b9-ad0defddbc79',
                        title: 'Standard Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, dental care, and vision. Employee covers 20% for dental and vision; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-standard-family',
                            display_cost: '~187.14 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                      {
                        const: '37ef429d-05cc-47b9-993d-280d3dd30bef',
                        title: 'Premium Health Plan 2025 (Family)',
                        'x-jsf-presentation': {
                          description:
                            'Covers the employee and dependents for hospitalization, childbirth, outpatient services, dental, vision, medications and serious illness. Employee covers 20% for dental, vision, and medications; 10% for all other services, with insurer covering the rest.',
                          meta: {
                            details_url:
                              'https://remote.com/benefits-guide/employee-benefits-portugal-premium-family',
                            display_cost: '~276.82 EUR/mo',
                            display_cost_disclaimer: null,
                          },
                        },
                      },
                    ],
                    'x-jsf-errorMessage': {
                      required: 'Please select at least one option.',
                    },
                  },
                },
                required: ['value'],
              },
            },
          ],
          properties: {
            filter: {
              default: '866c0615-a810-429b-b480-3a4f6ca6157d',
              oneOf: [
                {
                  const: '866c0615-a810-429b-b480-3a4f6ca6157d',
                  title: 'Single',
                },
                {
                  const: '5fd6b1a5-e453-4d9d-bdcc-ccf7fcb19b2d',
                  title: 'Family',
                },
              ],
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
            value: {
              type: 'string',
              'x-jsf-errorMessage': {
                required: 'Please select at least one option.',
              },
              'x-jsf-presentation': {
                inputType: 'radio',
              },
            },
          },
          required: ['value'],
          title: 'Health Insurance 2025',
          type: 'object',
          'x-jsf-order': ['filter', 'value'],
          'x-jsf-presentation': {
            inputType: 'fieldset',
            meta: {
              family: 'health',
            },
          },
        },
      },
      required: [
        '0e0293ae-eec6-4d0e-9176-51c46eed435e',
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
        '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      ],
      type: 'object',
      'x-jsf-order': [
        '0e0293ae-eec6-4d0e-9176-51c46eed435e',
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
        '072e0edb-bfca-46e8-a449-9eed5cbaba33',
      ],
      'x-jsf-presentation': {
        benefits_service_fee: {
          amount: 15.0,
          currency: 'USD',
        },
        description:
          'We offer our employees supplemental benefits - Meal and Health Insurance (In partnership with Advance Care/Tranquilidade and Coverflex)',
        fine_print:
          'New: Health Insurance is now optional for new hires in Portugal.\r\nPlease note that all local payroll deductions for required coverages are included in the TCE.\r\nAny pricing changes will be communicated in advance of updated billing.',
        url: 'https://remote.com/benefits-guide/portugal',
      },
    },
  },
};

export const employmentSouthKoreaResponse = {
  data: {
    employment: {
      pricing_plan_details: {
        frequency: 'monthly',
      },
      manager_employment_id: null,
      address_details: null,
      country: {
        code: 'KOR',
        name: 'South Korea',
        alpha_2_code: 'KR',
        supported_json_schemas: [
          'employment_basic_information',
          'emergency_contact',
          'address_details',
          'contract_details',
        ],
      },
      billing_address_details: null,
      short_id: 'NFMRXP',
      files: [],
      onboarding_tasks: {
        administrative_details: {
          status: 'pending',
          description: 'Information we need for tax purposes.',
        },
        address_details: {
          status: 'pending',
          description: 'Primary residence.',
        },
        bank_account_details: {
          status: 'pending',
          description: 'Bank account used for receiving salary payments.',
        },
        contract_details: {
          status: 'completed',
          description:
            'Employee-specific details for their employment agreement.',
        },
        personal_details: {
          status: 'pending',
          description: 'Personal details, such as name and date of birth.',
        },
        billing_address_details: {
          status: 'pending',
          description: "Address associated with the employee's bank account.",
        },
        emergency_contact_details: {
          status: 'pending',
          description: 'Who should be called in an emergency.',
        },
        pricing_plan_details: {
          status: 'completed',
          description:
            'How often Remote will bill employers for management fees.',
        },
        employment_document_details: {
          status: 'pending',
          description: 'We need some additional documents.',
        },
        employment_eligibility: {
          status: 'pending',
          description:
            'We’ll make sure you can work in the country where you live.',
        },
      },
      manager_id: null,
      work_address_details: {
        is_home_address: 'yes',
      },
      user_status: 'created',
      eligible_for_onboarding_cancellation: true,
      basic_information: {
        name: 'Gabriel',
        manager: null,
        email: 'ggarciaseco@gmail.comw',
        job_title: 'pm',
        provisional_start_date: '2025-12-31',
        tax_servicing_countries: ['Bangladesh'],
        work_email: 'gabriel.garcia@remote.com',
        tax_job_category: 'legal',
        has_seniority_date: 'no',
      },
      work_email: 'gabriel.garcia@remote.com',
      full_name: 'Gabriel',
      employment_model: 'eor',
      status: 'created',
      department_id: null,
      job_title: 'pm',
      probation_period_end_date: '2026-03-30',
      administrative_details: null,
      employment_lifecycle_stage: 'employment_creation',
      manager_email: null,
      company_id: 'd65b8272-2a63-4991-9a91-b95290c7083a',
      manager: null,
      user_id: '672fa436-b3c9-4afb-b01a-2a03eff8a5c3',
      updated_at: '2025-12-03T09:02:53',
      contract_details: {
        wage_type: 'salary',
        annual_gross_salary: 50000000000,
        compensation_currency_code: 'KRW',
        available_pto: 23,
        contract_duration_type: 'indefinite',
        equity_compensation: {
          offer_equity_compensation: 'no',
        },
        experience_level:
          'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
        has_bonus: 'no',
        has_commissions: 'no',
        has_signing_bonus: 'no',
        hobong_salary_details: {
          meal_allowance: 0,
        },
        non_compete_and_non_solicitation_period_months: 0,
        notice_period_days: 30,
        notice_period_during_probation_days: 0,
        overtime_hours: 0,
        probation_length: 3,
        role_description:
          'fsddakjsdjkfsjkslfdjfdjlkjkdfsddakjsdjkfsjkslfdjfdjlkjkdfsddakjsdjkfsjkslfdjfdjlkjkdfsddakjsdjkfsjkslfdjfdjlkjkdfsddakjsdjkfsjkslfdjfdjlkjkd',
        saturday_unpaid_paid: 'unpaid',
        work_address: {
          is_home_address: 'yes',
        },
        work_hours_per_week: 40,
        work_schedule: 'full_time',
        work_week_schedule: {
          end_time: '18:00',
          lunch_end_time: '16:00',
          lunch_start_time: '15:00',
          start_time: '09:00',
          working_hours: 40,
        },
      },
      department: null,
      active_contract_id: 'c8a59719-ffa2-4576-bbb4-94d806d66971',
      provisional_start_date: '2025-12-31',
      id: '735b557c-e8ff-44ae-9366-dbf5c0b2a1c6',
      personal_details: null,
      created_at: '2025-12-02T08:28:22',
      termination_date: null,
      type: 'employee',
      seniority_date: null,
      bank_account_details: [],
      external_id: null,
      personal_email: 'ggarciaseco@gmail.comw',
      emergency_contact_details: null,
    },
  },
};

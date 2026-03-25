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

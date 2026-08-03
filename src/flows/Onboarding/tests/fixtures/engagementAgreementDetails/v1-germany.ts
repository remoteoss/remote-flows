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
          maxFileSize: 25600,
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
        title: 'Can the team members in similar roles claim business expenses?',
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
            minimum: 'Must be {{minimum_annual_gross_salary}} EUR or greater.',
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
              content:
                '<p>In this article we will cover the following: </p><ul>\n<li data-list-item-id="eb1ae2d8c3e21863826ec4086d6857488"><a href="#h_01KG5ENR24D5P0YG9M7G4RE213">What is the AÜG?</a></li>\n<li data-list-item-id="e55602ef9759e938b3534b674afa83867"><a href="#h_01KFZPQ2H59XS07DQCXBP09GZ6">What is an Individual Leasing Agreement (Einzelvereinbarung)?</a></li>\n<li data-list-item-id="e93d181f188eeccf36746c8e4c90a9041"><a href="#h_01KFZPQ4Z3VJA5YAS9QZTZY5SZ">Equal Pay &amp; Equal Treatment Principles</a></li>\n<li data-list-item-id="e9933d60e539fd9fb74c8126d78e98bee">\n<a href="#h_01KFZPQ7STWS8SWA1M77QV2G5A">The Concept of Comparability (Vergleichbarkeit)</a><ul>\n<li data-list-item-id="e0244ab52188753a7db8b42ab3916a880"><a href="#h_01KFZKWVHK7P4XKFWFF4MN2KB1">How do you determine comparability?</a></li>\n<li data-list-item-id="e7059a4361052e8e37c58d57030b9510c"><a href="#h_01KFZKWVHMRJ9RWY1RB3EQ0SB7">Why is comparability important?</a></li>\n<li data-list-item-id="e1b18b19f4e164852844682282f1086fb"><a href="#h_01KFZKWVHQB590B4R3VBAPKJ7T">What if no comparable employee exists?</a></li>\n</ul>\n</li>\n<li data-list-item-id="e2cf4af5fdd8010ffa9b5b50b5149aa66"><a href="#h_01KFZPQA3JJAKAWSD03CZDEZ9B">Why does comparability matter for the individual agreement?</a></li>\n</ul><h3 id="h_01KG5ENR24D5P0YG9M7G4RE213">What is the AÜG?</h3><p>The <strong>AÜG (Arbeitnehmerüberlassungsgesetz)</strong> is the German <strong>Employee Leasing Act</strong>. It regulates situations where:</p><ul>\n<li data-list-item-id="ebdfbbe298b311954e9c81c5d75bac969">a <strong>Lessor</strong> (the EOR)</li>\n<li data-list-item-id="eec335877d29a976fe4304540236b8e06">provides an <strong>employee</strong>\n</li>\n<li data-list-item-id="e156a9ef2f086007e4b28fbff75b5e131">to a <strong>Lessee / Hirer</strong> (the client company)</li>\n<li data-list-item-id="e7ed7debfe8bf34f5425898e870b22abb">to work under the hirer’s direction.</li>\n</ul><p>In simple terms: <strong>The employee works at the client company like a full-term employee, but the employment contract is with the EOR.</strong></p><h3 id="h_01KFZPQ2H59XS07DQCXBP09GZ6">What is an Individual Leasing Agreement (Einzelvereinbarung)?</h3><p>The <strong>individual agreement</strong> is the document that:</p><ul>\n<li data-list-item-id="ec5c8ba0a24df6151bf5bfe21493de5b1">names the specific employee</li>\n<li data-list-item-id="e87f162939ebe1f30b577b86b891c485b">defines the start and end of the assignment</li>\n<li data-list-item-id="e361ecd42f08f5233cfa69932ded996e2">describes the job role</li>\n<li data-list-item-id="edc2940d9858ead75e27ffd2e733075ac">sets the working hours</li>\n<li data-list-item-id="e772f86d8c0695ebfe6bc61c60fa43d7d">ensures compliance with Equal Pay / Equal Treatment rules</li>\n</ul><p>It is the legally decisive document for <strong>that specific assignment</strong>.</p><p>Think of it like this:</p><ul>\n<li data-list-item-id="eeb02c9da3992f35cf372198932b4d4e0">The <strong>framework agreement</strong> is the “master contract”.</li>\n<li data-list-item-id="e6866cb1651004679eeeb3b3e1ecc1bc5">The <strong>individual agreement</strong> is the “order form” for each employee.</li>\n</ul><h3 id="h_01KFZPQ4Z3VJA5YAS9QZTZY5SZ">Equal Pay &amp; Equal Treatment Principles</h3><p>The AÜG is built on two core fairness rules:</p><h4 id="h_01KFZKWVHHXTZK992145C0PNKJ">Equal Pay</h4><p>The leased employee must receive <strong>the same pay</strong> as a comparable permanent employee of the client company.</p><p>This includes:</p><ul>\n<li data-list-item-id="e1e7c57137a0f9bd147f2b856d33ba040">base salary</li>\n<li data-list-item-id="e184fde49c04451fb8f12529ec4848521">bonuses</li>\n<li data-list-item-id="e5a9d56024c3b5c1b2462b1f3b38c61eb">allowances</li>\n<li data-list-item-id="e883ce5f1fd1c9250410256edab3004f1">overtime premiums</li>\n<li data-list-item-id="e91b7507186d7d97d1a1a802a4e1af94b">other monetary benefits</li>\n</ul><h4 id="h_01KFZKWVHJ1Y0C75SZSDT4N8QW">Equal Treatment</h4><p>The employee must also receive <strong>the same working conditions</strong> as comparable employees at the client company, such as:</p><ul>\n<li data-list-item-id="e1a23be7d7062056bc2a8f83ab9bb9861">working hours</li>\n<li data-list-item-id="e5a7ac49c71fee001c17b080683402f38">breaks</li>\n<li data-list-item-id="e2ec16aefd1c9d74d3e6cbd8ab2f7623b">access to facilities</li>\n<li data-list-item-id="e80c3512ddb3be63f3d29a40009dff951">holiday entitlements (if company‑specific)</li>\n</ul><p>These rules ensure that temporary workers are not treated as “second‑class employees”.</p><h3 id="h_01KFZPQ7STWS8SWA1M77QV2G5A">The Concept of Comparability (Vergleichbarkeit)</h3><p>To apply Equal Pay and Equal Treatment, you must determine:</p><blockquote><p>Which permanent employee at the client company is comparable to the leased employee?</p></blockquote><p>This is called <strong>comparability</strong>.</p><h4 id="h_01KFZKWVHK7P4XKFWFF4MN2KB1">How do you determine comparability?</h4><p>You look at:</p><ul>\n<li data-list-item-id="e1113a6a0147444e68cfffc6c68e4e6f4">the <strong>tasks</strong> performed</li>\n<li data-list-item-id="e77dc63053601ac29c823ae252592fc7d">the <strong>responsibilities</strong>\n</li>\n<li data-list-item-id="e92fefafc365f278c770b0397ebc02db2">the <strong>required qualifications</strong>\n</li>\n<li data-list-item-id="e744ba680fd9c8267327136983a5a8323">the <strong>experience level</strong>\n</li>\n<li data-list-item-id="ef80279b28d54b207a7d41aa7b6a9256f">the <strong>position within the hierarchy</strong>\n</li>\n</ul><p>The question is:</p><blockquote><p>“If this temporary worker were hired directly by the client company, which job level and pay grade would they receive?”</p></blockquote><h4 id="h_01KFZKWVHMRJ9RWY1RB3EQ0SB7">Why is comparability important?</h4><p>Because it determines:</p><ul>\n<li data-list-item-id="ebc33699b58b7ecdd403c9da1c811ce9f">the <strong>Equal Pay amount</strong>\n</li>\n<li data-list-item-id="e36b7e731ec8416fbd247fc20821af49c">the <strong>Equal Treatment rights</strong>\n</li>\n<li data-list-item-id="e1199c18478c60c1843d371b2e9c83606">whether the assignment is compliant with the AÜG</li>\n<li data-list-item-id="eab3d90eece3b4dc8c27a75273aa49f22">whether the staffing agency or client faces legal risks</li>\n</ul><h4 id="h_01KFZKWVHQB590B4R3VBAPKJ7T">What if no comparable employee exists?</h4><p>Then you use the <strong>company’s internal pay structure</strong> or <strong>collective agreements</strong> to determine the appropriate level.</p><p>Here is an example:</p><p>Then you use the <strong>company’s internal pay structure</strong> or <strong>collective agreements</strong> to determine the appropriate level.</p><p><strong>Candidate to be hired with Remote:</strong></p><p><strong>Employee:</strong> Maria Musterfrau <strong>Role:</strong> IT Support Technician (Leased Employee) <strong>Client Company:</strong> Super Start Up Inc. <strong>Department:</strong> IT Operations <strong>Assignment Start Date:</strong> 1 March 2026 <strong>Role requires:</strong></p><ul>\n<li data-list-item-id="edcc2ecb16fae4b77815dbac4acdf7336">first‑level support</li>\n<li data-list-item-id="ec9062999fa2dc0256662890b2d1cf460">ticket handling</li>\n<li data-list-item-id="eebc6fd5e61eeaf98fcf9ce5ab18ca4ec">basic troubleshooting</li>\n<li data-list-item-id="ec5ec4d6336f27833082c4f089236d0b7">similar responsibility levels</li>\n</ul><p>Check which other roles within IT Operations has similar tasks (e.g. first-level support, ticket handling, etc.), if anyone has:</p><ul>\n<li data-list-item-id="e8472036e2e3a81a28c3ae29793ccf37f">identical task profile</li>\n<li data-list-item-id="ed78739357cdeeaada984f604a0f83bd9">same responsibility level</li>\n<li data-list-item-id="e9a653712bfd591340edc448087ded37c">similar required qualifications</li>\n<li data-list-item-id="e97d4babb25cf366a1e5844da432abe65">same reporting line</li>\n</ul><p>Then this should be the reference employee to look at.</p><h3 id="h_01KFZPQA3JJAKAWSD03CZDEZ9B">Why does comparability matter for the individual agreement?</h3><p>The <strong>individual agreement</strong> must:</p><ul>\n<li data-list-item-id="e974dc1c793606e2739bfe1a9f61c786b">document the job role clearly</li>\n<li data-list-item-id="e6a0888d13f6aeb0f4bdd60ccfb2d49b4">describe the tasks precisely</li>\n<li data-list-item-id="e8b64dc16d429efd5561c8925ed310565">assign the correct pay level</li>\n<li data-list-item-id="ed37ca22e283d861878f2a1f3ec5d7c04">ensure that the employee is not paid less than a comparable permanent employee</li>\n</ul><p>If the comparability assessment is wrong, the consequences can be serious e.g.:</p><ul>\n<li data-list-item-id="edda7a419afd6fa59e02443a8d2c86a75">back payments for Equal Pay</li>\n<li data-list-item-id="e490c35494d234685e2f9d87cacc0cbf8">fines under the AÜG</li>\n</ul><p><span class="wysiwyg-font-size-small"><em><span class="notion-enable-hover" data-token-index="0"><strong>Disclaimer:</strong> Please be advised that the information provided is for general guidance only and should not be considered legal or taxation advice. The Employee Handbook and supporting onboarding guidance provided is not a binding employment contract. Customers and Employees are strongly encouraged to contact the Remote team for expert guidance and assistance in navigating the intricate landscape of employee documentation requirements in need. Consulting with our team is imperative to ensure compliance with local employment standards legislation and is vital in making informed decisions whilst adhering to all relevant regulations. All responsibilities related to workplace policies, including but not limited to diversity and inclusion, background checks, equal opportunity employment and disciplinary actions, rest with the Customer. It is the Customers responsibility to ensure that their policies and practices comply with all applicable laws and regulations. Company policies may be subject to change in the future. This Handbook is updated regularly. Remote does not approve printing or offline copies of this Handbook, as key information may become outdated, potentially leading to misinformed decisions or breaches of employment obligations. Always refer to the live Help Centre version for the most accurate guidance. </span></em></span></p>',
              error: false,
              id: 43002165606541,
              title: 'AÜG - ILA and its context',
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
    'x-rmt-flatFieldsets': {
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
    'x-rmt-meta': {
      jsfVersion: '1',
    },
  },
};

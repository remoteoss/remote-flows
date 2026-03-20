export const contractDetailsSchemaV1SouthKorea = {
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
              description:
                "The minimum annual salary is calculated based on the country's applicable laws.",
              minimum: 2503848000,
              'x-jsf-errorMessage': {
                minimum:
                  'In South Korea, full-time employees are entitled to a minimum annual salary of ₩25,038,480',
              },
            },
          },
        },
      },
      {
        else: {
          properties: {
            hobong_salary_details: false,
            overtime_hours: false,
            saturday_unpaid_paid: false,
          },
          required: ['work_days_for_part_time_worker'],
        },
        if: {
          properties: {
            work_schedule: {
              const: 'full_time',
            },
          },
          required: ['work_schedule'],
        },
        then: {
          else: {
            properties: {
              hobong_salary_details: false,
              holiday_days_for_part_time_worker: false,
              overtime_hours: false,
            },
          },
          if: {
            properties: {
              experience_level: {
                enum: [
                  'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
                  'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
                ],
              },
            },
            required: ['experience_level'],
          },
          required: ['saturday_unpaid_paid'],
          then: {
            required: ['hobong_salary_details'],
          },
        },
      },
      {
        else: {
          properties: {
            holiday_days_for_part_time_worker: false,
            work_days_for_part_time_worker: false,
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
          else: {
            properties: {
              holiday_days_for_part_time_worker: false,
            },
          },
          if: {
            properties: {
              work_hours_per_week: {
                minimum: 15,
              },
            },
          },
          required: ['work_days_for_part_time_worker'],
          then: {
            required: ['holiday_days_for_part_time_worker'],
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
              type: ['string'],
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
        else: {
          properties: {
            notice_period_during_probation_days: {
              minimum: 30,
            },
          },
        },
        if: {
          properties: {
            probation_length: {
              enum: [0, 1, 2, 3],
            },
          },
          required: ['probation_length'],
        },
        then: {
          properties: {
            notice_period_during_probation_days: {
              const: 0,
              default: 0,
              'x-jsf-presentation': {
                statement: {
                  title: 'Notice period in days during probation',
                },
              },
            },
          },
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
              'x-jsf-presentation': {
                statement: {
                  description:
                    'Please note that due to labor laws in South Korea, it is very difficult to terminate indefinite agreements without just cause. We recommend a fixed-term contract. Fixed-term contracts must be limited to two years in total, and employees will be considered as permanent employees after two years.',
                  severity: 'warning',
                },
              },
            },
          },
        },
      },
      {
        else: {
          properties: {
            work_hours_per_week: {
              maximum: 52,
              minimum: 40,
            },
          },
        },
        if: {
          properties: {
            work_schedule: {
              const: 'part_time',
            },
          },
        },
        then: {
          properties: {
            work_hours_per_week: {
              maximum: 39,
              minimum: 15,
            },
          },
        },
      },
    ],
    properties: {
      allowances: {
        description:
          'Let us know what each allowance covers and its monthly amount. If you’re not offering allowances, you can skip this field.',
        maxLength: 1000,
        title: 'Allowances',
        type: ['string', 'null'],
        'x-jsf-presentation': {
          inputType: 'textarea',
        },
      },
      annual_gross_salary: {
        description:
          'The Employee’s salary will be based on the number of days worked and weekly paid holiday (including fractions thereof) in a month. Salary for the part-time worker must be computed to account for (i) the salary for the working hours during the week plus (ii) one day of paid holiday during the week.',
        title: 'Annual gross salary',
        type: 'integer',
        'x-jsf-errorMessage': {
          type: 'Please, use US standard currency format. Ex: 1024.12',
        },
        'x-jsf-logic-computedAttrs': {
          minimum: 'minimum_annual_gross_salary_in_cents',
          'x-jsf-errorMessage': {
            minimum:
              'In South Korea, part-time employees are entitled to a minimum annual salary of ₩{{ minimum_annual_gross_salary }}',
          },
        },
        'x-jsf-presentation': {
          currency: 'KRW',
          inputType: 'money',
        },
      },
      available_pto: {
        description:
          'In South Korea, employees are entitled to between 15 to 25 per year. If this is a new employee, we recommend 15.',
        title: 'Number of paid time off days',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
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
          currency: 'KRW',
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
              content:
                '<p>There are two types of contracts available:</p>\n<ul>\n<li>Fixed-term contract: This is a contract that has an end date. This means that towards the end of the contract, it will need to be renewed if you intend to keep the employee hired through us. In some countries, t<span class="notion-semantic-string">he minimum contract duration is 6 months.</span>\n</li>\n<li>Indefinite contract: This is a contract with no end date and therefore, no renewal is needed.</li>\n</ul>\n<p data-pm-slice="1 3 []">Indefinite and fixed-term contracts can be:</p>\n<ul class="ProsemirrorEditor-list">\n<li class="ProsemirrorEditor-listItem" data-list-indent="1" data-list-type="bulleted">\n<p>Part-time: <span style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;">This is </span>a form of employment that <strong>carries fewer hours per week than a full-time job</strong><span style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;">. Depending on the country, workers are considered to be part-time if they commonly work fewer than 30 or 35 hours per week.</span></p>\n</li>\n<li class="ProsemirrorEditor-listItem" data-list-indent="1" data-list-type="bulleted">\n<p>Full-time.</p>\n</li>\n</ul>',
              error: false,
              id: 4410443814157,
              title: 'Types of employment contracts',
            },
          },
        },
      },
      contract_end_date: {
        format: 'date',
        maxLength: 255,
        title: 'Contract end date',
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'date',
          minDate: '2025-12-31',
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
                amount: 39.0,
              },
              discount: null,
              calculated: {
                currency: 'USD',
                amount: 39.0,
              },
            },
            helpCenter: {
              callToAction: 'Learn more about equity management at Remote',
              content:
                '<p>Remote Equity Essentials is a lightweight compliance tool designed to help you manage equity grants across borders for team members hired through Remote\'s Employer of Record (EOR).</p><p>Whether you’re managing vesting, reporting exercises, or navigating local tax laws, Remote Equity Essentials gives you the structure to stay compliant, avoid risk, and support your team across borders.</p><h4 id="h_01K0YQSYJ8JPKYXNNNW90B0QJP">Why it matters</h4><p>As your EOR, <strong>Remote is legally responsible</strong> for equity-related tax and reporting in the countries where your team members are employed. That means we don’t just track equity, we:</p><ul>\n<li>Withhold and report taxes when required</li>\n<li>File with local tax authorities</li>\n<li>Support team members with clear guidance on their tax responsibilities</li>\n</ul><p>Most equity platforms can’t do that because they’re not the legal employer. <strong>Remote Equity Essentials ensures we have the data we need, when we need it, to keep your company compliant and your team fairly rewarded.</strong></p><p>Behind the scenes, our tax team:</p><ul>\n<li>Handles tax withholdings when taxable events occur</li>\n<li>Provides guidance to you and your team, even when no withholding is required</li>\n<li>Manages additional reporting where local laws demand it</li>\n</ul><p>See also: <a href="https://support.remote.com/hc/en-us/articles/37710493624589-What-types-of-equity-grants-should-I-declare-in-Remote-Equity-Essentials">What types of equity grants should I declare in Remote Equity Essentials?</a></p><h4 id="h_01K0YQSYJDJ3JYC1C642ASB8E2">What’s included</h4><p>Remote Equity Essentials provides:</p><ul>\n<li>\n<strong>Tracking and alerts</strong> for events that may create a tax obligation (like vesting or exercising)</li>\n<li>\n<strong>Automated compliance reminders</strong> based on local deadlines and regulations</li>\n<li>\n<strong>Localized guidance for team members</strong>, shared through the Remote Equity app</li>\n<li>\n<strong>Support from Remote’s tax and legal teams</strong>, who handle obligations on your behalf</li>\n</ul><p>Looking for more automation or Carta integration? Learn about <a href="https://support.remote.com/hc/en-us/articles/35671831035917-How-can-I-upgrade-to-Remote-Equity-Advanced">Remote Equity Advanced</a>.</p><h4 id="h_01K0YQSYJSCK6XYBXF3Q56KRC8"><strong>Get started in minutes</strong></h4><p>Setup takes less than five minutes. Just log in to your Remote account, and launch the Equity App to follow the setup steps.</p><p>Helpful guides to get started:</p><ul>\n<li><a href="https://support.remote.com/hc/en-us/articles/37547625350925-How-can-I-access-Remote-Equity-Essentials">How can I access Remote Equity Essentials?</a></li>\n<li><a href="https://support.remote.com/hc/en-us/articles/35577980536589">How do I declare a grant?</a></li>\n<li><a href="https://support.remote.com/hc/en-us/articles/35671968187149-How-can-my-employees-see-their-equity-information">How can my team access their equity information?</a></li>\n<li><a href="https://support.remote.com/hc/en-us/articles/35546454220301-What-happens-if-I-already-declared-equity-before-using-Remote-Equity-Essentials">What happens if I already declared equity before using Remote Equity Essentials?</a></li>\n</ul><h4 id="h_01K0YQSYJV9EH2AQ9HWYS1826S"><span class="wysiwyg-underline">Frequently Asked Questions (FAQs)</span></h4><p><strong>Who needs to use Remote Equity Essentials?</strong></p><p>Any Remote customer granting equity to a team member hired through Remote’s EOR must use Remote Equity Essentials to meet local compliance requirements.</p><p><strong>Why can’t we just use our own equity tool?</strong></p><p>Traditional equity tools track grants and vesting, but they don\'t file taxes, withhold contributions, or report income to local authorities. Remote, as the legal employer, is responsible for these actions. Remote Equity Essentials ensures those obligations are covered.</p><p><strong>What happens if we don’t use it?</strong></p><p>If Remote doesn’t receive timely and accurate equity data, required filings may be missed. This can result in compliance risks, unexpected tax liabilities, and issues for both your company and your team members.</p><p><strong>How much does Remote Equity Essentials cost?</strong></p><p>Remote Equity Essentials costs 39 USD per month for each EOR team member with equity. <a href="https://support.remote.com/hc/en-us/articles/35546441948685-How-much-does-Remote-Equity-Essentials-cost">Learn more</a>.</p><p>For comprehensive information, visit the <a href="https://support.remote.com/hc/en-us/sections/35546215243661-Remote-Equity-Essentials" tabindex="0" data-token-index="1" rel="noopener noreferrer">Remote Equity Essentials hub</a>.</p>',
              error: false,
              id: 38303424407821,
              title:
                'Welcome to Remote Equity Essentials: Global equity, without the compliance headaches',
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
              content:
                '<p><span class="sc-c090059b-0 fISxvo">We do not include bonus specifics in the employment agreement. However, you can create a bonus directly on the platform.</span></p>\n<p><span class="sc-c090059b-0 fISxvo">Please note that if you decide to offer other bonuses, it will be difficult or impossible to withdraw these bonuses if you change your mind later.</span></p>',
              error: false,
              id: 18019142406029,
              title: 'Other bonuses',
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
      hobong_salary_details: {
        properties: {
          meal_allowance: {
            description: 'In KRW.',
            minimum: 0,
            title: 'Meal allowance per month',
            type: 'integer',
            'x-jsf-errorMessage': {
              type: 'Please, use US standard currency format. Ex: 1024.12',
            },
            'x-jsf-presentation': {
              currency: 'KRW',
              inputType: 'money',
            },
          },
          other_allowances: {
            description: 'Any other allowances your company offers employees.',
            minimum: 0,
            title: 'Other allowances',
            type: ['integer', 'null'],
            'x-jsf-errorMessage': {
              type: 'Please, use US standard currency format. Ex: 1024.12',
            },
            'x-jsf-presentation': {
              currency: 'KRW',
              inputType: 'money',
            },
          },
          overtime_allowance: {
            description:
              'This is a fixed monthly amount to compensate for extra work.',
            minimum: 0,
            title: 'Overtime allowance',
            type: ['integer', 'null'],
            'x-jsf-errorMessage': {
              type: 'Please, use US standard currency format. Ex: 1024.12',
            },
            'x-jsf-presentation': {
              currency: 'KRW',
              inputType: 'money',
            },
          },
        },
        required: ['meal_allowance'],
        title: 'Fixed allowances',
        type: 'object',
        'x-jsf-order': [
          'meal_allowance',
          'overtime_allowance',
          'other_allowances',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
      holiday_days_for_part_time_worker: {
        description:
          'Part-time employees who work more than 15 hours per week are entitled to weekly paid days off.',
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
            {
              const: 'sunday',
              title: 'Sunday',
            },
          ],
        },
        title: 'Holiday days',
        type: 'array',
        uniqueItems: true,
        'x-jsf-presentation': {
          inputType: 'select',
          placeholder: 'Select...',
        },
      },
      non_compete_and_non_solicitation_period_months: {
        description:
          'How many months should the non-compete clause last after termination of the employment agreement?\n\nNon-compete clauses may be enforceable under Korean law. There is no legally provided maximum for non-compete/non-solicitation obligations.',
        minimum: 0,
        title: 'Non-compete and non-solicitation period (months)',
        type: 'number',
        'x-jsf-presentation': {
          description:
            'How many months should the non-compete clause last after termination of the employment agreement?<br><br>Non-compete clauses may be enforceable under Korean law. There is no legally provided maximum for non-compete/non-solicitation obligations.',
          inputType: 'number',
        },
      },
      notice_period_days: {
        description:
          'In South Korea, notice period tends to be 30 days, however this can be longer than 30 days if the employee agrees to it.',
        minimum: 30,
        title: 'Notice period in days after probation',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      notice_period_during_probation_days: {
        description:
          "Probation periods of 3 months or less don't require a notice period.",
        minimum: 0,
        title: 'Notice period in days during probation',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
        },
      },
      overtime_hours: {
        description:
          'Estimated number of hours per month this employee will work overtime, at night, or during holidays.',
        minimum: 0,
        title: 'Number of overtime hours per month',
        type: ['integer', 'null'],
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
          'We recommend less than 3 months. You can make them longer but probation periods of more than 3 months must include a 30 day notice period.',
        minimum: 0,
        title: 'Probation period in months',
        type: 'number',
        'x-jsf-presentation': {
          inputType: 'number',
          meta: {
            helpCenter: {
              callToAction: 'Learn about probation period',
              content:
                '<p>The purpose of a probationary period is to allow a specific time period for the employee and company to assess suitability for the role after having first-hand experience. On the one hand, it gives the company the opportunity to assess objectively whether the new employee is suitable for the job, considering their capability, skills, performance, attendance and general conduct.</p>\n<p>During the probation period, it is typically simpler to terminate an employee that is underperforming. Often, standard notice periods do not apply or may be shortened. Depending on the employee’s country of residence, it may be more difficult and costly to terminate an employee after their probation period is over.</p>\n<p><span class="notion-enable-hover" data-token-index="0">Please be aware that if you do not elect to implement a probationary period and later conduct a background check during the onboarding process, </span>Remote cannot unilaterally terminate employment following the receipt of unsatisfactory background check results<span class="notion-enable-hover" style="font-weight: 600;" data-token-index="2">.</span><!-- notionvc: 689a1f6e-271d-4ae3-9a37-8506a098847c --></p>\n<p><span class="notion-enable-hover" style="font-weight: 600;" data-token-index="2"><strong style="box-sizing: border-box; font-weight: bold; color: #525f7f; font-family: Inter, -apple-system, \' system-ui\' , \' Segoe UI\' , Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: #ffffff; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">See also:</strong><span style="color: #525f7f; font-family: Inter, -apple-system, \' system-ui\' , \' Segoe UI\' , Helvetica, Arial, sans-serif; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: #ffffff; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;"> <a href="https://support.remote.com/hc/en-us/articles/9013403125773">How do I include a probationary period in the employee\'s contract?</a></span></span></p>',
              error: false,
              id: 19858883586445,
              title:
                "Why is it important to include a probationary period in an employee's contract?",
            },
          },
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
      saturday_unpaid_paid: {
        description:
          'When the 40-hour workweek system is implemented in the form of five-day workweek system, one of the remaining two days will be designated as paid weekly holidays. The employment agreement needs to clearly stipulate the nature of the remaining one day as either an unpaid off-day or paid holiday.',
        oneOf: [
          {
            const: 'unpaid',
            title: 'Unpaid off-day',
          },
          {
            const: 'paid',
            title: 'Paid holiday',
          },
        ],
        title: 'Treatment of Saturday',
        type: 'string',
        'x-jsf-presentation': {
          direction: 'row',
          inputType: 'radio',
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
          currency: 'KRW',
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
      work_days_for_part_time_worker: {
        description:
          'Please add all standard days that the worker will be working for their part-time shifts.',
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
            {
              const: 'sunday',
              title: 'Sunday',
            },
          ],
        },
        title: 'Work days',
        type: 'array',
        uniqueItems: true,
        'x-jsf-presentation': {
          inputType: 'select',
          placeholder: 'Select...',
        },
      },
      work_hours_per_week: {
        description: 'Total for the work week schedule and work days selected.',
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
      work_week_schedule: {
        description:
          'South Korean law requires that the company stipulate the working days and working hours (including the time when work starts and the time when work ends). An employer must allow its employees a recess of not less than 30 minutes for four consecutive hours or a recess of not less than one hour for eight consecutive hours of work performed during work hours.',
        properties: {
          end_time: {
            title: 'End time',
            type: 'string',
          },
          lunch_end_time: {
            title: 'Lunch end time',
            type: 'string',
          },
          lunch_start_time: {
            title: 'Lunch start time',
            type: 'string',
          },
          start_time: {
            title: 'Start time',
            type: 'string',
          },
          working_hours: {
            default: 0,
            title: 'Working hours',
            type: 'number',
          },
        },
        required: [
          'start_time',
          'end_time',
          'lunch_start_time',
          'lunch_end_time',
          'working_hours',
        ],
        title: 'Work week schedule',
        type: 'object',
        'x-jsf-order': [
          'start_time',
          'end_time',
          'lunch_start_time',
          'lunch_end_time',
          'working_hours',
        ],
        'x-jsf-presentation': {
          inputType: 'fieldset',
        },
      },
    },
    required: [
      'annual_gross_salary',
      'available_pto',
      'contract_duration_type',
      'experience_level',
      'equity_compensation',
      'has_bonus',
      'has_commissions',
      'has_signing_bonus',
      'non_compete_and_non_solicitation_period_months',
      'notice_period_days',
      'notice_period_during_probation_days',
      'probation_length',
      'role_description',
      'work_address',
      'work_hours_per_week',
      'work_schedule',
      'work_week_schedule',
    ],
    type: 'object',
    'x-jsf-fieldsets': {
      annual_gross_salary_fieldset: {
        propertiesByName: [
          'work_week_schedule',
          'work_days_for_part_time_worker',
          'work_hours_per_week',
        ],
        title: 'Work schedule',
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
                          10030.0,
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
                              10030.0,
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
                          1003000,
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
                              1003000,
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
      },
    },
    'x-jsf-order': [
      'contract_duration',
      'contract_duration_type',
      'contract_end_date',
      'work_schedule',
      'work_week_schedule',
      'work_days_for_part_time_worker',
      'work_hours_per_week',
      'holiday_days_for_part_time_worker',
      'experience_level',
      'overtime_hours',
      'probation_length',
      'notice_period_during_probation_days',
      'notice_period_days',
      'available_pto',
      'role_description',
      'work_address',
      'hobong_salary_details',
      'allowances',
      'annual_gross_salary',
      'part_time_salary_confirmation',
      'saturday_unpaid_paid',
      'has_signing_bonus',
      'signing_bonus_amount',
      'has_bonus',
      'bonus_amount',
      'bonus_details',
      'has_commissions',
      'commissions_details',
      'commissions_ack',
      'equity_compensation',
      'non_compete_and_non_solicitation_period_months',
    ],
  },
};


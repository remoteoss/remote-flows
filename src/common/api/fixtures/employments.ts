export const mockBenefitOffersResponse = {
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

export const mockBenefitOffersSchema = {
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

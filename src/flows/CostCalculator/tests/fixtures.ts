export const countries = {
  data: [
    {
      code: 'POL',
      name: 'Poland',
      currency: {
        code: 'PLN',
        name: 'Polish Zloty',
        symbol: 'zł',
        slug: 'pln-33441af1-a601-4a22-8f52-1ec090f10b4a',
      },
      region_slug: 'POL',
      child_regions: [],
      has_additional_fields: false,
      availability: 'active',
      original_country_slug: 'poland-d3f6d510-2fdf-4b9d-8520-2b581a862411',
    },
    {
      code: 'ESP',
      name: 'Spain',
      currency: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        slug: 'eur-33441af1-a601-4a22-8f52-1ec090f10b4a',
      },
      region_slug: 'ESP',
      child_regions: [
        {
          slug: 'AST',
          name: 'Asturias',
        },
        {
          slug: 'CAN',
          name: 'Canary Islands',
        },
      ],
      has_additional_fields: true,
      availability: 'active',
      original_country_slug: 'spain-d3f6d510-2fdf-4b9d-8520-2b581a862411',
    },
  ],
};

export const currencies = {
  data: {
    company_currencies: [
      {
        code: 'USD',
        slug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      },
      {
        code: 'EUR',
        slug: 'eur-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      },
    ],
  },
};

export const regionFields = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {},
      required: [],
      type: 'object',
    },
  },
};

export const regionFieldsWithAgeProperty = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        age: {
          description: 'The age of the employee, eg. 30',
          minimum: 0,
          title: 'Age',
          type: 'number',
          'x-jsf-presentation': {
            inputType: 'number',
          },
        },
        benefits: {
          description:
            "<div><a href='https://remote.com/benefits-guide/japan' target='_blank'>Learn more about benefits in Japan</a></div>",
          properties: {
            'benefit-53c5fc69-f299-47e7-9004-86def3f0e845': {
              description:
                'In Japan, employers have the option to offer Life Insurance.',
              oneOf: [
                {
                  const: '8a32160f-62cb-4fd7-b90a-47b92e8bb734',
                  title: 'Option 1 - 5.64 USD/mo',
                },
                {
                  const: '91a8c40d-827c-4c32-8bfb-1b1adb1ec1b3',
                  title: 'Option 2 - 11.28 USD/mo',
                },
              ],
              title: 'Life Insurance',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
            'benefit-b5b325b7-f997-4679-9e63-bd77d8d1ed1f': {
              description:
                'In Japan, employers have the option to offer Health Insurance.',
              oneOf: [
                {
                  const: 'df47a18f-ee55-4fd8-ab53-9eefe937c4e1',
                  title: 'Option 1 - 113 USD/mo',
                },
                {
                  const: 'c3ddd270-ab1d-4b5a-9979-bfb1e5835818',
                  title: 'Option 2 - 142 USD/mo',
                },
              ],
              title: 'Health Insurance',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
          },
          required: [
            'benefit-53c5fc69-f299-47e7-9004-86def3f0e845',
            'benefit-b5b325b7-f997-4679-9e63-bd77d8d1ed1f',
          ],
          title: 'Benefits',
          type: 'object',
          'x-jsf-order': [
            'benefit-53c5fc69-f299-47e7-9004-86def3f0e845',
            'benefit-b5b325b7-f997-4679-9e63-bd77d8d1ed1f',
          ],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
      },
      required: ['age'],
      type: 'object',
      'x-jsf-order': ['age'],
    },
  },
};

export const regionFieldsWithContractDurationTypeProperty = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        benefits: {
          properties: {
            'benefit-10cc0dfe-e4b3-4c88-b5b1-3830deb57439': {
              description:
                'In United Kingdom (UK), employers have the option to offer Business Travel Insurance.',
              oneOf: [
                {
                  const: 'a0ac3a03-f531-439a-afac-655a2518ea59',
                  title: 'Basic Business Travel - 11.45 USD/mo',
                },
                {
                  const: '839dd7a2-06b3-4340-b340-b687ac778c50',
                  title: 'Standard Business Travel - 11.57 USD/mo',
                },
                {
                  const: '82298b17-8b1a-4426-819f-38844b49edb1',
                  title: 'Premium Business Travel - 14.47 USD/mo',
                },
                {
                  const: 'aa6ae86e-e98b-41c9-9cae-f0c3bc7dc95c',
                  title: 'Standard Plus Business Travel - 17.59 USD/mo',
                },
                {
                  const: '93104787-922b-4254-b533-713ca156b362',
                  title: 'Premium Plus Business Travel - 21.77 USD/mo',
                },
                {
                  const: 'none',
                  title: "I don't want to offer this benefit",
                },
              ],
              title: 'Business Travel Insurance',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
            'benefit-5a04bad9-5b61-44a7-87ee-e0730e7e65cf': {
              description:
                'In United Kingdom (UK), employers have the option to offer Mental Health Program.',
              oneOf: [
                {
                  const: 'a79142f1-961e-43d7-bf1b-40b211355263',
                  title: 'Basic Mental Health Program - 3.00 USD/mo',
                },
                {
                  const: '89f923ba-9386-483a-8cf9-5cde5b8ec992',
                  title: 'Standard Mental Health Program - 8.47 USD/mo',
                },
                {
                  const: 'b9505b38-7ee2-4855-a2bb-dc4d305da00a',
                  title: 'Plus Mental Health Program - 15.70 USD/mo',
                },
                {
                  const: '7486a013-c744-496b-b3b6-58e088d295a3',
                  title: 'Premium Mental Health Program - 22.70 USD/mo',
                },
                {
                  const: '9f9dd82c-7c31-4d41-a0e0-a8bdbfc13ccb',
                  title: 'Platinum Mental Health Program - 35.83 USD/mo',
                },
                {
                  const: 'none',
                  title: "I don't want to offer this benefit",
                },
              ],
              title: 'Mental Health Program',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
            'benefit-d3a025de-fe28-4d78-811f-79ad13bf3608': {
              description:
                'In United Kingdom (UK), employers have the option to offer Health Insurance.',
              oneOf: [
                {
                  const: '24e3ae31-2288-4742-addc-86e43fcf8749',
                  title:
                    'Single - Allianz Standard (Employee Only) - 123.17 USD/mo',
                },
                {
                  const: '5cca44e3-3b32-4f85-89f8-5c146d88acd2',
                  title:
                    'Single - Allianz Premium (Employee Only) - 157.08 USD/mo',
                },
                {
                  const: '9b86919c-fb1c-48da-ae5a-3cc6bfe51e24',
                  title:
                    'Single - Allianz Gold (Employee Only) - 186.83 USD/mo',
                },
                {
                  const: '81690afd-e571-4b7b-9d6e-110aaa036045',
                  title:
                    'Single - Allianz Platinum (Employee Only) - 206.50 USD/mo',
                },
                {
                  const: '9b7a8666-44a3-4ace-9fa1-abb28834151b',
                  title:
                    'Family - Allianz Standard (Family) - 184.75 - 369.50 USD/mo',
                },
                {
                  const: '1091069d-4786-4996-a55d-c02f4d0dff43',
                  title:
                    'Family - Allianz Premium (Family) - 235.63 - 471.25 USD/mo',
                },
                {
                  const: '8fdd07c6-fab4-4153-ba22-25f32eb66f6e',
                  title:
                    'Family - Allianz Gold (Family) - 280.25 - 560.50 USD/mo',
                },
                {
                  const: '213a31b0-cf7a-4efc-8634-9f273778e23a',
                  title:
                    'Family - Allianz Platinum (Family) - 309.75 - 619.50 USD/mo',
                },
                {
                  const: 'none',
                  title: "I don't want to offer this benefit",
                },
              ],
              title: 'Health Insurance',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
            'benefit-da3b0adf-9f61-41e7-8b7d-0008df7c7f24': {
              description:
                'In United Kingdom (UK), employers have the option to offer Life Insurance.',
              oneOf: [
                {
                  const: 'c4865800-02df-4673-b7e7-6a93cc157cfe',
                  title: 'Basic - Life Insurance - $50K - 5.64 USD/mo',
                },
                {
                  const: '65db8438-380d-4599-b9a5-30d55126ecde',
                  title: 'Basic - Life Insurance - $100K - 11.28 USD/mo',
                },
                {
                  const: 'a213b7cd-9abb-4da9-bc5a-71db41e55e78',
                  title: 'Basic - Life Insurance - $200K - 22.56 USD/mo',
                },
                {
                  const: '0230c2a9-28a1-4b65-8097-17e45efb6f51',
                  title: 'Basic - Life Insurance - $400K - 45.12 USD/mo',
                },
                {
                  const: '002939bf-f7bd-4da9-b59c-5a517bd82567',
                  title: 'Basic - Life Insurance - $500K - 56.40 USD/mo',
                },
                {
                  const: '1ae5034e-a979-4aec-a70c-1de0cd4379e6',
                  title: 'Basic - Life Insurance - $600K - 67.68 USD/mo',
                },
                {
                  const: '20a590c4-6b13-47c4-9c19-8aa2e15a56cd',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $50k - 12.04 USD/mo',
                },
                {
                  const: '86f3b1d4-1c07-4913-9fb8-29ccb9292eb0',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $100k - 24.08 USD/mo',
                },
                {
                  const: 'be94f915-5b5a-4d53-a849-f166b3115ac2',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $200k - 48.14 USD/mo',
                },
                {
                  const: 'eca72989-e934-48f2-8f04-8052c3cf7060',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $400k - 96.28 USD/mo',
                },
                {
                  const: '734ae801-7685-4749-8d45-a3630415f5ba',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $500k - 120.36 USD/mo',
                },
                {
                  const: 'e15a62e1-0828-42ad-bd0c-9b233904491a',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $600k - 144.43 USD/mo',
                },
                {
                  const: 'none',
                  title: "I don't want to offer this benefit",
                },
              ],
              title: 'Life Insurance',
              type: 'string',
              'x-jsf-presentation': {
                inputType: 'select',
              },
            },
          },
          required: [
            'benefit-da3b0adf-9f61-41e7-8b7d-0008df7c7f24',
            'benefit-d3a025de-fe28-4d78-811f-79ad13bf3608',
            'benefit-5a04bad9-5b61-44a7-87ee-e0730e7e65cf',
            'benefit-10cc0dfe-e4b3-4c88-b5b1-3830deb57439',
          ],
          title: 'Benefits',
          type: 'object',
          'x-jsf-order': [
            'benefit-da3b0adf-9f61-41e7-8b7d-0008df7c7f24',
            'benefit-d3a025de-fe28-4d78-811f-79ad13bf3608',
            'benefit-5a04bad9-5b61-44a7-87ee-e0730e7e65cf',
            'benefit-10cc0dfe-e4b3-4c88-b5b1-3830deb57439',
          ],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
        contract_duration_type: {
          description:
            'Select the type of contract that applies to this employee',
          enum: ['fixed', 'indefinite'],
          title: 'Contract duration',
          'x-jsf-presentation': {
            inputType: 'radio',
            options: [
              {
                label: 'Indefinite',
                value: 'indefinite',
              },
              {
                label: 'Fixed Term',
                value: 'fixed',
              },
            ],
            placeholder: 'Select the contract type',
          },
        },
      },
      required: ['contract_duration_type'],
      type: 'object',
      'x-jsf-order': ['benefits', 'contract_duration_type'],
    },
  },
};

export const estimation = {
  data: {
    employments: [],
  },
};

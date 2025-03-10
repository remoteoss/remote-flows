export const benefitsJsonSchema = {
  data: {
    version: 7,
    schema: {
      additionalProperties: false,
      properties: {
        benefits: {
          properties: {
            'benefit-11691783-1263-4bac-a43b-66da276b1774': {
              description:
                'In Albania, employers have the option to offer Life Insurance.',
              oneOf: [
                {
                  const: 'c7bc3b73-3f0c-4752-b724-1e2cc8cf2ccd',
                  title: 'Basic - Life Insurance - $50K - 5.64 USD/mo',
                },
                {
                  const: '6c612c10-29b0-451e-87c3-a63e8097181e',
                  title: 'Basic - Life Insurance - $100K - 11.28 USD/mo',
                },
                {
                  const: 'ec53a412-8587-4fb8-b441-b91b3794f188',
                  title: 'Basic - Life Insurance - $200K - 22.56 USD/mo',
                },
                {
                  const: 'ee33203b-39bd-40c9-9476-ac7b323ea472',
                  title: 'Basic - Life Insurance - $400K - 45.12 USD/mo',
                },
                {
                  const: 'a717c99e-0b5e-471a-9ce9-3913fc8697e5',
                  title: 'Basic - Life Insurance - $500K - 56.40 USD/mo',
                },
                {
                  const: '4623fdb8-bc17-46ea-8a59-c6a5f89dc76b',
                  title: 'Basic - Life Insurance - $600K - 67.68 USD/mo',
                },
                {
                  const: '836623ba-258d-4ee8-821f-8c7475212d3e',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $50k - 12.04 USD/mo',
                },
                {
                  const: '740651e2-3f46-47f0-b226-a1ccb114d720',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $100k - 24.08 USD/mo',
                },
                {
                  const: 'ddd4c672-b753-4e2d-a9e5-5fcc87425177',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $200k - 48.14 USD/mo',
                },
                {
                  const: 'dcfb50e3-2006-4efd-8a82-10d11f244b92',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $400k - 96.28 USD/mo',
                },
                {
                  const: 'fe66a611-248f-4f5e-ad41-7c7b1d0ea6a4',
                  title:
                    'Comprehensive - Life, Accidental Death & Permanent Disability - $500k - 120.36 USD/mo',
                },
                {
                  const: 'dd93c7d4-a22c-4778-a243-9c942e9eb611',
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
            'benefit-958a21ef-af67-4984-a43c-e70fea259953': {
              description:
                'In Albania, employers have the option to offer Health Insurance.',
              oneOf: [
                {
                  const: 'b9553995-fff6-4264-b579-8b74be1612b1',
                  title:
                    'Single - Allianz Standard 2024 (Employee Only) - 113 USD/mo',
                },
                {
                  const: '4b7935fb-dbb0-4f0b-917a-5e5685dbeb09',
                  title:
                    'Single - Allianz Premium 2024 (Employee Only) - 142 USD/mo',
                },
                {
                  const: '904e89f1-c8c5-4b90-8f1e-e280d032b6f3',
                  title:
                    'Family - Allianz Standard 2024 (Family) - 166 USD - 326 USD/mo',
                },
                {
                  const: 'dbb74dc8-0db9-47ee-9536-09c7ebf8233d',
                  title:
                    'Family - Allianz Premium 2024 (Family) - 210 USD - 414 USD/mo',
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
            'benefit-db9e2816-2029-4f23-9bf8-5b8f82288cb7': {
              description:
                'In Albania, employers have the option to offer Business Travel Insurance.',
              oneOf: [
                {
                  const: '5c7a629b-1fcd-43dc-87fa-9ed9c57db1be',
                  title: 'Basic Business Travel - 11.45 USD/mo',
                },
                {
                  const: '53c01443-1aaf-4c02-9862-46debc2c5854',
                  title: 'Standard Business Travel - 11.57 USD/mo',
                },
                {
                  const: '4ab760e3-5d0c-4316-8413-80d771d82c81',
                  title: 'Premium Business Travel - 14.47 USD/mo',
                },
                {
                  const: '36f9b055-ca3e-49f5-98a7-47949f7c97c7',
                  title: 'Standard Plus Business Travel - 17.59 USD/mo',
                },
                {
                  const: '83ddc329-764f-4866-9a51-aa7a755c0368',
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
            'benefit-eb69385b-b3a2-4a92-8a8a-5fab0d09b4a0': {
              description:
                'In Albania, employers have the option to offer Mental Health Program.',
              oneOf: [
                {
                  const: '60a90198-a72c-478f-be94-799a85367595',
                  title: 'Basic Mental Health Program - 3.00 USD/mo',
                },
                {
                  const: 'b64abcbd-25dd-4e80-acd5-a0448816fea1',
                  title: 'Standard Mental Health Program - 8.47 USD/mo',
                },
                {
                  const: 'cdc3c161-1d94-4b50-b292-cf26f5235b2e',
                  title: 'Plus Mental Health Program - 15.70 USD/mo',
                },
                {
                  const: 'e11c2b03-0a9d-4a8a-87a5-a3750dccd755',
                  title: 'Premium Mental Health Program - 22.70 USD/mo',
                },
                {
                  const: '7bb050a3-87ae-4bca-9e0f-105829748440',
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
          },
          required: [
            'benefit-11691783-1263-4bac-a43b-66da276b1774',
            'benefit-958a21ef-af67-4984-a43c-e70fea259953',
            'benefit-eb69385b-b3a2-4a92-8a8a-5fab0d09b4a0',
            'benefit-db9e2816-2029-4f23-9bf8-5b8f82288cb7',
          ],
          title: 'Benefits',
          type: 'object',
          'x-jsf-order': [
            'benefit-11691783-1263-4bac-a43b-66da276b1774',
            'benefit-958a21ef-af67-4984-a43c-e70fea259953',
            'benefit-eb69385b-b3a2-4a92-8a8a-5fab0d09b4a0',
            'benefit-db9e2816-2029-4f23-9bf8-5b8f82288cb7',
          ],
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
      },
      required: [],
      type: 'object',
      'x-jsf-order': ['benefits'],
    },
  },
};

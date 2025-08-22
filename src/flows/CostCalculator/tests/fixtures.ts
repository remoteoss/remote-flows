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
          slug: 'ESP',
          name: '',
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

export const estimation = {
  data: {
    employments: [],
  },
};

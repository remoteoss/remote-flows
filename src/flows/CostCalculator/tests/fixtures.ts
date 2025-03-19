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
      child_regions: [
        {
          slug: 'POL',
          name: '',
        },
      ],
      has_additional_fields: true,
      availability: 'active',
      original_country_slug: 'poland-d3f6d510-2fdf-4b9d-8520-2b581a862411',
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

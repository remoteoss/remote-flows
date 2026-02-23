export const countriesResponse = {
  data: {
    data: [
      {
        code: 'USA',
        name: 'United States',
        eor_onboarding: true,
      },
      {
        code: 'GBR',
        name: 'United Kingdom',
        eor_onboarding: true,
      },
      {
        code: 'PRT',
        name: 'Portugal',
        eor_onboarding: true,
      },
    ],
  },
  error: null,
};

export const currenciesResponse = {
  data: {
    data: {
      company_currencies: [
        { code: 'USD', slug: 'usd' },
        { code: 'EUR', slug: 'eur' },
        { code: 'GBP', slug: 'gbp' },
      ],
    },
  },
  error: null,
};

export const companyCreatedResponse = {
  data: {
    data: {
      data: {
        company: {
          id: 'company-123',
          name: 'Test Company',
          country_code: 'USA',
          company_owner_email: 'owner@example.com',
          company_owner_name: 'John Doe',
          desired_currency: 'USD',
          phone_number: '+1234567890',
          tax_number: 'TAX123',
          terms_of_service_accepted_at: '2024-01-01 12:00:00Z',
          status: 'pending',
        },
      },
    },
  },
  error: null,
};

export const companyCreatedWithTokensResponse = {
  data: {
    data: {
      company: {
        id: 'company-123',
        name: 'Test Company',
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
        terms_of_service_accepted_at: '2024-01-01 12:00:00Z',
        status: 'pending',
      },
      tokens: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      },
    },
  },
  error: null,
};

export const addressDetailsSchema = {
  data: {
    data: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          title: 'Address',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        city: {
          type: 'string',
          title: 'City',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        postal_code: {
          type: 'string',
          title: 'Postal Code',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
        state: {
          type: 'string',
          title: 'State',
          'x-jsf-presentation': {
            inputType: 'text',
          },
        },
      },
      required: ['address', 'city', 'postal_code', 'state'],
    },
  },
  error: null,
};

export const companyUpdatedResponse = {
  data: {
    data: {
      company: {
        id: 'company-123',
        name: 'Test Company',
        country_code: 'USA',
        address_details: {
          address: '123 Main St',
          city: 'San Francisco',
          postal_code: '94101',
          state: 'CA',
        },
      },
    },
  },
  error: null,
};

export const createCompanyErrorResponse = {
  data: null,
  error: {
    error: {
      message: 'Validation failed',
      errors: {
        company_owner_email: ['Invalid email format'],
        name: ['Name is required'],
      },
    },
  },
};

export const updateCompanyErrorResponse = {
  data: null,
  error: {
    error: {
      message: 'Update failed',
      errors: {
        address_details: {
          address: ['Address is required'],
        },
      },
    },
  },
};

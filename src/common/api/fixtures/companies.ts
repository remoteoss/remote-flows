export const mockCompanyPricingPlansResponse = {
  data: {
    pricing_plans: [
      {
        id: '3ac2587d-e257-4aba-aeb0-c407af6a483e',
        type: 'pay_as_you_go',
        product: {
          name: 'EOR Monthly',
          frequency: 'monthly',
          tier: 'standard',
        },
        price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 69900,
        },
        start_date: '2026-02-05',
        end_date: null,
        base_price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 69900,
        },
      },
      {
        id: '3d18eeb9-0410-4d79-8c63-4c170a6cf21e',
        type: 'pay_as_you_go',
        product: {
          name: 'Monthly Contractor Plus Subscription',
          frequency: 'monthly',
          tier: 'plus',
        },
        price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 9900,
        },
        start_date: '2026-02-05',
        end_date: null,
        base_price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 9900,
        },
      },
      {
        id: '7ed95723-ca0f-4cf3-8e6c-71d6f9ddd085',
        type: 'pay_as_you_go',
        product: {
          name: 'Monthly Contractor Subscription',
          frequency: 'monthly',
          tier: 'standard',
        },
        price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 2900,
        },
        start_date: '2026-02-05',
        end_date: null,
        base_price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 2900,
        },
      },
      {
        id: '2b4f0f9a-b92a-4d10-a452-7a4fec2beaae',
        type: 'pay_as_you_go',
        product: {
          name: 'Monthly Contractor of Record Subscription',
          frequency: 'monthly',
          tier: 'standard',
        },
        price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 32500,
        },
        start_date: '2026-02-05',
        end_date: null,
        base_price: {
          currency: {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
          },
          amount: 32500,
        },
      },
    ],
  },
};

export const mockCompanyResponse = {
  data: {
    company: {
      id: 'c3c22940-e118-425c-9e31-f2fd4d43c6d8',
      name: 'vadance',
      status: 'active',
      country_code: 'GBR',
      updated_at: '2025-05-30T11:34:39',
      external_id: null,
      created_at: '2024-08-27T22:45:26',
      phone_number: '+12403606587',
      bank_account_details: null,
      tax_number: '7984469',
      registration_number: null,
      terms_of_service_accepted_at: '2024-08-27T22:45:26Z',
      desired_currency: 'USD',
      company_owner_email: 'mohit.mahindroo+vadance@remote.com',
      company_owner_name: 'Michelll sdassPustomer',
      address_details: {
        address: '1509 Broderick St',
        address_line_2: 'Flat number 123',
        city: 'London',
        postal_code: 'SW79 8SY',
      },
      default_legal_entity_credit_risk_status: 'not_started',
      company_owner_user_id: 'a8a99466-a159-4bef-a9e1-0cb6939542e1',
    },
  },
};

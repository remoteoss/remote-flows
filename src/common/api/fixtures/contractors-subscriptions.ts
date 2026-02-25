import { mockBaseResponse } from '@/src/common/api/fixtures/base';

export const mockContractorSubscriptionResponse = {
  data: [
    {
      product: {
        active: true,
        name: 'Monthly Contractor of Record Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:aor:monthly',
        short_name: 'COR',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
      },
      total_amount: 0,
      price: {
        amount: 32500,
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Plus Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:plus:monthly',
        short_name: 'CM+',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 9900,
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Subscription',
        identifier:
          'urn:remotecom:resource:product:contractor:standard:monthly',
        short_name: 'CM',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 2900,
      },
    },
  ],
};

export const mockContractorSubscriptionWithEligibilityResponse = {
  data: [
    {
      product: {
        active: true,
        name: 'Monthly Contractor of Record Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:aor:monthly',
        short_name: 'COR',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
      },
      total_amount: 0,
      price: {
        amount: 32500,
      },
      eligibility_questionnaire: {
        submitted_at: '2026-01-26T11:08:56Z',
        is_blocking: false,
        responses: {
          control_the_way_contractors_work: 'no',
          previously_hired_contractors_as_employees: 'no',
          treating_contractors_as_employees: 'no',
        },
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Plus Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:plus:monthly',
        short_name: 'CM+',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 9900,
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Subscription',
        identifier:
          'urn:remotecom:resource:product:contractor:standard:monthly',
        short_name: 'CM',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 2900,
      },
    },
  ],
};

export const mockContractorSubscriptionWithBlockedEligibilityResponse = {
  data: [
    {
      product: {
        active: true,
        name: 'Monthly Contractor of Record Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:aor:monthly',
        short_name: 'COR',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
      },
      total_amount: 0,
      price: {
        amount: 32500,
      },
      eligibility_questionnaire: {
        submitted_at: '2026-01-26T11:08:56Z',
        is_blocking: true, // Changed to true
        responses: {
          control_the_way_contractors_work: 'yes', // Blocking responses
          previously_hired_contractors_as_employees: 'yes',
          treating_contractors_as_employees: 'yes',
        },
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Plus Subscription',
        identifier: 'urn:remotecom:resource:product:contractor:plus:monthly',
        short_name: 'CM+',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 9900,
      },
    },
    {
      product: {
        active: true,
        name: 'Monthly Contractor Subscription',
        identifier:
          'urn:remotecom:resource:product:contractor:standard:monthly',
        short_name: 'CM',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: 'usd-72c1c0be-587c-4d0e-b705-8fe9f16028a3',
      },
      price: {
        amount: 2900,
      },
    },
  ],
};

export const mockManageSubscriptionResponse = mockBaseResponse;

export const mockCOROnlyResponse = {
  data: [
    {
      product: {
        active: true,
        name: 'Monthly Contractor of Record Subscription',
        description:
          'Remote reduces liability by directly engaging the contractor',
        features: [
          'Contract between Remote and contractor',
          'Our most comprehensive option for compliance and flexibility',
          'Locally compliant agreements',
          'Localized contract templates',
          'Remote offers an indemnity on any losses from our administration and payment of contractors',
        ],
        identifier: 'urn:remotecom:resource:product:contractor:aor:monthly',
        slug: '6b4ee8d2-cc1b-4f33-86f3-b5ff12b10ab6',
        inserted_at: '2025-06-10',
        short_name: 'COR',
        frequency: 'monthly',
        tier: 'standard',
        employment_type: 'contractor',
      },
      currency: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        slug: '1b2c181d-24c9-44ff-a8e1-2a7025ca491c',
      },
      price: {
        amount: 32500,
        final_amount: 32500,
      },
      total_amount: 0,
      company_product: {
        slug: 'b4556022-9c54-4595-8792-8d91e60179ea',
      },
      company_product_discount: {
        percent: '0',
        expiration_date: null,
      },
      eligibility_questionnaire: null,
      is_termination_fees_enabled: true,
      free_trial: {
        status: 'ineligible',
        start_date: null,
        end_date: null,
      },
      active_contractors_count: 0,
      billable_contractors_count: 0,
      next_invoice_date: '2026-03-02',
      summary_period: '2026-02',
      contractor_of_record_plan: {
        minimum_fee: {
          currency: 'USD',
          amount: '325.00',
        },
        percentage_fee: '0.15',
      },
    },
  ],
};

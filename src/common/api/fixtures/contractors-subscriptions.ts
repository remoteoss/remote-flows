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

export const mockManageSubscriptionResponse = mockBaseResponse;
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

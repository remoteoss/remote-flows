import { useClient } from '@/src/RemoteFlowsProvider';
import {
  CostCalculatorEstimateParams,
  getIndexCompanyCurrency,
  getIndexCountry,
  postCreateEstimation,
} from '@/src/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { useCostCalculator } from './hooks';

vi.mock('@/src/RemoteFlowsProvider', () => ({
  useClient: vi.fn(),
}));

vi.mock('@/src/client', () => ({
  getIndexCountry: vi.fn(),
  getIndexCompanyCurrency: vi.fn(),
  postCreateEstimation: vi.fn(),
  getShowRegionField: vi.fn(),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCostCalculator', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  test('should fetch countries and currencies', async () => {
    const mockClient = { client: {} };
    (useClient as Mock).mockReturnValue(mockClient);
    (getIndexCountry as Mock).mockResolvedValue({
      data: {
        data: [
          {
            region_slug: 'us',
            name: 'United States',
            child_regions: [],
            has_additional_fields: false,
          },
        ],
      },
    });
    (getIndexCompanyCurrency as Mock).mockResolvedValue({
      data: { data: { company_currencies: [{ slug: 'usd', code: 'USD' }] } },
    });

    const { result, unmount } = renderHook(() => useCostCalculator(), {
      wrapper,
    });

    await waitFor(() => result.current.fields.length > 0);
    expect(
      result.current.fields.find((field) => field.name === 'country')?.options,
    ).toEqual([
      {
        value: 'us',
        label: 'United States',
        childRegions: [],
        hasAdditionalFields: false,
        regionSlug: 'us',
      },
    ]);
    expect(
      result.current.fields.find((field) => field.name === 'currency')?.options,
    ).toEqual([{ value: 'usd', label: 'USD' }]);

    unmount();
  });

  test('should handle country change', async () => {
    const mockClient = { client: {} };
    (useClient as Mock).mockReturnValue(mockClient);
    (getIndexCountry as Mock).mockResolvedValue({
      data: {
        data: [
          {
            region_slug: 'us',
            name: 'United States',
            child_regions: [],
            has_additional_fields: true,
          },
        ],
      },
    });

    const { result, rerender, unmount } = renderHook(
      () => useCostCalculator(),
      { wrapper },
    );

    await rerender();

    await waitFor(() => {
      expect(
        result.current.fields.find((field) => field.name === 'country')
          ?.onChange,
      ).toBeDefined();
    });

    act(() => {
      result.current.fields
        .find((field) => field.name === 'country')
        ?.onChange?.('us');
    });

    expect(
      result.current.fields.find((field) => field.name === 'region')?.isVisible,
    ).toBe(false);

    unmount();
  });

  test('should handle region change', async () => {
    const mockClient = { client: {} };
    (useClient as Mock).mockReturnValue(mockClient);
    (getIndexCountry as Mock).mockResolvedValue({
      data: {
        data: [
          {
            region_slug: 'us',
            name: 'United States',
            child_regions: [{ slug: 'ca', name: 'California' }],
            has_additional_fields: false,
          },
        ],
      },
    });

    const { result, rerender, unmount } = renderHook(
      () => useCostCalculator(),
      { wrapper },
    );

    await rerender();

    await waitFor(() => {
      expect(
        result.current.fields.find((field) => field.name === 'country')
          ?.onChange,
      ).toBeDefined();
    });

    act(() => {
      result.current.fields
        .find((field) => field.name === 'country')
        ?.onChange?.('us');
    });

    act(() => {
      result.current.fields
        .find((field) => field.name === 'region')
        ?.onChange?.('ca');
    });

    await waitFor(() => {
      expect(
        result.current.fields.find((field) => field.name === 'region')
          ?.isVisible,
      ).toBe(true);
    });

    unmount();
  });

  test.only('should submit estimation', async () => {
    const mockClient = { client: {} };
    (useClient as Mock).mockReturnValue(mockClient);
    (postCreateEstimation as Mock).mockResolvedValue({
      data: { estimated_cost: 1000 },
    });

    const { result, rerender, unmount } = renderHook(
      () => useCostCalculator(),
      { wrapper },
    );

    await rerender();

    const payload: CostCalculatorEstimateParams = {
      employer_currency_slug: 'usd',
      employments: [
        {
          annual_gross_salary: 33333,
          annual_gross_salary_in_employer_currency: 33333,
          employment_term: 'fixed',
          region_slug: 'c9ff7e03-fb09-4ac2-a4d0-70dab472f151',
          regional_to_employer_exchange_rate: '1',
        },
      ],
      include_benefits: false,
      include_cost_breakdowns: false,
    };

    await act(async () => {
      await result.current.onSubmit(payload);
    });

    expect(postCreateEstimation).toHaveBeenCalledWith({
      body: payload,
      client: {},
      headers: {
        Authorization: '',
      },
    });

    unmount();
  });
});

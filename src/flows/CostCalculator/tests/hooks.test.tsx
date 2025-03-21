import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import { countries, currencies, estimation, regionFields } from './fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCostCalculator', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v1/cost-calculator/countries', () => {
        return HttpResponse.json(countries);
      }),
      http.get('*/v1/company-currencies', () => {
        return HttpResponse.json(currencies);
      }),
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFields);
      }),
      http.post('*/v1/cost-calculator/estimation', () => {
        return HttpResponse.json(estimation);
      }),
    );

    queryClient.clear();
  });

  test('should load regions when a country with regions is selected', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });

    const countryField = result.current.fields.find(
      (field) => field.name === 'country',
    );
    const regionField = result.current.fields.find(
      (field) => field.name === 'region',
    );
    await waitFor(() => {
      expect(countryField?.onChange).toBeDefined();
    });

    act(() => {
      countryField?.onChange?.('POL');
    });

    await waitFor(() => {
      expect(regionField?.options?.length).toBeGreaterThan(0);
    });

    expect(regionField?.isVisible).toBe(true);
    expect(regionField?.required).toBe(true);
  });
});

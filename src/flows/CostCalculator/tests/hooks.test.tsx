import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import { countries, currencies, estimation, regionFields } from './fixtures';
import { $TSFixMe } from '@remoteoss/json-schema-form';

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

    await waitFor(() => {
      const countryField = result.current.fields.find(
        (field) => field.name === 'country',
      );
      expect(countryField?.onChange).toBeDefined();
    });

    const countryField: $TSFixMe = result.current.fields.find(
      (field) => field.name === 'country',
    );

    act(() => {
      countryField?.onChange?.('POL');
    });

    await waitFor(() => {
      const regionField: $TSFixMe = result.current.fields.find(
        (field) => field.name === 'region',
      );
      expect(regionField?.options?.length).toBeGreaterThan(0);
    });

    const regionField = result.current.fields.find(
      (field) => field.name === 'region',
    );

    expect(regionField?.isVisible).toBe(true);
    expect(regionField?.required).toBe(true);
  });

  test('should not throw an error when we send correct data to handleValidation', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });
    const validValues = {
      country: 'PRT',
      currency: 'USD',
      salary: '500000',
    };

    await expect(
      result.current.handleValidation(validValues),
    ).resolves.not.toThrow();

    await expect(result.current.handleValidation(validValues)).resolves.toEqual(
      validValues,
    );
  });

  test('should throw an error when we send incorrect data to handleValidation', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });
    const invalidValues = {
      country: 'PRT',
      currency: 'USD',
      salary: '',
    };

    try {
      await result.current.handleValidation(invalidValues);
    } catch (error: $TSFixMe) {
      expect(error).toBeDefined();
      expect(error.message).toBe('Salary is required'); // Replace with the actual error message
    }
  });
});

import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import { server } from '@/src/tests/server';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
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

  it('should load regions when a country with regions is selected', async () => {
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
      countryField?.onChange?.('ESP');
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

  it('should not return errors when valid data is passed to handleValidation', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });
    const validValues = {
      country: 'PRT',
      currency: 'USD',
      currency_code: 'USD',
      salary: '500000',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    } as const;

    await expect(
      result.current.handleValidation(validValues),
    ).resolves.toMatchObject({
      formErrors: {},
    });
  });

  it('should return an error when invalid data is passed to handleValidation', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });
    const invalidValues = {
      country: 'PRT',
      currency: 'USD',
      currency_code: 'USD',
      salary: '',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    } as const;

    await expect(
      result.current.handleValidation(invalidValues),
    ).resolves.toMatchObject({
      formErrors: {
        salary: 'Required field',
      },
    });
  });
});

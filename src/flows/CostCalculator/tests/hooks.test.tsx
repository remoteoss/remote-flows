import {
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import { server } from '@/src/tests/server';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { countries, currencies, estimation, regionFields } from './fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

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
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      const countryField: $TSFixMe = result.current.fields.find(
        (field) => field.name === 'country',
      );
      expect(countryField?.options?.length).toBeGreaterThan(0);
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
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });
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
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });
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

  it('should require salary_conversion instead of salary when the salary was converted', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    const validationResult = await result.current.handleValidation({
      country: 'PRT',
      currency: 'USD',
      currency_code: 'USD',
      salary: '',
      salary_converted: 'salary_conversion',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    });

    expect(validationResult.formErrors).toEqual({
      salary_conversion: 'Required field',
    });
  });

  it('should require the region when the selected country has regions', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      const countryField: $TSFixMe = result.current.fields.find(
        (field) => field.name === 'country',
      );
      expect(countryField?.options?.length).toBeGreaterThan(0);
    });

    const countryField: $TSFixMe = result.current.fields.find(
      (field) => field.name === 'country',
    );

    act(() => {
      countryField?.onChange?.('ESP');
    });

    await waitFor(() => {
      const regionField = result.current.fields.find(
        (field) => field.name === 'region',
      );
      expect(regionField?.required).toBe(true);
    });

    const validationResult = await result.current.handleValidation({
      country: 'ESP',
      currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      currency_code: 'USD',
      salary: '500000',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    });

    expect(validationResult.formErrors).toEqual({
      region: 'Region is required',
    });
  });

  it('should require the estimation title when includeEstimationTitle is true', async () => {
    const { result } = renderHook(
      () =>
        useCostCalculator({
          estimationOptions: {
            ...defaultEstimationOptions,
            includeEstimationTitle: true,
          },
        }),
      {
        wrapper: TestProviders,
      },
    );

    const validationResult = await result.current.handleValidation({
      country: 'PRT',
      currency: 'USD',
      currency_code: 'USD',
      salary: '500000',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: '',
    });

    expect(validationResult.formErrors).toEqual({
      estimation_title: 'Required field',
    });
  });

  it('should reject a management fee above the base rate of the employer currency', async () => {
    const { result } = renderHook(
      () =>
        useCostCalculator({
          estimationOptions: {
            ...defaultEstimationOptions,
            includeManagementFee: true,
            showManagementFee: true,
          },
        }),
      {
        wrapper: TestProviders,
      },
    );

    const values = {
      country: 'PRT',
      salary: '500000',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    } as const;

    await expect(
      result.current.handleValidation({
        ...values,
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        currency_code: 'USD',
        management: { management_fee: '700' },
      }),
    ).resolves.toMatchObject({
      formErrors: {
        management: {
          management_fee: 'Management fee cannot exceed 699 USD',
        },
      },
    });

    await waitFor(() => {
      expect(result.current.currencies).toBeDefined();
    });

    const currencyField: $TSFixMe = result.current.fields.find(
      (field) => field.name === 'currency',
    );

    act(() => {
      currencyField?.onChange?.('eur-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8');
    });

    await waitFor(async () => {
      await expect(
        result.current.handleValidation({
          ...values,
          currency: 'eur-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
          currency_code: 'EUR',
          management: { management_fee: '646' },
        }),
      ).resolves.toMatchObject({
        formErrors: {
          management: {
            management_fee: 'Management fee cannot exceed 645 EUR',
          },
        },
      });
    });
  });

  it('should update the salary label when the hiring budget changes', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    const hiringBudgetField: $TSFixMe = result.current.fields.find(
      (field) => field.name === 'hiring_budget',
    );

    act(() => {
      hiringBudgetField?.onChange?.('my_hiring_budget');
    });

    await waitFor(() => {
      const salaryField = result.current.fields.find(
        (field) => field.name === 'salary',
      );
      expect(salaryField?.label).toBe('Hiring budget');
    });
  });

  it('should expose a validationSchema that delegates to handleValidation', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });
    const values = {
      country: 'PRT',
      currency: 'USD',
      currency_code: 'USD',
      salary_converted: 'salary',
      salary_conversion: '',
      estimation_title: 'Test estimation',
    } as const;

    await expect(
      result.current.validationSchema.validate(
        { ...values, salary: '500000' },
        { abortEarly: false },
      ),
    ).resolves.toBeDefined();

    await expect(
      result.current.validationSchema.validate(
        { ...values, salary: '' },
        { abortEarly: false },
      ),
    ).rejects.toMatchObject({
      inner: [{ path: 'salary', message: 'Required field' }],
    });
  });
});

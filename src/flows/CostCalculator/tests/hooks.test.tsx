import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
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

    const validationResult = await result.current.handleValidation(
      validValues as $TSFixMe,
    );

    // The v1 engine doesn't include a `formErrors` key at all when there's nothing to
    // report (unlike the removed Yup path, which always returned `{ formErrors: {} }`) —
    // assert there are no errors rather than the exact shape of a "no errors" result.
    expect(validationResult?.formErrors ?? {}).toEqual({});
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

  it('should clear fieldValues when resetForm is called with remount', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    // Wait for the hook to be ready
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate user input by calling checkFieldUpdates
    const testValues = {
      country: 'PRT',
      salary: '50000',
      currency: 'EUR',
    };

    act(() => {
      result.current.checkFieldUpdates(testValues);
    });

    // Verify fieldValues was updated
    expect(result.current.fieldValues).toEqual(testValues);

    const initialResetKey = result.current.resetKey;

    // Call resetForm (with default remount: true)
    act(() => {
      result.current.resetForm();
    });

    // Verify resetKey incremented (confirming remount will happen)
    expect(result.current.resetKey).toBe(initialResetKey + 1);

    // Verify fieldValues was cleared
    expect(result.current.fieldValues).toEqual({});
  });

  it('should NOT clear fieldValues when resetForm is called with remount: false', async () => {
    const { result } = renderHook(() => useCostCalculator(), {
      wrapper: TestProviders,
    });

    // Wait for the hook to be ready
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate user input
    const testValues = {
      country: 'PRT',
      salary: '50000',
      currency: 'EUR',
    };

    act(() => {
      result.current.checkFieldUpdates(testValues);
    });

    expect(result.current.fieldValues).toEqual(testValues);

    const initialResetKey = result.current.resetKey;

    // Call resetForm with remount: false
    act(() => {
      result.current.resetForm({ remount: false });
    });

    // Verify resetKey did NOT increment
    expect(result.current.resetKey).toBe(initialResetKey);

    // Verify fieldValues was NOT cleared (should still have values)
    expect(result.current.fieldValues).toEqual(testValues);
  });
});

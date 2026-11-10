import {
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import type { CostCalculatorEstimationFormValues } from '@/src/flows/CostCalculator/types';
import { server } from '@/src/tests/server';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { countries, currencies, estimation, regionFields } from './fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { ValidationError } from 'yup';

type FieldSchema = { title: string };

const validValues = {
  country: 'POL',
  currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
  currency_code: 'USD',
  salary: '50000',
  salary_converted: 'salary',
  salary_conversion: '',
  estimation_title: 'Test estimation',
} as const;

async function renderCostCalculatorWithOptions() {
  const hook = renderHook(() => useCostCalculator(), {
    wrapper: TestProviders,
  });

  await waitFor(() => {
    const countryField = hook.result.current.fields.find(
      (field) => field.name === 'country',
    );
    expect((countryField?.options as unknown[] | undefined)?.length).toBe(3);
  });

  return hook;
}

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
    const { result } = await renderCostCalculatorWithOptions();

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

  it('should keep the select options after validating', async () => {
    const { result } = await renderCostCalculatorWithOptions();

    await act(() => result.current.handleValidation(validValues));

    const countryField = result.current.fields.find(
      (field) => field.name === 'country',
    );
    expect((countryField?.options as unknown[] | undefined)?.length).toBe(3);
  });

  it.each([
    ['a valid salary', {}, {}],
    ['a zero salary', { salary: '0' }, {}],
    ['a decimal salary', { salary: '50000.55' }, {}],
    ['an empty salary', { salary: '' }, { salary: 'Required field' }],
    [
      'a salary that is not a number',
      { salary: 'abc' },
      { salary: 'The value must be a number' },
    ],
    [
      'a converted salary and no salary',
      {
        salary: '',
        salary_converted: 'salary_conversion',
        salary_conversion: '40000',
      },
      {},
    ],
    [
      'an empty converted salary',
      { salary_converted: 'salary_conversion', salary_conversion: '' },
      { salary_conversion: 'Required field' },
    ],
    ['an empty country', { country: '' }, { country: 'Required field' }],
    ['an empty currency', { currency: '' }, { currency: 'Required field' }],
  ])(
    'should validate %s like the deprecated validationSchema',
    async (_, overrides, formErrors) => {
      const { result } = await renderCostCalculatorWithOptions();
      const values = {
        ...validValues,
        ...overrides,
      } as CostCalculatorEstimationFormValues;

      const validation = await act(() =>
        result.current.handleValidation(values),
      );

      expect(validation.formErrors).toEqual(formErrors);
      // oxlint-disable-next-line typescript/no-deprecated
      expect(validation.yupError.inner.map((error) => error.path)).toEqual(
        Object.keys(formErrors),
      );
    },
  );

  it('should resolve the deprecated yupError like the Yup validation did', async () => {
    const { result } = await renderCostCalculatorWithOptions();

    // oxlint-disable-next-line typescript/no-deprecated
    const { yupError: validYupError } = await act(() =>
      result.current.handleValidation(validValues),
    );
    expect(validYupError).toBeInstanceOf(ValidationError);
    expect(validYupError.inner).toEqual([]);
    expect(validYupError.value).toEqual(validValues);

    // oxlint-disable-next-line typescript/no-deprecated
    const { formErrors, yupError } = await act(() =>
      result.current.handleValidation({
        ...validValues,
        management: { management_fee: '1000' },
      } as CostCalculatorEstimationFormValues),
    );
    expect(formErrors).toEqual({
      management: { management_fee: 'Management fee cannot exceed 699 USD' },
    });
    expect(yupError.errors).toEqual(['Management fee cannot exceed 699 USD']);
    expect(
      yupError.inner.map(({ path, type, message }) => ({
        path,
        type,
        message,
      })),
    ).toEqual([
      {
        path: 'management.management_fee',
        type: 'max',
        message: 'Management fee cannot exceed 699 USD',
      },
    ]);
  });

  it('should keep the country details on the country options', async () => {
    const { result } = await renderCostCalculatorWithOptions();

    const countryField = result.current.fields.find(
      (field) => field.name === 'country',
    );

    expect(countryField?.options).toEqual([
      {
        label: 'Poland',
        value: 'POL',
        childRegions: [],
        hasAdditionalFields: false,
        regionSlug: 'POL',
        currency: 'PLN',
      },
      {
        label: 'Spain',
        value: 'ESP',
        childRegions: [
          { slug: 'AST', name: 'Asturias' },
          { slug: 'CAN', name: 'Canary Islands' },
        ],
        hasAdditionalFields: true,
        regionSlug: 'ESP',
        currency: 'EUR',
      },
      {
        label: 'United States',
        value: 'USA',
        childRegions: [
          { slug: 'CA', name: 'California' },
          { slug: 'NY', name: 'New York' },
        ],
        hasAdditionalFields: true,
        regionSlug: 'USA',
        currency: 'USD',
      },
    ]);
  });

  it('should keep a hidden and optional region field when the country has no regions', async () => {
    const { result } = await renderCostCalculatorWithOptions();

    const regionField = result.current.fields.find(
      (field) => field.name === 'region',
    );
    expect(regionField?.isVisible).toBe(false);
    expect(regionField?.required).toBe(false);

    const { formErrors } = await act(() =>
      result.current.handleValidation({ ...validValues, region: 'AST' }),
    );
    expect(formErrors).toEqual({});
  });

  it('should apply a jsfModify function on the country, region and currency fields', async () => {
    const { result } = renderHook(
      () =>
        useCostCalculator({
          estimationOptions: defaultEstimationOptions,
          options: {
            jsfModify: {
              fields: {
                country: ({ title }: FieldSchema) => ({
                  title: `${title} of employment`,
                }),
                region: ({ title }: FieldSchema) => ({
                  title: `${title} of employment`,
                }),
                currency: ({ title }: FieldSchema) => ({
                  title: `Billing ${title}`,
                }),
              },
            },
          },
        }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      const countryField = result.current.fields.find(
        (field) => field.name === 'country',
      );
      expect((countryField?.options as unknown[] | undefined)?.length).toBe(3);
    });

    const countryField: $TSFixMe = result.current.fields.find(
      (field) => field.name === 'country',
    );
    expect(countryField?.label).toBe('Country of employment');

    act(() => {
      countryField?.onChange?.('ESP');
    });

    await waitFor(() => {
      const regionField: $TSFixMe = result.current.fields.find(
        (field) => field.name === 'region',
      );
      expect(regionField?.options?.length).toBeGreaterThan(0);
    });

    expect(
      result.current.fields.find((field) => field.name === 'region')?.label,
    ).toBe('Region of employment');
    expect(
      result.current.fields.find((field) => field.name === 'currency')?.label,
    ).toBe('Billing Currency');
  });
});

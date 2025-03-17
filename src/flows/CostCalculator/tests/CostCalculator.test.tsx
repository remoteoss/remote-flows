import { CostCalculator } from '@/src/flows/CostCalculator/CostCalculator';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { countries, currencies, estimation, regionFields } from './fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

describe('CostCalculator', () => {
  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    defaultValues: {
      countryRegionSlug: 'POL',
      currencySlug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      salary: '50000',
    },
  };

  beforeEach(() => {
    server.use(
      ...[
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
      ],
    );
  });

  test('renders the form with default values', async () => {
    render(<CostCalculator {...defaultProps} />, {
      wrapper,
    });

    const dropdowns = screen.getAllByRole('combobox');
    const countryDropdown = dropdowns[0];
    const currencyDropdown = dropdowns[1];
    const salaryInput = screen.getByRole('textbox', { name: /salary/i });

    await waitFor(() => {
      expect(countryDropdown).toHaveTextContent(/Poland/i);
    });

    expect(currencyDropdown).toHaveTextContent(/USD/i);
    expect(salaryInput).toHaveValue('50000');
  });

  test('submits the form with default values', async () => {
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        employer_currency_slug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        include_benefits: false,
        include_cost_breakdowns: false,
        employments: [
          {
            region_slug: 'POL',
            annual_gross_salary: 5000000,
            annual_gross_salary_in_employer_currency: 5000000,
            employment_term: 'fixed',
            title: 'Estimation',
            regional_to_employer_exchange_rate: '1',
            age: undefined,
          },
        ],
      });
    });
  });

  test('calls onError when estimation fails', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return new HttpResponse('Not found', { status: 404 });
      }),
    );
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  test('displays validation errors when form is submitted with empty fields', async () => {});
});

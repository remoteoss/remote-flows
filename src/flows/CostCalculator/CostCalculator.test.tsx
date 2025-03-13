import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CostCalculator } from './CostCalculator';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('CostCalculator', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    defaultValues: {
      countryRegionSlug: 'a23370e3-b280-468f-b54c-25dd79b5690b',
      currencySlug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      salary: '50000',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the form with default values', async () => {
    render(<CostCalculator {...defaultProps} />, {
      wrapper,
    });

    const dropdowns = screen.getAllByRole('combobox');
    const countryDropdown = dropdowns[0];
    const currencyDropdown = dropdowns[1];
    const salaryInput = screen.getByRole('textbox', { name: /salary/i });

    // const user = userEvent.setup();
    // const selectCurrency = screen.getAllByRole('')[1];

    // const salary = screen.getByLabelText(/salary/i);
    // const selectButtonElement = screen.getAllByRole('combobox')[1];

    // await user.click(selectButtonElement);
    // const latestProductOption = screen.getByRole('option', { name: /Poland/i });

    // await user.click(latestProductOption);
    await waitFor(() => {
      expect(countryDropdown).toHaveTextContent(/Poland/i);
    });
    await waitFor(() => {
      expect(currencyDropdown).toHaveTextContent(/USD/i);
    });

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
            region_slug: 'a23370e3-b280-468f-b54c-25dd79b5690b',
            annual_gross_salary: 50000,
            annual_gross_salary_in_employer_currency: 50000,
            employment_term: 'fixed',
            title: 'Estimation',
            regional_to_employer_exchange_rate: '1',
            age: undefined,
          },
        ],
      });
    });
  });

  test('calls onSuccess when estimation succeeds', async () => {
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        data: {
          employments: [],
        },
      });
    });
  });

  test('calls onError when estimation fails', async () => {});

  test('displays validation errors when form is submitted with empty fields', async () => {});
});

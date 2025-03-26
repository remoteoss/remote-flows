import { CostCalculator } from '@/src/flows/CostCalculator/CostCalculator';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  countries,
  currencies,
  estimation,
  regionFields,
  regionFieldsWithAgeProperty,
} from './fixtures';

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

  test('should render the form with default values', async () => {
    render(<CostCalculator {...defaultProps} />, {
      wrapper,
    });

    const comboboxes = screen.getAllByRole('combobox');
    const countryDropdown = comboboxes[0];
    const currencyDropdown = comboboxes[1];
    const salaryInput = screen.getByRole('textbox', { name: /salary/i });

    await waitFor(() => {
      expect(countryDropdown).toHaveTextContent(/Poland/i);
    });

    expect(currencyDropdown).toHaveTextContent(/USD/i);
    expect(salaryInput).toHaveValue('50000');
  });

  test('should submit the form with default values', async () => {
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        country: 'POL',
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        region: '',
        salary: '50000',
      });
    });
  });

  test('should call onSuccess callback when estimation succeeds', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return HttpResponse.json({ data: {} });
      }),
    );
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('should call onError callback when estimation fails', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return new HttpResponse('Not found', { status: 422 });
      }),
    );
    render(<CostCalculator {...defaultProps} />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  test('should display validation errors when form is submitted with empty fields', async () => {
    render(<CostCalculator />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(screen.getByText(/salary is required/i)).toBeInTheDocument();
    });
  });

  test('should load the form with regional fields based on the selected country', async () => {
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    render(<CostCalculator {...defaultProps} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Life Insurance')).toBeInTheDocument();
  });

  test('should load, fill and submit form with regional fields', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    render(<CostCalculator {...defaultProps} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    // type age
    await user.type(
      screen.getByRole('textbox', {
        name: /age/i,
      }),
      '30',
    );

    // select benefits
    const [, , lifeInsurance, healthInsurance] =
      screen.getAllByRole('combobox');

    // select life insurance
    await user.click(lifeInsurance);
    const [, healthInsuranceOption] = screen.getAllByText(
      'Option 1 - 5.64 USD/mo',
    );
    await user.click(healthInsuranceOption);

    // select health insurance
    await user.click(healthInsurance);
    const [, lifeInsuranceOption] = screen.getAllByText(
      'Option 1 - 113 USD/mo',
    );
    await user.click(lifeInsuranceOption);

    // submit form
    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        age: 30,
        benefits: {
          'benefit-53c5fc69-f299-47e7-9004-86def3f0e845':
            '8a32160f-62cb-4fd7-b90a-47b92e8bb734',
          'benefit-b5b325b7-f997-4679-9e63-bd77d8d1ed1f':
            'df47a18f-ee55-4fd8-ab53-9eefe937c4e1',
        },
        country: 'POL',
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        region: '',
        salary: '50000',
      });
    });
  });
});

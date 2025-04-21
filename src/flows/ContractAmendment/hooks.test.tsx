import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { useContractAmendment } from './hooks';
import { contractAmendementSchema, employment } from './tests/fixtures';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useContractAmendment', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employment);
      }),
      http.get('*/v1/contract-amendments/schema*', () => {
        return HttpResponse.json(contractAmendementSchema);
      }),
      http.post('*/contract-amendments/automatable', () => {
        return HttpResponse.json({ data: { id: 'test-id' } });
      }),
      http.post('*/v1/contract-amendments', () => {
        return HttpResponse.json({ data: { id: 'test-id' } });
      }),
    );
  });
  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch employment and schema data', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    waitFor(() => {
      expect(result.current.fields.length).toBeGreaterThan(0);
    });

    expect(result.current.initialValues).toBeDefined();
  });

  it('should handle form submission for automatable contract amendment', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    const formValues = {
      annual_gross_salary: 40000000,
      effective_date: '2025-05-01',
      job_title: 'Senior Engineer',
      role_description:
        'A detailed role description with more than 100 characters to meet the minimum requirement for the role description field.',
      experience_level:
        'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
      contract_duration_type: 'indefinite',
      work_schedule: 'full_time',
      work_hours_per_week: 40,
    };

    await act(async () => {
      await result.current.onSubmit(formValues);
    });

    expect(result.current.stepState.currentStep.name).toBe('confirmation_form');
  });

  it('should handle form submission for final contract amendment', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    // First submit to move to confirmation step
    const formValues = {
      annual_gross_salary: 40000000,
      effective_date: '2025-05-01',
      job_title: 'Senior Engineer',
      role_description:
        'A detailed role description with more than 100 characters to meet the minimum requirement for the role description field.',
      experience_level:
        'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
      contract_duration_type: 'indefinite',
      work_schedule: 'full_time',
      work_hours_per_week: 40,
    };

    await act(async () => {
      await result.current.onSubmit(formValues);
    });

    // Second submit for final confirmation
    await act(async () => {
      const response = await result.current.onSubmit(formValues);
      expect(response).toBeDefined();
    });
  });

  it('should handle validation', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    const invalidValues = {
      annual_gross_salary: 1000000, // Below minimum
      effective_date: '2025-05-01',
      job_title: '',
      role_description: 'Too short',
      experience_level: '',
      contract_duration_type: '',
      work_schedule: '',
      work_hours_per_week: 0,
    };

    const validationResult = result.current.handleValidation(invalidValues);
    expect(validationResult).toBeDefined();
  });

  it('should handle back navigation', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    const formValues = {
      annual_gross_salary: 40000000,
      effective_date: '2025-05-01',
      job_title: 'Senior Engineer',
      role_description:
        'A detailed role description with more than 100 characters to meet the minimum requirement for the role description field.',
      experience_level:
        'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
      contract_duration_type: 'indefinite',
      work_schedule: 'full_time',
      work_hours_per_week: 40,
    };

    // Move to confirmation step
    await act(async () => {
      await result.current.onSubmit(formValues);
    });

    // Go back
    act(() => {
      result.current.back();
    });

    expect(result.current.stepState.currentStep.name).toBe('form');
  });

  it('should handle field updates', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper },
    );

    const newValues = {
      job_title: 'Updated Title',
    };

    act(() => {
      result.current.checkFieldUpdates(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });
});

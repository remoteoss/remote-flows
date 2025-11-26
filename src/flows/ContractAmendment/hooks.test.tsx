import { employment } from '@/src/tests/fixtures';
import { server } from '@/src/tests/server';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useContractAmendment } from './hooks';
import { contractAmendementSchema } from './tests/fixtures';
import { TestProviders, queryClient } from '@/src/tests/testHelpers';

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

    queryClient.clear();
  });

  it('should fetch employment and schema data', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper: TestProviders },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    await waitFor(() => {
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
      { wrapper: TestProviders },
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
      { wrapper: TestProviders },
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
      { wrapper: TestProviders },
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
      { wrapper: TestProviders },
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
      { wrapper: TestProviders },
    );

    const newValues = {
      job_title: 'Updated Title',
    };

    act(() => {
      result.current.checkFieldUpdates(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });

  it('should use previous form values when navigating back to form', async () => {
    const { result } = renderHook(
      () =>
        useContractAmendment({
          employmentId: 'test-id',
          countryCode: 'PRT',
        }),
      { wrapper: TestProviders },
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.fields.length).toBeGreaterThan(0);
    });

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

    act(() => {
      result.current.checkFieldUpdates(formValues);
    });

    // submit to move to confirmation step
    await act(async () => {
      await result.current.onSubmit(formValues);
    });

    // Go back to form
    act(() => {
      result.current.back();
    });

    // Wait for the state to update and verify that the form values are restored
    await waitFor(() => {
      expect(result.current.stepState.values?.form).toEqual(formValues);
    });
  });
});

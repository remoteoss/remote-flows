import { useTermination } from '@/src/flows/Termination/hooks';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestProviders, queryClient } from '@/src/tests/testHelpers';

describe('useTermination', () => {
  beforeEach(() => {
    queryClient.clear();
  });
  it('should have fieldValues as combination of initialValues + stepState values + changed fieldValues', async () => {
    const { result } = renderHook(
      () =>
        useTermination({
          employmentId: 'emp-123',
          options: {},
          initialValues: {},
        }),
      { wrapper: TestProviders },
    );

    // Initially, fieldValues should equal initialValues
    expect(result.current.fieldValues).toEqual(result.current.initialValues);

    // Update a field
    act(() => {
      result.current.checkFieldUpdates({
        ...result.current.fieldValues,
        personal_email: 'test@example.com',
      });
    });

    // fieldValues should now include the changed field merged with initialValues
    await waitFor(() => {
      expect(result.current.fieldValues).toEqual({
        ...result.current.initialValues,
        personal_email: 'test@example.com',
      });
    });
  });

  it('should set isDirty to true only when fieldValues are modified', async () => {
    const { result } = renderHook(
      () =>
        useTermination({
          employmentId: 'emp-123',
          options: {},
          initialValues: {},
        }),
      { wrapper: TestProviders },
    );

    // Initially, isDirty should be false
    expect(result.current.isDirty).toBe(false);

    // Modify a field
    act(() => {
      result.current.checkFieldUpdates({
        ...result.current.fieldValues,
        personal_email: 'test@example.com',
      });
    });

    // isDirty should now be true
    await waitFor(() => {
      expect(result.current.isDirty).toBe(true);
    });

    // Move to next step (which resets fieldValues)
    act(() => {
      result.current.next();
    });

    // isDirty should be false again
    await waitFor(() => {
      expect(result.current.isDirty).toBe(false);
    });
  });
});

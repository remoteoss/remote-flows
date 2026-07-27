import { renderHook, act, waitFor } from '@testing-library/react';
import { useJSONSchemaForm } from '../useJSONSchemaForm';

describe('useJSONSchemaForm', () => {
  it('calls the latest checkFieldUpdates after it changes', async () => {
    // The watch subscription is created once, so a callback that closes over
    // the current headless form (as the playground does) must not be captured
    // for the lifetime of the form — otherwise a schema change leaves the form
    // validating against the previous schema.
    const firstCallback = vi.fn();
    const latestCallback = vi.fn();

    const { result, rerender } = renderHook(
      ({ checkFieldUpdates }) =>
        useJSONSchemaForm({
          handleValidation: async () => null,
          defaultValues: { country: 'FR' },
          checkFieldUpdates,
        }),
      { initialProps: { checkFieldUpdates: firstCallback } },
    );

    rerender({ checkFieldUpdates: latestCallback });

    act(() => {
      result.current.setValue('country', 'IT');
    });

    await waitFor(() => expect(latestCallback).toHaveBeenCalled());
    expect(firstCallback).not.toHaveBeenCalled();
  });
});

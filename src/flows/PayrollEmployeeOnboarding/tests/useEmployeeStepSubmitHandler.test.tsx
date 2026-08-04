import { renderHook } from '@testing-library/react';
import type { UseFormReturn } from 'react-hook-form';
import { useEmployeeStepSubmitHandler } from '../components/useEmployeeStepSubmitHandler';
import { buildBag, mockContext, resetFormFields } from './helpers';

vi.mock('../context');
vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return { ...actual, useFormFields: vi.fn() };
});

beforeEach(resetFormFields);
afterEach(() => vi.clearAllMocks());

describe('useEmployeeStepSubmitHandler', () => {
  const mockForm = { setError: vi.fn() } as unknown as UseFormReturn;

  it('calls onSubmit, bag.onSubmit, onSuccess, then advances', async () => {
    const next = vi.fn();
    const bagOnSubmit = vi.fn().mockResolvedValue({ id: '1' });
    mockContext(buildBag({ onSubmit: bagOnSubmit, next }));

    const onSubmit = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onSubmit, onSuccess, onError }),
    );
    await result.current({ a: 1 }, mockForm);
    expect(onSubmit).toHaveBeenCalledWith({ a: 1 });
    expect(bagOnSubmit).toHaveBeenCalledWith({ a: 1 });
    expect(onSuccess).toHaveBeenCalledWith({ id: '1' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes mutation-shaped errors through onError with normalized field errors, without advancing', async () => {
    const next = vi.fn();
    const mutationErr = {
      error: new Error('boom'),
      rawError: { message: 'boom' },
      normalizedErrors: {},
      fieldErrors: [{ field: 'x', messages: ['bad'] }],
    };
    const bagOnSubmit = vi.fn().mockRejectedValue(mutationErr);
    mockContext(buildBag({ onSubmit: bagOnSubmit, next }));

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onError }),
    );
    await result.current({}, mockForm);
    // handleStepError normalizes fieldErrors so they attach to form fields.
    expect(onError).toHaveBeenCalledWith({
      error: mutationErr.error,
      rawError: mutationErr.rawError,
      fieldErrors: [{ field: 'x', messages: ['bad'], userFriendlyLabel: 'x' }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('wraps non-MutationError into a structured error shape', async () => {
    const plainErr = new Error('plain');
    const bagOnSubmit = vi.fn().mockRejectedValue(plainErr);
    mockContext(buildBag({ onSubmit: bagOnSubmit }));

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onError }),
    );
    await result.current({}, mockForm);
    expect(onError).toHaveBeenCalledWith({
      error: plainErr,
      rawError: { message: 'plain' },
      fieldErrors: [],
    });
  });
});

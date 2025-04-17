import { act, renderHook, waitFor } from '@testing-library/react';
import { useStepState } from './useStepState';

describe('useStepState', () => {
  const mockSteps = {
    step1: { index: 0, name: 'step1' },
    step2: { index: 1, name: 'step2' },
    step3: { index: 2, name: 'step3' },
  };

  it('should throw error when no steps are provided', () => {
    expect(() => {
      renderHook(() => useStepState({}));
    }).toThrow('No steps provided to useStepState');
  });

  it('should initialize with first step', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    expect(result.current.stepState.currentStep).toEqual(mockSteps.step1);
    expect(result.current.stepState.totalSteps).toBe(3);
    expect(result.current.stepState.values).toBeNull();
    expect(result.current.fieldValues).toEqual({});
  });

  it('should move to next step and store values', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    act(() => {
      result.current.setFieldValues({ name: 'John' });
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.stepState.currentStep).toEqual(mockSteps.step2);
    expect(result.current.stepState.values).toEqual({
      step1: { name: 'John' },
    });
  });

  it('should move back to previous step', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    // Move to step 2
    act(() => {
      result.current.setFieldValues({ name: 'John' });
      result.current.nextStep();
    });

    // Move back to step 1
    act(() => {
      result.current.previousStep();
    });

    expect(result.current.stepState.currentStep).toEqual(mockSteps.step1);
  });

  it('should not move next if at last step', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    // Move to step 3
    act(() => {
      result.current.setFieldValues({ name: 'John' });
      result.current.nextStep();
      result.current.setFieldValues({ age: 30 });
      result.current.nextStep();
    });

    // Try to move next from last step
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.stepState.currentStep).toEqual(mockSteps.step3);
  });

  it('should not move back if at first step', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.stepState.currentStep).toEqual(mockSteps.step1);
  });

  it('should accumulate values from all steps', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    // Step 1
    act(() => {
      result.current.setFieldValues({ name: 'John' });
    });
    act(() => {
      result.current.nextStep();
    });

    // Step 2
    act(() => {
      result.current.setFieldValues({ age: 30 });
    });
    act(() => {
      result.current.nextStep();
    });

    // Step 3
    act(() => {
      result.current.setFieldValues({ email: 'john@example.com' });
    });

    act(() => {
      result.current.nextStep();
    });

    waitFor(() => {
      expect(result.current.stepState.values).toEqual({
        step1: { name: 'John' },
        step2: { age: 30 },
        step3: { email: 'john@example.com' },
      });
    });
  });

  it('should maintain field values when moving between steps', () => {
    const { result } = renderHook(() => useStepState(mockSteps));

    // Set values for step 1
    act(() => {
      result.current.setFieldValues({ name: 'John' });
    });

    // Move to step 2
    act(() => {
      result.current.nextStep();
    });

    // Set values for step 2
    act(() => {
      result.current.setFieldValues({ age: 30 });
    });

    // Move back to step 1
    act(() => {
      result.current.previousStep();
    });

    // Move forward again
    act(() => {
      result.current.nextStep();
    });

    waitFor(() => {
      expect(result.current.stepState.values).toEqual({
        step1: {
          name: 'John',
        },
        step2: {
          age: 30,
        },
      });
    });
  });
});

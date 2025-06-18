import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';

export function useDebounce(
  callback: (value: string) => Promise<void>,
  delay: number,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useRef(
    debounce((value: string) => {
      callbackRef.current(value);
    }, delay),
  ).current;

  return useCallback(
    (value: string) => {
      debouncedFn(value);
    },
    [debouncedFn],
  );
}

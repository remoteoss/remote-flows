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
    // WE NEED TO FIX: react-hooks/refs - Passing a ref to a function may read its value during render
    // eslint-disable-next-line react-hooks/refs
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

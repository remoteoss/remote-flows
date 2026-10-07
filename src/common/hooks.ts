import { useCallback, useEffect, useRef, useState } from 'react';
import equal from 'fast-deep-equal';
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
    // oxlint-disable-next-line react-hooks/refs
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

export function useDeepStable<T>(value: T): T {
  const [stable, setStable] = useState(value);
  if (!equal(stable, value)) {
    setStable(value);
  }
  return stable;
}

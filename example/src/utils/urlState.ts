import { useEffect, useState, useCallback } from 'react';

/**
 * Updates the URL with new search params using pushState
 * @param params - Object with key-value pairs to set in the URL
 * @param replace - If true, uses replaceState instead of pushState
 */
export const updateUrlParams = (
  params: Record<string, string>,
  replace = false,
): void => {
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
};

/**
 * Gets a URL search param value
 * @param key - The param key to retrieve
 * @returns The param value or null if not found
 */
export const getUrlParam = (key: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
};

/**
 * Hook that syncs a state value with a URL parameter
 * Handles both updating the URL when state changes and updating state when URL changes (back/forward navigation)
 *
 * @param key - The URL parameter key
 * @param defaultValue - Default value if the param is not in the URL
 * @param options.replace - Use replaceState instead of pushState
 * @param options.validate - Optional function to validate the value from URL before setting state
 * @returns [value, setValue] - State value and setter function
 */
export const useUrlState = <T extends string>(
  key: string,
  defaultValue: T,
  options: {
    replace?: boolean;
    validate?: (value: string) => boolean;
  } = {},
): [T, (value: T) => void] => {
  const { replace = false, validate } = options;

  // Initialize state from URL or default
  const [value, setValue] = useState<T>(() => {
    const urlValue = getUrlParam(key);
    if (urlValue && (!validate || validate(urlValue))) {
      return urlValue as T;
    }
    return defaultValue;
  });

  // Update URL when state changes
  const setValueAndUrl = useCallback(
    (newValue: T) => {
      setValue(newValue);
      updateUrlParams({ [key]: newValue }, replace);
    },
    [key, replace],
  );

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlValue = getUrlParam(key);
      if (urlValue && (!validate || validate(urlValue))) {
        setValue(urlValue as T);
      } else {
        setValue(defaultValue);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [key, defaultValue, validate]);

  return [value, setValueAndUrl];
};

/**
 * Hook that listens to URL changes (back/forward navigation) and calls a callback
 * Useful when you need to react to URL changes but manage state separately
 *
 * @param callback - Function called when the URL changes via browser navigation
 */
export const useUrlListener = (callback: () => void): void => {
  useEffect(() => {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
  }, [callback]);
};

/**
 * Hook that returns all URL search params as an object
 * Updates when the URL changes via browser navigation
 *
 * @returns Object with all URL search params
 */
export const useUrlParams = (): Record<string, string> => {
  const [params, setParams] = useState<Record<string, string>>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(urlParams.entries());
  });

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setParams(Object.fromEntries(urlParams.entries()));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return params;
};

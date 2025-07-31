import { useState, useEffect, useCallback } from 'react';

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const handleUrlChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('urlChanged', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlChanged', handleUrlChange);
    };
  }, []);

  // Next.js-like API
  const get = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const has = useCallback(
    (key: string) => {
      return searchParams.has(key);
    },
    [searchParams],
  );

  const toString = useCallback(() => {
    return searchParams.toString();
  }, [searchParams]);

  return {
    get,
    has,
    toString,
    searchParams,
  };
};

import { useCallback } from 'react';

export const useRouter = () => {
  const push = useCallback((url: string) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new CustomEvent('urlChanged'));
  }, []);

  const replace = useCallback((url: string) => {
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new CustomEvent('urlChanged'));
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  // Utility method for updating search params
  const setSearchParams = useCallback(
    (params: Record<string, string | null>) => {
      const url = new URL(window.location.href);

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, value);
        }
      });

      push(url.toString());
    },
    [push],
  );

  return {
    push,
    replace,
    back,
    forward,
    setSearchParams,
  };
};

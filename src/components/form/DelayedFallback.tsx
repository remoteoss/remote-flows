import { useState, useEffect, ReactNode } from 'react';

type DelayedFallbackProps = {
  /** The fallback component to show after the delay */
  fallback: ReactNode;
  /** Delay in milliseconds before showing the fallback (default: 200ms) */
  delay?: number;
};

/**
 * A wrapper component that delays showing a fallback for a specified time.
 *
 * This prevents UI flashing when lazy-loaded components resolve quickly.
 * If the component loads within the delay period, no fallback is shown at all.
 *
 * @example
 * <Suspense fallback={<DelayedFallback fallback={<LoadingSkeleton />} />}>
 *   <LazyComponent />
 * </Suspense>
 */
export function DelayedFallback({ fallback, delay = 200 }: DelayedFallbackProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showFallback ? <>{fallback}</> : null;
}

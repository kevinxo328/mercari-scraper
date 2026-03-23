import { useHydrated } from '@tanstack/react-router';
import { useEffect } from 'react';

export function useForceScrollTopOnMount() {
  const isHydrated = useHydrated();

  useEffect(() => {
    if (!isHydrated) return;

    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [isHydrated]);
}

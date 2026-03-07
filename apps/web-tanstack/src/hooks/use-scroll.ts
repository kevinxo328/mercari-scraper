'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to track if the window has been scrolled.
 * @param threshold The number of pixels to scroll before triggering the scrolled state.
 * @returns boolean indicating if the window has been scrolled past the threshold.
 */
export function useScroll(threshold = 0) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Initialize state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}

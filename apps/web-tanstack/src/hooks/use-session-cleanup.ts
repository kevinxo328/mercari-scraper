import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useSession } from '@/lib/auth-client';

export function useSessionCleanup() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const prevSessionRef = useRef(session);

  useEffect(() => {
    // Only clear cache when transitioning from logged-in to logged-out
    if (prevSessionRef.current && !session) {
      queryClient.clear();
    }
    prevSessionRef.current = session;
  }, [session, queryClient]);
}

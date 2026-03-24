import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useSession } from '@/lib/auth-client';

export function useSessionCleanup() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;
  const prevUserIdRef = useRef<string | null>(currentUserId);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevUserIdRef.current = currentUserId;
      return;
    }

    // Clear cache when a logged-in user logs out or switches accounts.
    if (
      prevUserIdRef.current !== null &&
      prevUserIdRef.current !== currentUserId
    ) {
      queryClient.clear();
    }

    prevUserIdRef.current = currentUserId;
  }, [currentUserId, queryClient]);
}

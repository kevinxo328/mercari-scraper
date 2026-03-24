import { createContext, useContext } from 'react';

import type { TrpcProxy } from './proxy';

const TRPCContext = createContext<TrpcProxy | null>(null);

export function TRPCOptionsProvider({
  trpc,
  children
}: Readonly<{
  trpc: TrpcProxy;
  children: React.ReactNode;
}>) {
  return <TRPCContext.Provider value={trpc}>{children}</TRPCContext.Provider>;
}

export function useTRPC() {
  const trpc = useContext(TRPCContext);

  if (!trpc) {
    throw new Error('useTRPC must be used within the router provider');
  }

  return trpc;
}

import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createContext } from './setup';
import { appRouter } from './routers/index';
import {
  createTRPCOptionsProxy,
  TRPCQueryOptions
} from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { makeQueryClient } from './shared/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient
});

export const caller = appRouter.createCaller(createContext);

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    await queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    await queryClient.prefetchQuery(queryOptions);
  }
}

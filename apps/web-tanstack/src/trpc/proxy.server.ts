import { getRequestHeaders } from '@tanstack/react-start/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from './routers';
import { createContext } from './setup';

export function createServerFetch(): typeof fetch {
  return async (input, init) => {
    const serverHeaders = getRequestHeaders();
    const requestHeaders = new Headers(serverHeaders as HeadersInit);

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    }

    return fetchRequestHandler({
      req: new Request(new URL(input.toString(), 'http://localhost'), {
        ...init,
        headers: requestHeaders
      }),
      router: appRouter,
      endpoint: '/api/trpc',
      createContext: ({ req }) => createContext({ req })
    });
  };
}

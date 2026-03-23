/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools
      }))
    );

// eslint-disable-next-line turbo/no-undeclared-env-vars
const ReactQueryDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools
      }))
    );

import AppHeader from '@/components/app-header';
import { Toaster } from '@/components/shadcn/sonner';

import globalsCss from '../styles/globals.css?url';

function RootPending() {
  return (
    <div className="flex grow h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-100" />
    </div>
  );
}

export const Route = createRootRoute({
  pendingComponent: RootPending,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        name: 'description',
        content: 'This website shows the scraped data from Mercari'
      },
      {
        title: 'Mercari Scraper'
      }
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico'
      },
      {
        rel: 'stylesheet',
        href: globalsCss
      }
    ]
  }),
  component: RootLayout
});

function RootLayout() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh flex flex-col">
        <AppHeader />
        <Outlet />
        <Toaster />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

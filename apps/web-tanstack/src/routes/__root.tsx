/// <reference types="vite/client" />

import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import type { TrpcProxy } from '@/router';

interface RouterContext {
  queryClient: QueryClient;
  trpc: TrpcProxy;
}

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
import { NotFound } from '@/components/not-found';
import { Toaster } from '@/components/shadcn/sonner';
import { usePwaUpdatePrompt } from '@/hooks/use-pwa-update-prompt';
import { useScraperForegroundRefresh } from '@/hooks/use-scraper-foreground-refresh';
import { useSessionCleanup } from '@/hooks/use-session-cleanup';

import globalsCss from '../styles/globals.css?url';

function RootPending() {
  return (
    <div className="flex grow h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-100" />
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: RootPending,
  notFoundComponent: NotFound,
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
      },
      {
        name: 'theme-color',
        content: '#030712'
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes'
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent'
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Mercari Scraper'
      }
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico'
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png'
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
  // Add session cleanup functionality
  useSessionCleanup();
  usePwaUpdatePrompt();
  useScraperForegroundRefresh();

  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#030712' }}>
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

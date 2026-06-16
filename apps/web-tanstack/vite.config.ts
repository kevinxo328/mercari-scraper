// vite.config.ts
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const reactCompilerBabelOptions = {
  // The React Compiler Babel pass also runs on workspace packages that Vite
  // bundles from source. Teach Babel to parse TypeScript for normal .ts/.tsx
  // files and for TanStack Router split chunks that append a query string
  // (e.g. index.tsx?tsr-split=component).
  include: /\.(?:ts|tsx)(?:$|\?)/,
  parserOpts: { plugins: ['typescript', 'jsx'] },
  presets: [reactCompilerPreset()]
};

const isVercelBuild = process.env.VERCEL === '1';
const pwaOutDir = isVercelBuild ? '.vercel/output/static' : '.output/public';
const noStoreHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 3000
  },
  ssr: {
    external: ['pg'],
    // In dev, node_modules are available so we don't need to bundle these.
    // In production (e.g. Vercel), node_modules may be absent so they must
    // be inlined to avoid runtime resolution failures.
    noExternal:
      process.env.NODE_ENV === 'production'
        ? ['@prisma/client', '@prisma/adapter-pg', '@mercari-scraper/database']
        : []
  },
  plugins: [
    VitePWA({
      injectRegister: false,
      registerType: 'prompt',
      outDir: pwaOutDir,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        navigateFallback: null
      },
      manifest: {
        name: 'Mercari Scraper',
        short_name: 'Mercari Scraper',
        description: 'This website shows the scraped data from Mercari',
        theme_color: '#030712',
        background_color: '#030712',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    tailwindcss(),
    // Enables Vite to resolve imports using path aliases.
    tanstackStart({
      srcDirectory: 'src', // This is the default
      router: {
        // Specifies the directory TanStack Router uses for your routes.
        routesDirectory: 'routes' // Defaults to "routes", relative to srcDirectory
      }
    }),
    nitro({
      preset: isVercelBuild ? 'vercel' : 'node-server',
      routeRules: {
        '/sw.js': { headers: noStoreHeaders },
        '/registerSW.js': { headers: noStoreHeaders },
        '/manifest.webmanifest': { headers: noStoreHeaders },
        '/**': { headers: securityHeaders }
      },
      unenv: {}
    }),
    // plugin-react v6: JSX transform and Fast Refresh are handled by Oxc (no Babel).
    react(),
    // Run React Compiler via Babel separately, since plugin-react v6 dropped Babel.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    babel(reactCompilerBabelOptions as any),
    process.env.ANALYZE === 'true' &&
      visualizer({ open: true, gzipSize: true, filename: 'stats.html' })
  ],
  build: {
    rollupOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: {
        // codeSplitting is a Rolldown feature; types not yet in rolldown-vite
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules\/react(?:-dom)?\//
            },
            {
              name: 'vendor-ui',
              test: /node_modules\/(@radix-ui|lucide-react|sonner|cmdk)\//
            },
            {
              name: 'vendor-query',
              test: /node_modules\/(@tanstack\/(react-query|query-core|react-query-devtools|react-table|react-virtual)|@trpc\/(client|react-query|tanstack-react-query)|superjson)\//
            },
            {
              name: 'vendor-forms',
              test: /node_modules\/(react-hook-form|@hookform|zod)\//
            }
          ]
        }
      }
    }
  }
});

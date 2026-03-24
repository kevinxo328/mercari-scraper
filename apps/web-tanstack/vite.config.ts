// vite.config.ts
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

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
      unenv: {}
    }),
    // plugin-react v6: JSX transform and Fast Refresh are handled by Oxc (no Babel).
    react(),
    // Run React Compiler via Babel separately, since plugin-react v6 dropped Babel.
    babel({
      // The React Compiler Babel pass also runs on workspace packages that Vite
      // bundles from source. Teach Babel to parse TypeScript for normal .ts/.tsx
      // files and for TanStack Router split chunks that append a query string
      // (e.g. index.tsx?tsr-split=component).
      include: /\.(?:ts|tsx)(?:$|\?)/,
      parserOpts: { plugins: ['typescript', 'jsx'] },
      presets: [reactCompilerPreset()],
    }),
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

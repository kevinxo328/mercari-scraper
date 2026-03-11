// vite.config.ts
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { nitro } from 'nitro/vite';

export default defineConfig({
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
    tsconfigPaths(),
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
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    }),
    process.env.ANALYZE === 'true' &&
      visualizer({ open: true, gzipSize: true, filename: 'stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
        // 'compat' interop prevents the CJS→ESM TDZ bug for pg and similar
        // CJS modules when bundled by Vite's SSR build (e.g. on Vercel where
        // node_modules are not available and pg must be inlined).
        interop: 'compat',
        manualChunks(id) {
          if (!id.includes('node_modules/')) {
            return;
          }

          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }

          if (
            id.includes('node_modules/@radix-ui/') ||
            id.includes('node_modules/lucide-react/') ||
            id.includes('node_modules/sonner/') ||
            id.includes('node_modules/cmdk/')
          ) {
            return 'vendor-ui';
          }

          if (
            id.includes('node_modules/@tanstack/react-query/') ||
            id.includes('node_modules/@tanstack/query-core/') ||
            id.includes('node_modules/@tanstack/react-query-devtools/') ||
            id.includes('node_modules/@tanstack/react-table/') ||
            id.includes('node_modules/@tanstack/react-virtual/') ||
            id.includes('node_modules/@trpc/client/') ||
            id.includes('node_modules/@trpc/react-query/') ||
            id.includes('node_modules/@trpc/tanstack-react-query/') ||
            id.includes('node_modules/superjson/')
          ) {
            return 'vendor-query';
          }

          if (
            id.includes('node_modules/react-hook-form/') ||
            id.includes('node_modules/@hookform/') ||
            id.includes('node_modules/zod/')
          ) {
            return 'vendor-forms';
          }
        }
      }
    }
  }
});

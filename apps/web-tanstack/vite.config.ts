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
      rollupConfig: {
        // 'compat' interop prevents the CJS→ESM TDZ bug where `pg`'s
        // `get default()` getter fires before the variable is initialised.
        output: {
          interop: 'compat'
        }
      }
    }),
    viteReact(),
    process.env.ANALYZE === 'true' &&
      visualizer({ open: true, gzipSize: true, filename: 'stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
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

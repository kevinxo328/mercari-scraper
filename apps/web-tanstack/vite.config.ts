// vite.config.ts
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

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
    viteReact(),
    process.env.ANALYZE === 'true' &&
      visualizer({ open: true, gzipSize: true, filename: 'stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }
          if (
            id.includes('node_modules/@tanstack/react-router/') ||
            id.includes('node_modules/@tanstack/react-query/') ||
            id.includes('node_modules/@tanstack/react-start/') ||
            id.includes('node_modules/@tanstack/react-virtual/')
          ) {
            return 'vendor-tanstack';
          }
          if (
            id.includes('node_modules/@radix-ui/') ||
            id.includes('node_modules/lucide-react/') ||
            id.includes('node_modules/sonner/')
          ) {
            return 'vendor-ui';
          }
          if (
            id.includes('node_modules/@trpc/client/') ||
            id.includes('node_modules/@trpc/tanstack-react-query/')
          ) {
            return 'vendor-trpc';
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

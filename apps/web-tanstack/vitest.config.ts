import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__test__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
});

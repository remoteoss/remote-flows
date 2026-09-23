import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/verify-contract-details-version/verify.test.ts'],
    globals: true,
    environment: 'jsdom',
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
  resolve: {
    alias: {
      '@': import.meta.dirname,
    },
  },
});

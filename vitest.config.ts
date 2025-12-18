import path from 'path';
import { defineConfig } from 'vitest/config';
import { COVERAGE_THRESHOLDS } from './scripts/coverage-utils';

export default defineConfig({
  test: {
    include: ['example/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'example/node_modules/**', 'example/e2e/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules',
        'example/e2e',
        'src/**/*.test.{ts,tsx}',
        'src/tests/**/*.{ts,tsx}',
        'src/**/tests/*.{ts,tsx}',
        'src/client/**/*.{ts,tsx}',
      ],
      thresholds: {
        lines: COVERAGE_THRESHOLDS.lines,
        functions: COVERAGE_THRESHOLDS.functions,
        branches: COVERAGE_THRESHOLDS.branches,
        statements: COVERAGE_THRESHOLDS.statements,
      },
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

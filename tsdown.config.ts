import { defineConfig } from 'tsdown/config';
import { ENVIRONMENTS } from './src/environments.ts';

const env = process.env.NODE_ENV;

export default defineConfig({
  target: 'esnext',
  clean: true,
  dts: true,
  fixedExtension: false,
  entry: [
    'src/index.tsx',
    'src/internals.ts',
    'src/default-components.ts',
    'src/flows',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/tests',
    '!src/**/*.md',
  ],
  minify: true,
  sourcemap: true,
  format: ['esm'],
  outDir: 'dist',
  env: {
    VERSION: process.env.npm_package_version || '',
    REMOTE_GATEWAY_URL:
      env === 'production' ? ENVIRONMENTS.production : ENVIRONMENTS.staging,
  },
  deps: {
    neverBundle: ['react', 'react-dom'],
    alwaysBundle: ['react-hook-form', '@hookform/resolvers'],
  },
  outputOptions: {
    keepNames: true,
  },
});

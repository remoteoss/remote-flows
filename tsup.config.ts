import { Options } from 'tsup';
import { ENVIRONMENTS } from './src/environments';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  target: 'esnext',
  clean: true,
  dts: true,
  entry: [
    'src/index.tsx',
    'src/flows',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/tests/*.{ts,tsx}',
    '!src/**/*.md',
  ],
  keepNames: true,
  minify: true,
  sourcemap: true,
  format: ['esm'],
  outDir: 'dist',
  env: {
    VERSION: process.env.npm_package_version || '',
    REMOTE_GATEWAY_URL:
      env === 'production' ? ENVIRONMENTS.production : ENVIRONMENTS.staging,
  },
  external: ['react', 'react-dom'],
  noExternal: ['react-hook-form', '@hookform/resolvers'],
};

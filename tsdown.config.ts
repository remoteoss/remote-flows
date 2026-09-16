import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsdown';
import { ENVIRONMENTS } from './src/environments';

const env = process.env.NODE_ENV;

export default defineConfig({
  target: 'esnext',
  clean: true,
  dts: true,
  entry: [
    'src/index.tsx',
    'src/styles.ts',
    'src/internals.ts',
    'src/default-components.ts',
    'src/flows/*/index.ts',
  ],
  // NOTE: tsdown/rolldown has no `keepNames` equivalent to tsup's esbuild-backed
  // option (which prevents the minifier from renaming functions/classes) as of 0.23.0.
  minify: true,
  sourcemap: true,
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  css: {
    transformer: 'postcss',
    // `index.tsx` and `styles.ts` both import the same global.css, and tsdown
    // (unlike tsup) dedupes that into one shared asset rather than emitting a
    // copy per entry. index.css/styles.css are byte-identical anyway (verified
    // against the tsup baseline — only the sourcemap comment differs), so build
    // the single dedup'd file as index.css and mirror it to styles.css below.
    fileName: 'index.css',
  },
  env: {
    VERSION: process.env.npm_package_version || '',
    REMOTE_GATEWAY_URL:
      env === 'production' ? ENVIRONMENTS.production : ENVIRONMENTS.staging,
    RF_INTERNAL_DEV: env === 'production' ? 'false' : 'true',
  },
  external: ['react', 'react-dom'],
  noExternal: ['react-hook-form', '@hookform/resolvers'],
  onSuccess: async () => {
    await copyFile('dist/index.css', 'dist/styles.css');
    await copyFile('dist/index.css.map', 'dist/styles.css.map').catch(() => {});
  },
});

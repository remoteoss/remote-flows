import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  external: ['react', 'react-dom'],
  minify: false, // Keep readable for prototyping
});

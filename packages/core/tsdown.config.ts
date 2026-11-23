import { defineConfig } from 'tsdown';

export default defineConfig({
  target: 'esnext',
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    'client/index': 'src/client/index.ts',
    'client/client/index': 'src/client/client/index.ts',
    'client/client.gen': 'src/client/client.gen.ts',
    'client/sdk.gen': 'src/client/sdk.gen.ts',
    'client/types.gen': 'src/client/types.gen.ts',
  },
  format: ['esm'],
  outDir: 'dist',
  sourcemap: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
});

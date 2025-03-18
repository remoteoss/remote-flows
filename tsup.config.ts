import { Options } from 'tsup';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  target: 'esnext',
  clean: true,
  dts: true,
  entry: [
    'src/index.tsx',
    'src/flows',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/fixtures.{ts,tsx}',
  ],
  keepNames: true,
  minify: true,
  sourcemap: true,
  format: ['esm'],
  outDir: 'dist',
  env: {
    REMOTE_GATEWAY_URL:
      env === 'production'
        ? 'https://gateway.remote.com/'
        : 'https://gateway.niceremote.com/',
  },
};

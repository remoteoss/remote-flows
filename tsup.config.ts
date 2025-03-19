import { Options } from 'tsup';
import { ENVIROMENTS } from './src/environments';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  target: 'esnext',
  clean: true,
  dts: true,
  entry: ['src/index.tsx', 'src/flows'],
  keepNames: true,
  minify: true,
  sourcemap: true,
  format: ['esm'],
  outDir: 'dist',
  env: {
    REMOTE_GATEWAY_URL:
      env === 'production' ? ENVIROMENTS.production : ENVIROMENTS.staging,
  },
};

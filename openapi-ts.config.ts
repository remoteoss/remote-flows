import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  // local gateway http://localhost:4000/api/eor/openapi
  input: 'http://localhost:4000/api/eor/openapi',
  output: 'src/client',
  plugins: defaultPlugins,
});

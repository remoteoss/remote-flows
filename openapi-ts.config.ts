import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  // local gateway http://localhost:4000/api/eor/openapi
  input: 'https://gateway.remote.com/v1/docs/openapi.json',
  output: 'src/client',
  plugins: defaultPlugins,
});

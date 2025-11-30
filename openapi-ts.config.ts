import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:4000/api/eor/v1/docs/openapi.json',
  output: 'src/client',
  plugins: defaultPlugins,
});

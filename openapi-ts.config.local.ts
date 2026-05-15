import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  // Local gateway with new endpoints
  input: 'http://localhost:4000/api/eor/openapi',
  output: 'src/client',
  plugins: defaultPlugins,
});

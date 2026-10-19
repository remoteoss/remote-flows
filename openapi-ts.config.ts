import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  // Production gateway - use pnpm run openapi-ts for production generation
  // For local gateway with new endpoints, use pnpm run openapi-ts:local instead
  input: 'https://gateway.remote.com/v1/docs/openapi.json',
  output: 'src/client',
  plugins: defaultPlugins,
});

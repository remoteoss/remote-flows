import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://gateway.remote.com/v1/docs/openapi.json",
  output: "src/client",
  plugins: [...defaultPlugins, "@hey-api/client-fetch"],
});

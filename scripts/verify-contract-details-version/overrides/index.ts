import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultOverridesDirectory = path.dirname(fileURLToPath(import.meta.url));

export async function loadOverride(
  country: string,
  overridesDirectory: string = defaultOverridesDirectory,
): Promise<Record<string, unknown>> {
  const filePath = path.join(overridesDirectory, `${country.toUpperCase()}.ts`);

  if (!existsSync(filePath)) return {};

  const module = (await import(filePath)) as {
    default?: Record<string, unknown>;
  };
  return module.default || {};
}

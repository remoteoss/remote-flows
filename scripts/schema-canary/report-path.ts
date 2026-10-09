import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA_CANARY_REPORT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'reports',
  'schema-canary.json',
);

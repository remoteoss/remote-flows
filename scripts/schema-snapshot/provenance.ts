import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Provenance = {
  recordedAt: string;
  remoteFlowsSha: string;
  formKitVersion: string;
  jsonSchemaFormVersion: string;
  schemaHash: string;
  basicInformation: Record<string, unknown>;
};

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }
  return value;
}

export function hashSchema(schema: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(sortKeys(schema)))
    .digest('hex')
    .slice(0, 16);
}

function installedVersion(packageName: string): string {
  const file = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json',
  );
  return (JSON.parse(readFileSync(file, 'utf8')) as { version: string })
    .version;
}

function currentSha(): string {
  return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

export function buildProvenance(
  schema: unknown,
  basicInformation: Record<string, unknown>,
): Provenance {
  return {
    recordedAt: new Date().toISOString(),
    remoteFlowsSha: currentSha(),
    formKitVersion: installedVersion('@remoteoss/remote-json-schema-form-kit'),
    jsonSchemaFormVersion: installedVersion('@remoteoss/json-schema-form'),
    schemaHash: hashSchema(schema),
    basicInformation,
  };
}

function changedKeys(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => key !== 'provisional_start_date')
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .sort();
}

/** Says what differs between the run that wrote a baseline and the current run, to tell a drifting schema from a changed engine or seed. */
export function describeProvenanceDrift(
  baseline: Provenance | undefined,
  current: Provenance,
): string[] {
  if (!baseline) {
    return ['The baseline has no provenance, so the runs cannot be compared.'];
  }
  const lines: string[] = [];
  const suffix = `(baseline recorded ${baseline.recordedAt} at ${baseline.remoteFlowsSha})`;
  if (baseline.schemaHash !== current.schemaHash) {
    lines.push(
      `The served schema changed (hash ${baseline.schemaHash} -> ${current.schemaHash}) ${suffix}.`,
    );
  } else {
    lines.push(
      `The served schema is identical to the baseline's (hash ${current.schemaHash}), so the difference comes from the engine or the seeded employment.`,
    );
  }
  if (baseline.formKitVersion !== current.formKitVersion) {
    lines.push(
      `remote-json-schema-form-kit: ${baseline.formKitVersion} -> ${current.formKitVersion}.`,
    );
  }
  if (baseline.jsonSchemaFormVersion !== current.jsonSchemaFormVersion) {
    lines.push(
      `json-schema-form: ${baseline.jsonSchemaFormVersion} -> ${current.jsonSchemaFormVersion}.`,
    );
  }
  const seedChanges = changedKeys(
    baseline.basicInformation,
    current.basicInformation,
  );
  if (seedChanges.length > 0) {
    lines.push(
      `Seeded basic information differs on: ${seedChanges.join(', ')}.`,
    );
  }
  return lines;
}

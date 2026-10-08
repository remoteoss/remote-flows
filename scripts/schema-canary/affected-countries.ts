import { isDeepStrictEqual } from 'node:util';

export const COUNTRY_SCOPED_FILES: Record<string, string> = {
  'example/src/flows/Onboarding/jsonSchemaVersions.ts':
    'ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY',
  'scripts/contract-details-seeds.ts': 'CONTRACT_DETAILS_SEEDS',
  'scripts/schema-canary/known-unsaved-fields.ts': 'KNOWN_UNSAVED_FIELDS',
};

const ALL_COUNTRIES_PATHS = [
  'package.json',
  'package-lock.json',
  'src/common/createHeadlessForm.tsx',
  'src/common/headlessForm.ts',
  'src/components/form/',
  'src/flows/Onboarding/',
  'scripts/fill-schema.ts',
  'scripts/schema-canary.ts',
  'scripts/schema-canary/',
  'scripts/schema-canary-archive.ts',
  'scripts/schema-canary-affected.ts',
  'example/src/flows/Onboarding/',
  'example/e2e/canary/',
  'example/playwright.canary.config.ts',
  '.github/actions/schema-canary-browser/',
  '.github/workflows/schema-canary.yml',
];

export type FileExports = Record<string, unknown>;

export type ChangedFile = {
  path: string;
  before?: FileExports;
  after?: FileExports;
};

export function changedCountries(
  exportName: string,
  before: FileExports = {},
  after: FileExports = {},
): string[] | 'all' {
  const names = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const name of names) {
    if (name !== exportName && !isDeepStrictEqual(before[name], after[name])) {
      return 'all';
    }
  }
  const beforeByCountry = (before[exportName] ?? {}) as FileExports;
  const afterByCountry = (after[exportName] ?? {}) as FileExports;
  const countries = new Set([
    ...Object.keys(beforeByCountry),
    ...Object.keys(afterByCountry),
  ]);
  return [...countries].filter(
    (country) =>
      !isDeepStrictEqual(beforeByCountry[country], afterByCountry[country]),
  );
}

export function affectedCountries(files: ChangedFile[]): string[] | 'all' {
  const countries = new Set<string>();
  for (const file of files) {
    const exportName = COUNTRY_SCOPED_FILES[file.path];
    if (exportName) {
      const changed = changedCountries(exportName, file.before, file.after);
      if (changed === 'all') return 'all';
      changed.forEach((country) => countries.add(country));
    } else if (
      ALL_COUNTRIES_PATHS.some((path) =>
        path.endsWith('/') ? file.path.startsWith(path) : file.path === path,
      )
    ) {
      return 'all';
    }
  }
  return [...countries].sort();
}

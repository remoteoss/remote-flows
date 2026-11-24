import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(
  readFileSync(new URL('package.json', root), 'utf8'),
);
const target = new URL('src/version.ts', root);
const content = `export const npmPackageVersion = '${version}';\n`;

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(target, 'utf8');
  } catch {
    current = '';
  }
  if (current !== content) {
    console.error(
      `src/version.ts is out of date with package.json (${version}). Run: pnpm --filter @remoteoss/remote-flows-angular run version:write`,
    );
    process.exit(1);
  }
} else {
  writeFileSync(target, content);
}

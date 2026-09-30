#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { globSync } from 'glob';
import chalk from 'chalk';

function checkFlowSubpaths(): void {
  console.log(
    chalk.blue.bold(
      '\n🔍 Checking ./flows/* subpaths in the packed tarball...\n',
    ),
  );

  const sources = globSync('src/flows/**/*.{ts,tsx}', {
    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/tests/**'],
  });

  const [pack] = JSON.parse(
    execSync('npm pack --dry-run --json --ignore-scripts', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  ) as Array<{ files: Array<{ path: string }> }>;
  const packed = new Set(pack.files.map((file) => file.path));

  const missing = sources.flatMap((source) => {
    const base = source.replace(/^src\//, 'dist/').replace(/\.tsx?$/, '');
    return [`${base}.js`, `${base}.d.ts`].filter((file) => !packed.has(file));
  });

  if (missing.length > 0) {
    console.error(
      chalk.red.bold(
        `❌ ${missing.length} ./flows/* subpath file(s) missing from the tarball:\n`,
      ),
    );
    missing.forEach((file) => console.error(chalk.red(`  ${file}`)));
    process.exit(1);
  }

  console.log(
    chalk.green(
      `✅ All ${sources.length} flow modules are importable via ./flows/*\n`,
    ),
  );
}

checkFlowSubpaths();

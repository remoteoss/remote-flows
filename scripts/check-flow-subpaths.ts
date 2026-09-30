#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { globSync } from 'glob';
import chalk from 'chalk';

const PARTNER_SUBPATHS: Record<string, string[]> = {
  'flows/CostCalculator/api': ['useCostCalculatorCountries'],
  'flows/CostCalculator/context': ['useCostCalculatorContext'],
  'flows/ContractAmendment/utils': ['STEPS'],
};

async function checkPartnerSubpaths(): Promise<void> {
  const failures: string[] = [];
  for (const [subpath, names] of Object.entries(PARTNER_SUBPATHS)) {
    const specifier = `@remoteoss/remote-flows/${subpath}`;
    try {
      const mod: Record<string, unknown> = await import(specifier);
      names
        .filter((name) => mod[name] === undefined)
        .forEach((name) => failures.push(`${specifier} has no export ${name}`));
    } catch (error) {
      failures.push(`${specifier}: ${(error as Error).message}`);
    }
  }

  if (failures.length > 0) {
    console.error(chalk.red.bold('❌ Partner subpath imports failed:\n'));
    failures.forEach((failure) => console.error(chalk.red(`  ${failure}`)));
    process.exit(1);
  }

  console.log(
    chalk.green(
      `✅ ${Object.keys(PARTNER_SUBPATHS).length} partner subpaths resolve and export what they used to\n`,
    ),
  );
}

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
await checkPartnerSubpaths();

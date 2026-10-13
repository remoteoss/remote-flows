#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import chalk from 'chalk';

const PACKAGE_NAME = '@remoteoss/json-schema-form';
const KIT_NAME = '@remoteoss/remote-json-schema-form-kit';

type TreeNode = {
  version?: string;
  dependencies?: Record<string, TreeNode>;
};

function collectVersions(node: TreeNode, found: Set<string>): void {
  Object.entries(node.dependencies ?? {}).forEach(([name, child]) => {
    if (name === PACKAGE_NAME && child.version) {
      found.add(child.version);
    }
    collectVersions(child, found);
  });
}

function readTree(): string {
  try {
    return execSync(`npm ls ${PACKAGE_NAME} --all --json`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    return (error as { stdout: string }).stdout;
  }
}

type PackageJson = { dependencies?: Record<string, string> };

function readPackageJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
}

function checkPinMatchesKit(): boolean {
  const declared = readPackageJson('package.json').dependencies?.[PACKAGE_NAME];
  const required = readPackageJson(`node_modules/${KIT_NAME}/package.json`)
    .dependencies?.[PACKAGE_NAME];
  const kitFloor = required?.replace(/^[\^~>=\s]+/, '');

  if (!declared || !kitFloor || declared === kitFloor) {
    return true;
  }

  console.error(
    chalk.red.bold(
      `❌ ${PACKAGE_NAME} is declared as ${declared}; it must be pinned to the floor of what ${KIT_NAME} requires (${required})`,
    ),
  );
  console.error(
    chalk.red(
      `  Set "${PACKAGE_NAME}": "${kitFloor}" in package.json, then run npm install.`,
    ),
  );
  return false;
}

function main(): void {
  const output = readTree();
  const versions = new Set<string>();
  collectVersions(JSON.parse(output) as TreeNode, versions);

  if (versions.size !== 1) {
    console.error(
      chalk.red.bold(
        `❌ Expected one installed ${PACKAGE_NAME}, found ${versions.size}: ${[...versions].join(', ') || 'none'}`,
      ),
    );
    console.error(
      chalk.red(
        `  Align the ${PACKAGE_NAME} range in package.json with the one @remoteoss/remote-json-schema-form-kit declares, then run npm install.`,
      ),
    );
    process.exit(1);
  }

  if (!checkPinMatchesKit()) {
    process.exit(1);
  }

  console.log(
    chalk.green(`✅ ${PACKAGE_NAME} resolves to ${[...versions][0]}`),
  );
}

main();

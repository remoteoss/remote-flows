#!/usr/bin/env tsx
/**
 * Creates a git worktree for remote-flows with dependencies already installed,
 * so a second stream of work (e.g. reviewing a PR) doesn't require stashing or
 * switching branches in the main checkout.
 *
 * Usage:
 *   npm run worktree -- --branch <name> [--base <ref>]   Create a worktree with a new branch
 *   npm run worktree -- --branch <name> --existing       Create a worktree for an existing branch (e.g. review a PR)
 *   npm run worktree -- --pr <number>                    Create a worktree for a PR's branch
 */
import { execSync } from 'child_process';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const DEFAULT_DEV_PORT = 3001;

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
};

function sh(command: string, cwd?: string): string {
  return execSync(command, {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function shInherit(command: string, cwd?: string) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function repoRoot(): string {
  return sh('git rev-parse --show-toplevel');
}

function branchExistsLocally(branch: string, cwd: string): boolean {
  try {
    sh(`git show-ref --verify --quiet refs/heads/${branch}`, cwd);
    return true;
  } catch {
    return false;
  }
}

function resolvePrBranch(pr: string, cwd: string): string {
  log.info(`Resolving branch for PR #${pr}...`);
  return sh(`gh pr view ${pr} --json headRefName -q .headRefName`, cwd);
}

function seedNodeModules(source: string, worktreePath: string, dir: string) {
  const sourceDir = path.join(source, dir);
  const targetDir = path.join(worktreePath, dir);
  const sourceNodeModules = path.join(sourceDir, 'node_modules');

  if (!existsSync(sourceNodeModules)) {
    log.warn(
      `Source ${dir || 'root'}/node_modules not found. Falling back to npm install...`,
    );
    shInherit('npm install', targetDir);
    return;
  }

  if (process.platform === 'darwin') {
    try {
      log.info(`Seeding ${dir}/node_modules via APFS clone...`);
      shInherit(
        `cp -R -c "${sourceNodeModules}" "${path.join(targetDir, 'node_modules')}"`,
      );
    } catch {
      log.warn(
        `Clone-on-write copy failed for ${dir}/node_modules, npm install will do a full install.`,
      );
    }
  }

  log.info(`Installing dependencies in ${dir || 'root'}...`);
  shInherit('npm install', targetDir);
}

function listWorktreePaths(root: string): string[] {
  const output = sh('git worktree list --porcelain', root);
  return output
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length));
}

function readEnvPort(envPath: string): number {
  if (!existsSync(envPath)) {
    return DEFAULT_DEV_PORT;
  }
  const match = readFileSync(envPath, 'utf-8').match(/^PORT=(\d+)\s*$/m);
  return match ? Number(match[1]) : DEFAULT_DEV_PORT;
}

function pickFreePort(root: string): number {
  const usedPorts = new Set(
    listWorktreePaths(root).map((worktreePath) =>
      readEnvPort(path.join(worktreePath, 'example', '.env')),
    ),
  );

  let port = DEFAULT_DEV_PORT;
  while (usedPorts.has(port)) {
    port += 1;
  }
  return port;
}

function setEnvPort(envPath: string, port: number) {
  const content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';
  const line = `PORT=${port}`;
  const updated = /^PORT=\d+\s*$/m.test(content)
    ? content.replace(/^PORT=\d+\s*$/m, line)
    : `${content}${content.endsWith('\n') || content === '' ? '' : '\n'}${line}\n`;
  writeFileSync(envPath, updated);
}

async function main() {
  const { values } = parseArgs({
    options: {
      branch: { type: 'string' },
      base: { type: 'string', default: 'origin/main' },
      existing: { type: 'boolean', default: false },
      pr: { type: 'string' },
    },
  });

  const root = repoRoot();
  const repoName = path.basename(root);

  let branch = values.branch;
  let existing = values.existing ?? false;

  if (values.pr) {
    branch = resolvePrBranch(values.pr, root);
    existing = true;
  }

  if (!branch) {
    log.error('Missing --branch <name> (or --pr <number>).');
    process.exit(1);
  }

  if (!/^[\w./-]+$/.test(branch)) {
    log.error(`Refusing to use unsafe branch name: ${branch}`);
    process.exit(1);
  }

  const slug = branch.replace(/\//g, '-');
  const worktreePath = path.join(path.dirname(root), `${repoName}-${slug}`);

  if (existsSync(worktreePath)) {
    log.error(`Worktree path already exists: ${worktreePath}`);
    process.exit(1);
  }

  if (existing) {
    log.info(`Fetching origin/${branch}...`);
    sh(`git fetch origin ${branch}`, root);
    if (branchExistsLocally(branch, root)) {
      shInherit(`git worktree add "${worktreePath}" ${branch}`, root);
    } else {
      shInherit(
        `git worktree add --track -b ${branch} "${worktreePath}" origin/${branch}`,
        root,
      );
    }
  } else {
    const base = values.base as string;
    if (base.startsWith('origin/')) {
      log.info(`Fetching ${base.replace('origin/', '')}...`);
      sh(`git fetch origin ${base.replace('origin/', '')}`, root);
    }
    shInherit(`git worktree add -b ${branch} "${worktreePath}" ${base}`, root);
  }

  const port = pickFreePort(root);

  const exampleEnv = path.join(root, 'example', '.env');
  const worktreeEnv = path.join(worktreePath, 'example', '.env');
  if (existsSync(exampleEnv)) {
    copyFileSync(exampleEnv, worktreeEnv);
    log.info('Copied example/.env');
  }
  setEnvPort(worktreeEnv, port);
  log.info(`Assigned example dev server port ${port}`);

  seedNodeModules(root, worktreePath, '');
  seedNodeModules(root, worktreePath, 'example');

  log.success(`Worktree ready at ${worktreePath}`);
  log.info(`  cd ${worktreePath}`);
  log.info('  npm run dev            # watch-build the library');
  log.info(
    `  cd example && npm run dev   # run the example app at http://localhost:${port}`,
  );
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

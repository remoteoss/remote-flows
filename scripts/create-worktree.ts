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
import { existsSync, copyFileSync } from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const log = {
  info: (msg: string) => console.warn(`ℹ️  ${msg}`),
  success: (msg: string) => console.warn(`✅ ${msg}`),
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
  if (!existsSync(sourceNodeModules)) return;

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

  const exampleEnv = path.join(root, 'example', '.env');
  if (existsSync(exampleEnv)) {
    copyFileSync(exampleEnv, path.join(worktreePath, 'example', '.env'));
    log.info('Copied example/.env');
  }

  seedNodeModules(root, worktreePath, '');
  seedNodeModules(root, worktreePath, 'example');

  log.success(`Worktree ready at ${worktreePath}`);
  log.info(`  cd ${worktreePath}`);
  log.info('  npm run dev            # watch-build the library');
  log.info('  cd example && npm run dev   # run the example app against it');
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

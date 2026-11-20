import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import {
  bumpCoreIfChanged,
  getLastReleaseTag,
  hasCoreChangedSince,
} from './release-core';

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: 'ignore' });

function createRepo() {
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'release-core-'));
  mkdirSync(path.join(cwd, 'packages/core'), { recursive: true });
  writeFileSync(
    path.join(cwd, 'packages/core/package.json'),
    JSON.stringify({ name: 'core', version: '0.0.1-alpha.0' }, null, 2) + '\n',
  );
  writeFileSync(path.join(cwd, 'package.json'), '{}\n');
  git(cwd, 'init', '-q');
  git(cwd, 'config', 'user.email', 'test@example.com');
  git(cwd, 'config', 'user.name', 'Test');
  git(cwd, 'config', 'commit.gpgsign', 'false');
  git(cwd, 'add', '.');
  git(cwd, 'commit', '-q', '-m', 'init');
  return cwd;
}

const coreVersion = (cwd: string) =>
  JSON.parse(readFileSync(path.join(cwd, 'packages/core/package.json'), 'utf8'))
    .version;

describe('release core bump', () => {
  it('finds no tag before the first release', () => {
    expect(getLastReleaseTag(createRepo())).toBeNull();
  });

  it('bumps core on the first release when there is no tag', () => {
    const cwd = createRepo();

    expect(bumpCoreIfChanged('1.72.0', cwd)).toBe(true);
    expect(coreVersion(cwd)).toBe('1.72.0');
  });

  it('leaves core alone when nothing under packages/core changed since the tag', () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.71.0');
    writeFileSync(path.join(cwd, 'package.json'), '{"changed":true}\n');
    git(cwd, 'commit', '-q', '-am', 'feat: root only');

    expect(hasCoreChangedSince('v1.71.0', cwd)).toBe(false);
    expect(bumpCoreIfChanged('1.72.0', cwd)).toBe(false);
    expect(coreVersion(cwd)).toBe('0.0.1-alpha.0');
  });

  it('bumps core when a file under packages/core changed since the tag', () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.71.0');
    writeFileSync(path.join(cwd, 'packages/core/index.ts'), 'export {};\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-q', '-m', 'feat(core): new file');

    expect(hasCoreChangedSince('v1.71.0', cwd)).toBe(true);
    expect(bumpCoreIfChanged('1.72.0', cwd)).toBe(true);
    expect(coreVersion(cwd)).toBe('1.72.0');
  });
});

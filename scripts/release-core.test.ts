import { execFileSync } from 'child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import os from 'os';
import path from 'path';
import {
  bumpCoreIfChanged,
  compareVersions,
  getLastReleaseTag,
  hasCoreChangedSince,
  suggestCoreVersion,
  validateCoreVersion,
} from './release-core';

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: 'ignore' });

const repos: string[] = [];

function createRepo() {
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'release-core-'));
  repos.push(cwd);
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

const neverAsked = () => Promise.reject(new Error('should not ask'));

const answers = (...replies: string[]) => {
  const ask = vi.fn<(question: string) => Promise<string>>();
  replies.forEach((reply) => ask.mockResolvedValueOnce(reply));
  return ask;
};

const coreVersion = (cwd: string) =>
  JSON.parse(readFileSync(path.join(cwd, 'packages/core/package.json'), 'utf8'))
    .version;

describe('release core bump', () => {
  afterEach(() => {
    repos.splice(0).forEach((cwd) => rmSync(cwd, { recursive: true }));
  });

  it('finds no tag before the first release', () => {
    expect(getLastReleaseTag(createRepo())).toBeNull();
  });

  it('uses the newest tag when there are several', async () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.70.0');
    writeFileSync(path.join(cwd, 'packages/core/index.ts'), 'export {};\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-q', '-m', 'feat(core): new file');
    git(cwd, 'tag', 'v1.71.0');

    expect(getLastReleaseTag(cwd)).toBe('v1.71.0');
    expect(await bumpCoreIfChanged('minor', neverAsked, cwd)).toBeNull();
  });

  it('uses the highest version tag, not the nearest one, once a hotfix tag is merged in', () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.72.0');
    writeFileSync(path.join(cwd, 'package.json'), '{"hotfix":true}\n');
    git(cwd, 'commit', '-q', '-am', 'fix: hotfix');
    git(cwd, 'tag', 'v1.71.2');

    expect(getLastReleaseTag(cwd)).toBe('v1.72.0');
  });

  it('fails loudly when git cannot compare against the tag', () => {
    expect(() => hasCoreChangedSince('v9.9.9', createRepo())).toThrow();
  });

  it('asks for the core version on the first release when there is no tag', async () => {
    const cwd = createRepo();
    const ask = answers('');

    expect(await bumpCoreIfChanged('minor', ask, cwd)).toBe('0.0.1-alpha.1');
    expect(ask).toHaveBeenCalledWith('New core version [0.0.1-alpha.1]: ');
    expect(coreVersion(cwd)).toBe('0.0.1-alpha.1');
  });

  it('leaves core alone and does not ask when nothing under packages/core changed since the tag', async () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.71.0');
    writeFileSync(path.join(cwd, 'package.json'), '{"changed":true}\n');
    git(cwd, 'commit', '-q', '-am', 'feat: root only');

    expect(hasCoreChangedSince('v1.71.0', cwd)).toBe(false);
    expect(await bumpCoreIfChanged('minor', neverAsked, cwd)).toBeNull();
    expect(coreVersion(cwd)).toBe('0.0.1-alpha.0');
  });

  it('sets the version typed by the releaser when a file under packages/core changed since the tag', async () => {
    const cwd = createRepo();
    git(cwd, 'tag', 'v1.71.0');
    writeFileSync(path.join(cwd, 'packages/core/index.ts'), 'export {};\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-q', '-m', 'feat(core): new file');

    expect(hasCoreChangedSince('v1.71.0', cwd)).toBe(true);
    expect(await bumpCoreIfChanged('minor', answers('0.1.0'), cwd)).toBe(
      '0.1.0',
    );
    expect(coreVersion(cwd)).toBe('0.1.0');
  });

  it('asks again until the answer is valid and greater than the current version', async () => {
    const cwd = createRepo();
    const ask = answers('banana', '0.0.1-alpha.0', '0.0.1-alpha.4');

    expect(await bumpCoreIfChanged('patch', ask, cwd)).toBe('0.0.1-alpha.4');
    expect(ask).toHaveBeenCalledTimes(3);
    expect(coreVersion(cwd)).toBe('0.0.1-alpha.4');
  });
});

describe('suggestCoreVersion', () => {
  it('increments the alpha number numerically', () => {
    expect(suggestCoreVersion('0.0.1-alpha.2', 'minor')).toBe('0.0.1-alpha.3');
    expect(suggestCoreVersion('0.0.1-alpha.9', 'major')).toBe('0.0.1-alpha.10');
  });

  it('applies the SDK bump once core is stable', () => {
    expect(suggestCoreVersion('1.2.3', 'patch')).toBe('1.2.4');
    expect(suggestCoreVersion('1.2.3', 'minor')).toBe('1.3.0');
    expect(suggestCoreVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  it('rejects a version that is not valid', () => {
    expect(() => suggestCoreVersion('latest', 'patch')).toThrow();
  });
});

describe('validateCoreVersion', () => {
  it('accepts a greater version', () => {
    expect(validateCoreVersion('0.0.1-alpha.3', '0.0.1-alpha.2')).toBeNull();
    expect(validateCoreVersion('0.0.1', '0.0.1-alpha.10')).toBeNull();
  });

  it('rejects an invalid, equal or lower version', () => {
    expect(validateCoreVersion('v1', '0.0.1-alpha.2')).toContain('not a valid');
    expect(validateCoreVersion('0.0.1-alpha.2', '0.0.1-alpha.2')).toContain(
      'must be greater',
    );
    expect(validateCoreVersion('0.0.1-alpha.1', '0.0.1-alpha.2')).toContain(
      'must be greater',
    );
  });
});

describe('compareVersions', () => {
  it('orders prereleases below their release and numerically', () => {
    expect(compareVersions('0.0.1-alpha.10', '0.0.1-alpha.9')).toBeGreaterThan(
      0,
    );
    expect(compareVersions('0.0.1-alpha.1', '0.0.1')).toBeLessThan(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });
});

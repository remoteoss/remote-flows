import {
  bumpVersion,
  Commit,
  formatReleaseNotes,
  formatReleasePrBody,
  generateChangesetContent,
} from './release-changelog';

const commit = (subject: string, body = ''): Commit => ({
  hash: 'abc1234',
  subject,
  body,
});

const pr = (n: number) =>
  `[#${n}](https://github.com/remoteoss/remote-flows/pull/${n})`;

describe('generateChangesetContent', () => {
  it('groups commits by type, keeping commit order within each section', () => {
    const changeset = generateChangesetContent([
      commit('ci(e2e): only surface failures (#5)'),
      commit('fix(onboarding): disable submit while checking (#2)'),
      commit('feat(onboarding): wire onBlur events (#1)'),
      commit('docs: keep public JSDoc short (#4)'),
      commit('test(e2e): cover China salary conversion (#6)'),
      commit('fix: pre-fill resumed steps (#3)'),
      commit('chore(example): bump GBR schema version (#7)'),
      commit('refactor: extract helper (#8)'),
    ]);

    expect(changeset).toEqual({
      versionBump: 'minor',
      content: `#### Features

- wire onBlur events (#1) ${pr(1)}

#### Fixes

- disable submit while checking (#2) ${pr(2)}
- pre-fill resumed steps (#3) ${pr(3)}

#### Docs

- keep public JSDoc short (#4) ${pr(4)}

#### Chores

- only surface failures (#5) ${pr(5)}
- cover China salary conversion (#6) ${pr(6)}
- bump GBR schema version (#7) ${pr(7)}
- extract helper (#8) ${pr(8)}`,
    });
  });

  it('leaves out empty sections', () => {
    expect(
      generateChangesetContent([
        commit('fix: stable pricing plan schema (#9)'),
        commit('chore: bump tsx (#10)'),
      ]),
    ).toEqual({
      versionBump: 'patch',
      content: `#### Fixes

- stable pricing plan schema (#9) ${pr(9)}

#### Chores

- bump tsx (#10) ${pr(10)}`,
    });
  });

  it('bumps major when a feat or fix body has a BREAKING CHANGE footer', () => {
    expect(
      generateChangesetContent([
        commit('feat: add flag (#1)'),
        commit('fix: drop legacy prop (#2)', 'BREAKING CHANGE: prop removed'),
      ])?.versionBump,
    ).toBe('major');
  });

  it('keeps backticks and quotes in descriptions as-is', () => {
    expect(
      generateChangesetContent([
        commit('fix: stop stripping the required `name` field "now" (#11)'),
      ])?.content,
    ).toBe(
      `#### Fixes\n\n- stop stripping the required \`name\` field "now" (#11) ${pr(11)}`,
    );
  });

  it('omits the PR link when the commit has no PR number', () => {
    expect(generateChangesetContent([commit('chore: tidy up')])?.content).toBe(
      '#### Chores\n\n- tidy up',
    );
  });

  it('returns null when no commit is conventional', () => {
    expect(generateChangesetContent([commit('Update README')])).toBeNull();
  });
});

describe('bumpVersion', () => {
  it.each([
    ['patch', '1.60.1'],
    ['minor', '1.61.0'],
    ['major', '2.0.0'],
  ] as const)('applies a %s bump', (versionBump, expected) => {
    expect(bumpVersion('1.60.0', versionBump)).toBe(expected);
  });
});

describe('release notes', () => {
  const changeset = {
    versionBump: 'minor' as const,
    content: `#### Features\n\n- wire onBlur events (#1) ${pr(1)}`,
  };

  it('formats the changelog entry', () => {
    expect(formatReleaseNotes('1.61.0', changeset)).toBe(`## 1.61.0

### Minor Changes

#### Features

- wire onBlur events (#1) ${pr(1)}`);
  });

  it('appends the generated-by footer to the PR body', () => {
    expect(formatReleasePrBody('1.61.0', changeset)).toBe(`## 1.61.0

### Minor Changes

#### Features

- wire onBlur events (#1) ${pr(1)}

---

This release was automatically generated from conventional commits.`);
  });
});

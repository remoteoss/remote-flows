export type VersionBump = 'patch' | 'minor' | 'major';

export interface Commit {
  hash: string;
  subject: string;
  body: string;
}

export interface ParsedCommit {
  type: string;
  scope?: string;
  description: string;
  versionBump: VersionBump;
  prNumber?: string;
  hash: string;
}

export interface Changeset {
  versionBump: VersionBump;
  content: string;
}

const CHANGELOG_SECTIONS: Record<string, string> = {
  feat: 'Features',
  fix: 'Fixes',
  docs: 'Docs',
};

export function parseConventionalCommit(commit: Commit): ParsedCommit | null {
  const { subject, body } = commit;

  // Updated regex to handle both colon and dash separators
  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?\s*[-:]\s*(.+)$/);

  if (!match) return null;

  const [, type, scope, description] = match;
  let versionBump: VersionBump = 'patch';

  if (type === 'feat') versionBump = 'minor';
  if (type === 'feat' && body.includes('BREAKING CHANGE'))
    versionBump = 'major';
  if (type === 'fix' && body.includes('BREAKING CHANGE')) versionBump = 'major';

  const prMatch = (description + ' ' + body).match(/#(\d+)/);
  const prNumber = prMatch ? prMatch[1] : undefined;

  return {
    type,
    scope,
    description,
    versionBump,
    prNumber,
    hash: commit.hash,
  };
}

export function generateChangesetContent(commits: Commit[]): Changeset | null {
  const parsedCommits = commits
    .map(parseConventionalCommit)
    .filter((commit): commit is ParsedCommit => commit !== null);

  if (parsedCommits.length === 0) return null;

  let versionBump: VersionBump = 'patch';
  if (parsedCommits.some((commit) => commit.versionBump === 'major'))
    versionBump = 'major';
  else if (parsedCommits.some((commit) => commit.versionBump === 'minor'))
    versionBump = 'minor';

  const sections: Record<string, string[]> = {
    Features: [],
    Fixes: [],
    Docs: [],
    Chores: [],
  };

  parsedCommits.forEach((commit) => {
    const prText = commit.prNumber
      ? ` [#${commit.prNumber}](https://github.com/remoteoss/remote-flows/pull/${commit.prNumber})`
      : '';
    sections[CHANGELOG_SECTIONS[commit.type] ?? 'Chores'].push(
      `- ${commit.description}${prText}`,
    );
  });

  return {
    versionBump,
    content: Object.entries(sections)
      .filter(([, items]) => items.length > 0)
      .map(([title, items]) => `#### ${title}\n\n${items.join('\n')}`)
      .join('\n\n'),
  };
}

export function bumpVersion(version: string, versionBump: VersionBump): string {
  const [major, minor, patch] = version.split('.').map(Number);
  if (versionBump === 'major') return `${major + 1}.0.0`;
  if (versionBump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function formatReleaseNotes(
  version: string,
  changeset: Changeset,
): string {
  const versionType =
    changeset.versionBump === 'major'
      ? 'Major'
      : changeset.versionBump === 'minor'
        ? 'Minor'
        : 'Patch';

  return `## ${version}

### ${versionType} Changes

${changeset.content}`;
}

export function formatReleasePrBody(
  version: string,
  changeset: Changeset,
): string {
  return `${formatReleaseNotes(version, changeset)}

---

This release was automatically generated from conventional commits.`;
}

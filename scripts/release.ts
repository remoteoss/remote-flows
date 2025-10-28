#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

interface Commit {
  hash: string;
  subject: string;
  body: string;
}

interface ParsedCommit {
  type: string;
  scope?: string;
  description: string;
  versionBump: 'patch' | 'minor' | 'major';
  prNumber?: string;
  hash: string;
}

interface Changeset {
  versionBump: 'patch' | 'minor' | 'major';
  content: string;
}

async function getLatestPublishedVersion(): Promise<string> {
  try {
    const response = await fetch(
      'https://registry.npmjs.org/@remoteoss/remote-flows/latest',
    );

    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.version;
  } catch (error) {
    console.log(
      `⚠️  Could not fetch latest version from npm: ${error.message}`,
    );

    // Fallback to local version
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }
}

function getCommitsSinceLastRelease(): Commit[] {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();

    // Get all commits since last tag (not just merges)
    const commits = execSync(
      `git log ${lastTag}..HEAD --pretty=format:"%h|%s|%b" --no-merges`,
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, subject, body] = line.split('|');
        return {
          hash: hash || '',
          subject: subject || '',
          body: body || '',
        };
      });

    return commits;
  } catch {
    // Fallback to all commits if no tags exist
    const commits = execSync('git log --pretty=format:"%h|%s|%b" --no-merges', {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, subject, body] = line.split('|');
        return {
          hash: hash || '',
          subject: subject || '',
          body: body || '',
        };
      });

    return commits;
  }
}

async function getCommitsFromGitHubAPI(): Promise<Commit[]> {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();

    // Get commits using GitHub API
    const response = await fetch(
      `https://api.github.com/repos/remoteoss/remote-flows/compare/${lastTag}...main`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch commits from GitHub API');
    }

    const data = await response.json();

    // Get all commits, not just merge commits
    const commits = data.commits
      .filter(
        (commit: any) => !commit.commit.message.includes('Merge pull request'),
      )
      .map((commit: any) => ({
        hash: commit.sha.substring(0, 7),
        subject: commit.commit.message.split('\n')[0],
        body: commit.commit.message.split('\n').slice(1).join('\n').trim(),
      }));

    // If no commits found via API, fall back to git log
    if (commits.length === 0) {
      return getCommitsSinceLastRelease();
    }

    return commits;
  } catch {
    return getCommitsSinceLastRelease();
  }
}

function parseConventionalCommit(commit: Commit): ParsedCommit | null {
  const { subject, body } = commit;

  // Updated regex to handle both colon and dash separators
  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?\s*[-:]\s*(.+)$/);

  if (!match) return null;

  const [, type, scope, description] = match;
  let versionBump: 'patch' | 'minor' | 'major' = 'patch';

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

function generateChangesetContent(commits: Commit[]): Changeset | null {
  const parsedCommits = commits
    .map(parseConventionalCommit)
    .filter((commit): commit is ParsedCommit => commit !== null);

  if (parsedCommits.length === 0) {
    return null;
  }

  const groups: Record<'major' | 'minor' | 'patch', ParsedCommit[]> = {
    major: [],
    minor: [],
    patch: [],
  };

  parsedCommits.forEach((commit) => {
    groups[commit.versionBump].push(commit);
  });

  let finalVersionBump: 'patch' | 'minor' | 'major' = 'patch';
  if (groups.major.length > 0) finalVersionBump = 'major';
  else if (groups.minor.length > 0) finalVersionBump = 'minor';

  // Generate simple changeset content (no markdown headers)
  const changesetItems: string[] = [];

  // Add all commits as simple bullet points
  parsedCommits.forEach((commit) => {
    const prText = commit.prNumber
      ? ` [#${commit.prNumber}](https://github.com/remoteoss/remote-flows/pull/${commit.prNumber})`
      : '';
    changesetItems.push(`- ${commit.description}${prText}`);
  });

  return {
    versionBump: finalVersionBump,
    content: changesetItems.join('\n'),
  };
}

async function main(): Promise<void> {
  // Get the latest published version from npm
  const latestPublishedVersion = await getLatestPublishedVersion();

  // Try GitHub API first, fallback to git log
  const commits = await getCommitsFromGitHubAPI();

  if (commits.length === 0) {
    console.log('No commits found since last release');
    return;
  }

  const changeset = generateChangesetContent(commits);

  if (!changeset) {
    console.log('No conventional commits found');
    return;
  }

  // Calculate new version
  const [major, minor, patch] = latestPublishedVersion.split('.').map(Number);
  let newVersion: string;
  if (changeset.versionBump === 'major') {
    newVersion = `${major + 1}.0.0`;
  } else if (changeset.versionBump === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  console.log(`\n📦 ${latestPublishedVersion} → ${newVersion} (${changeset.versionBump})\n`);
  console.log(`${changeset.content}\n`);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const proceed = await new Promise<string>((resolve) => {
    rl.question('Proceed with release? (y/N): ', resolve);
  });

  if (proceed.toLowerCase() !== 'y') {
    console.log('Release cancelled');
    rl.close();
    return;
  }


  // Read current package.json and update it
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

  // Generate changelog entry to match existing format
  const versionType =
    changeset.versionBump === 'major'
      ? 'Major'
      : changeset.versionBump === 'minor'
        ? 'Minor'
        : 'Patch';
  const changelogEntry = `## ${newVersion}

### ${versionType} Changes

${changeset.content}

`;

  // Read existing changelog
  let changelog = '';
  try {
    changelog = readFileSync('CHANGELOG.md', 'utf8');
  } catch {
    changelog = '# @remoteoss/remote-flows\n\n';
  }

  // Add new entry at the top (after the header)
  const lines = changelog.split('\n');
  // Look for any version line (## followed by version number)
  const headerEndIndex = lines.findIndex((line) =>
    line.match(/^## \d+\.\d+\.\d+/),
  );
  if (headerEndIndex === -1) {
    changelog = changelog + '\n' + changelogEntry;
  } else {
    lines.splice(headerEndIndex, 0, changelogEntry);
    changelog = lines.join('\n');
  }

  writeFileSync('CHANGELOG.md', changelog);

  // Format files with prettier before creating PR
  try {
    execSync('npm run format', { stdio: 'pipe' });
  } catch (error) {
    console.log(`⚠️  Prettier formatting failed: ${error.message}`);
  }

  // Create release branch
  const branchName = `release-${newVersion}`;
  execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
  execSync('git add .', { stdio: 'pipe' });
  execSync(`git commit -m "chore: prepare release v${newVersion}"`, {
    stdio: 'pipe',
  });
  execSync(`git push origin ${branchName}`, { stdio: 'pipe' });

  // Auto-create PR with changelog content as body
  try {
    // Create PR with changelog content as the body
    const prBody = `## ${newVersion}

### ${versionType} Changes

${changeset.content}

---

This release was automatically generated from conventional commits.`;

    execSync(
      `gh pr create --title "${newVersion}" --body "${prBody}" --base main --head ${branchName}`,
      { stdio: 'pipe' },
    );

    // Open the PR in the browser
    execSync(`gh pr view ${branchName} --web`, { stdio: 'pipe' });
    console.log(`✅ Created PR and opened in browser`);
  } catch {
    console.log(
      `⚠️  Could not create PR automatically. Please create it manually.`,
    );
  }

  console.log(`\n📋 Next steps:`);
  console.log(`1. Review the changes in the PR`);
  console.log(`2. Merge the PR to main`);
  console.log(`3. CI will automatically publish to npm`);

  rl.close();
}

main().catch(console.error);

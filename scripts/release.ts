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
    console.log('📦 Checking latest published version on npm...');
    const response = await fetch(
      'https://registry.npmjs.org/@remoteoss/remote-flows/latest',
    );

    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status}`);
    }

    const data = await response.json();
    const publishedVersion = data.version;
    console.log(`📦 Latest published version: ${publishedVersion}`);
    return publishedVersion;
  } catch (error) {
    console.log(
      `⚠️  Could not fetch latest version from npm: ${error.message}`,
    );
    console.log('📦 Falling back to local package.json version');

    // Fallback to local version
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }
}

function getCommitsSinceLastRelease(): Commit[] {
  console.log('Getting commits since last release');
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
      console.log('No commits found via GitHub API, falling back to git log');
      return getCommitsSinceLastRelease();
    }

    return commits;
  } catch {
    console.log('GitHub API failed, falling back to git log');
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
  console.log('Generating changeset content for commits:', commits);
  const parsedCommits = commits
    .map(parseConventionalCommit)
    .filter((commit): commit is ParsedCommit => commit !== null);

  if (parsedCommits.length === 0) {
    console.log('No conventional commits found');
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
  console.log('🚀 Preparing release...');

  // Get the latest published version from npm
  const latestPublishedVersion = await getLatestPublishedVersion();

  // Try GitHub API first, fallback to git log
  const commits = await getCommitsFromGitHubAPI();
  console.log(`📊 Found ${commits.length} commits since last release`);

  if (commits.length === 0) {
    console.log('No commits found');
    return;
  }

  const changeset = generateChangesetContent(commits);

  if (!changeset) {
    console.log('No conventional commits found');
    return;
  }

  console.log(`📝 Detected version bump: ${changeset.versionBump}`);
  console.log(`📋 Changeset content:\n${changeset.content}`);

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

  // Manual version bumping and changelog generation
  console.log('📦 Updating version and changelog...');

  // Use the latest published version as the base
  const [major, minor, patch] = latestPublishedVersion.split('.').map(Number);

  // Bump version based on changeset
  let newVersion: string;
  if (changeset.versionBump === 'major') {
    newVersion = `${major + 1}.0.0`;
  } else if (changeset.versionBump === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  console.log(`📈 Version bump: ${latestPublishedVersion} → ${newVersion}`);

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

  console.log(`✅ Updated version to ${newVersion}`);
  console.log(`✅ Updated CHANGELOG.md`);

  // Create release branch
  const branchName = `release-${newVersion}`;
  console.log(`🌿 Creating release branch: ${branchName}`);

  execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "chore: prepare release v${newVersion}"`, {
    stdio: 'inherit',
  });
  execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

  console.log(`✅ Created release branch: ${branchName}`);

  // Auto-create PR with changelog content as body
  console.log(`🔗 Creating PR...`);
  try {
    // Create PR with changelog content as the body
    const prBody = `## ${newVersion}

### ${versionType} Changes

${changeset.content}

---

This release was automatically generated from conventional commits.`;

    execSync(
      `gh pr create --title "${newVersion}" --body "${prBody}" --base main --head ${branchName}`,
      { stdio: 'inherit' },
    );
    console.log(`✅ Created PR: Release v${newVersion}`);

    // Open the PR in the browser
    console.log(`🌐 Opening PR in browser...`);
    try {
      execSync(`gh pr view ${branchName} --web`, { stdio: 'inherit' });
      console.log(`✅ Opened PR in browser`);
    } catch {
      console.log(`⚠️  Could not open PR in browser automatically`);
    }
  } catch {
    console.log(
      `⚠️  Could not create PR automatically. Please create it manually.`,
    );
  }

  console.log(`📋 Next steps:`);
  console.log(`1. Review the changes in the PR`);
  console.log(`2. Merge the PR to main`);
  console.log(`3. CI will automatically publish to npm`);

  rl.close();
}

main().catch(console.error);

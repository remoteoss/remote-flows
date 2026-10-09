#!/usr/bin/env tsx

import { execFileSync, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import {
  bumpVersion,
  Commit,
  formatReleaseNotes,
  formatReleasePrBody,
  generateChangesetContent,
  VersionBump,
} from './release-changelog';
import { $TSFixMe } from './types';

async function getLatestPublishedVersion(): Promise<string> {
  console.log('📦 Reading version from package.json...');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  console.log(`📦 Current version: ${version}`);
  return version;
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
        (commit: $TSFixMe) =>
          !commit.commit.message.includes('Merge pull request'),
      )
      .map((commit: $TSFixMe) => ({
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

  // Ask if the detected version is correct
  const versionCorrect = await new Promise<string>((resolve) => {
    rl.question(
      `Is '${changeset.versionBump}' the correct version bump? (Y/n): `,
      resolve,
    );
  });

  let finalVersionBump = changeset.versionBump;

  // If not correct, ask for the correct type
  if (versionCorrect.toLowerCase() === 'n') {
    const userVersionBump = await new Promise<string>((resolve) => {
      rl.question('Specify version bump (patch/minor/major): ', resolve);
    });

    const validVersions = ['patch', 'minor', 'major'];
    if (validVersions.includes(userVersionBump.toLowerCase())) {
      finalVersionBump = userVersionBump.toLowerCase() as VersionBump;

      console.log(
        `📝 Using version bump: ${finalVersionBump} (${latestPublishedVersion} → ${bumpVersion(latestPublishedVersion, finalVersionBump)})`,
      );
    } else {
      console.log('Invalid version bump. Exiting.');
      rl.close();
      return;
    }
  }

  // Update the changeset with the confirmed version
  changeset.versionBump = finalVersionBump;

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

  const newVersion = bumpVersion(latestPublishedVersion, changeset.versionBump);

  console.log(`📈 Version bump: ${latestPublishedVersion} → ${newVersion}`);

  // Read current package.json and update it
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

  const changelogEntry = `${formatReleaseNotes(newVersion, changeset)}\n\n`;

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

  // Format files with oxfmt before creating PR
  console.log(`🎨 Formatting files with oxfmt...`);
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log(`✅ Files formatted with oxfmt`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`⚠️  oxfmt formatting failed: ${message}`);
    console.log(`Continuing with release...`);
  }

  // Update package-lock.json
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Updated package-lock.json');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`⚠️  Failed to update package-lock.json: ${message}`);
  }

  // Create release branch
  const branchName = `release/${newVersion}`;
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
    const prBody = formatReleasePrBody(newVersion, changeset);

    execFileSync(
      'gh',
      [
        'pr',
        'create',
        '--title',
        newVersion,
        '--body',
        prBody,
        '--base',
        'main',
        '--head',
        branchName,
      ],
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

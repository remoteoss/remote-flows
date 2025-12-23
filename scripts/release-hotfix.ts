#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

async function getChangeDescription(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    '\n📝 Enter the hotfix description (press Enter twice when done):',
  );
  console.log('Example: - Fix authentication timeout issue');
  console.log('         - Resolve memory leak in data processor\n');

  const lines: string[] = [];
  let emptyLineCount = 0;

  return new Promise<string>((resolve) => {
    rl.on('line', (line) => {
      if (line.trim() === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.close();
          resolve(lines.join('\n'));
        }
      } else {
        emptyLineCount = 0;
        lines.push(line);
      }
    });
  });
}

async function main(): Promise<void> {
  console.log('🔧 Preparing hotfix release...');

  // Get current version from package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  console.log(`📦 Current version: ${currentVersion}`);

  // Verify we're on a release branch or have uncommitted hotfix changes
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim();
    console.log(`🌿 Current branch: ${currentBranch}`);
  } catch {
    console.error('Failed to get current branch');
    return;
  }

  // Get the hotfix description from user
  const changeDescription = await getChangeDescription();

  if (!changeDescription.trim()) {
    console.log('❌ No description provided. Hotfix release cancelled.');
    return;
  }

  console.log('\n📋 Hotfix description:');
  console.log(changeDescription);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const proceed = await new Promise<string>((resolve) => {
    rl.question('\nProceed with hotfix release? (y/N): ', resolve);
  });

  if (proceed.toLowerCase() !== 'y') {
    console.log('Hotfix release cancelled');
    rl.close();
    return;
  }

  // Hotfixes always bump patch version only (never minor or major)
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;

  console.log(`\n📈 Patch version bump: ${currentVersion} → ${newVersion}`);

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

  // Generate changelog entry
  const changelogEntry = `## ${newVersion}

### Patch Changes

${changeDescription}

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

  // Format files with prettier
  console.log(`\n🎨 Formatting files with prettier...`);
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log(`✅ Files formatted`);
  } catch {
    console.log(`⚠️  Prettier formatting failed, continuing...`);
  }

  // Update package-lock.json
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Updated package-lock.json');
  } catch (error) {
    console.log(`⚠️  Failed to update package-lock.json: ${error}`);
  }

  // Create release branch
  const branchName = `release/${newVersion}`;
  console.log(`\n🌿 Creating release branch: ${branchName}`);

  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore: prepare hotfix release v${newVersion}"`, {
      stdio: 'inherit',
    });
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

    console.log(`✅ Created and pushed release branch: ${branchName}`);
  } catch (error) {
    console.error(`❌ Failed to create release branch: ${error}`);
    rl.close();
    return;
  }

  // Create PR
  console.log(`\n🔗 Creating PR...`);
  try {
    const prBody = `## ${newVersion}

### Patch Changes

${changeDescription}

---

This is a hotfix release.`;

    execSync(
      `gh pr create --title "Hotfix ${newVersion}" --body "${prBody}" --base main --head ${branchName}`,
      { stdio: 'inherit' },
    );
    console.log(`✅ Created PR: Hotfix v${newVersion}`);

    // Open the PR in the browser
    console.log(`🌐 Opening PR in browser...`);
    try {
      execSync(`gh pr view ${branchName} --web`, { stdio: 'inherit' });
    } catch {
      console.log(`⚠️  Could not open PR in browser automatically`);
    }
  } catch {
    console.log(
      `⚠️  Could not create PR automatically. Please create it manually.`,
    );
  }

  console.log(`\n📋 Next steps:`);
  console.log(`1. Review the PR`);
  console.log(`2. Merge the PR to main`);
  console.log(
    `3. Run the Release workflow manually with branch: ${branchName}`,
  );
  console.log(`   - Go to: Actions → Release workflow → Run workflow`);
  console.log(`   - Select branch: ${branchName}`);

  rl.close();
}

main().catch(console.error);

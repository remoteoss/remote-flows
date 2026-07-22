const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = require(pkgPath);

const commitHash = process.env.VERCEL_GIT_COMMIT_SHA;

if (!commitHash) {
  console.log('ℹ️  No VERCEL_GIT_COMMIT_SHA set, skipping commit hash update.');
  process.exit(0);
}

pkg.dependencies['@remoteoss/remote-flows'] =
  `github:remoteoss/remote-flows#${commitHash}`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ Set @remoteoss/remote-flows to commit hash ${commitHash}`);

// pnpm refuses to run a git-hosted dependency's `prepare` script unless the
// exact `name@<resolved tarball url>` is in `allowBuilds` — a plain package
// name is deliberately ignored for non-registry deps (untrusted identity).
// The SHA changes on every deploy, so the entry has to be written here.
const workspacePath = path.join(__dirname, '..', 'pnpm-workspace.yaml');
const tarballUrl = `https://codeload.github.com/remoteoss/remote-flows/tar.gz/${commitHash}`;
const workspace = fs.readFileSync(workspacePath, 'utf8');
if (!/^allowBuilds:$/m.test(workspace)) {
  console.error('❌ No `allowBuilds:` key found in pnpm-workspace.yaml');
  process.exit(1);
}
fs.writeFileSync(
  workspacePath,
  workspace.replace(
    /^allowBuilds:$/m,
    `allowBuilds:\n  '@remoteoss/remote-flows@${tarballUrl}': true`,
  ),
);
console.log(`✅ Allowed build of @remoteoss/remote-flows@${tarballUrl}`);

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

// Vercel builds with npm (see vercel.json), but its serverless-functions
// phase runs its own dependency install and auto-detects the package manager
// from `packageManager`/`pnpm-lock.yaml`. Detected pnpm + CI means a frozen
// install, which can never match a manifest rewritten to a per-commit git
// ref. Strip the pnpm markers from the (ephemeral) deploy workspace so every
// phase resolves to npm — the repo itself stays pnpm for dev and CI.
delete pkg.packageManager;
for (const file of ['pnpm-lock.yaml', 'pnpm-workspace.yaml']) {
  fs.rmSync(path.join(__dirname, '..', file), { force: true });
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ Set @remoteoss/remote-flows to commit hash ${commitHash}`);

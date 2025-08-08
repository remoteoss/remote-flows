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

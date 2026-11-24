# @remoteoss/remote-flows-core

Internal package used by `@remoteoss/remote-flows` and other Remote Flows packages.

It is not a public API and does not follow semver at the moment: it can break in any release. Use `@remoteoss/remote-flows` instead.

## Releasing

Releases of the SDK never change this package's version. To publish a new alpha, bump `version` to the next `0.0.1-alpha.N` in a PR and merge it, then run `pnpm run check-core-package` and `npm publish out/core-pack/*.tgz --access public --tag alpha`. The release workflow does not publish core.

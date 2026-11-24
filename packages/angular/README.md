# @remoteoss/remote-flows-angular

Alpha. Angular components for Remote's embeddable flows. The API will change; install with the `alpha` tag.

```bash
npm install @remoteoss/remote-flows-angular@alpha
```

Only the create invoice schedule flow is covered today. See `apps/angular` for a working example.

<<<<<<< HEAD
=======

## TanStack Query

`provideRemoteFlows` registers its own `QueryClient` through `provideTanStackQuery` and does not accept one. If your app also calls `provideTanStackQuery`, both providers target the same token and only one client wins, so let the flows own it and don't provide a second one in the same injector.

> > > > > > > origin/main

## Build and pack

```bash
pnpm run build          # runs ng-packagr into dist/
pnpm pack               # the tarball partners get
```

`publishConfig.directory` makes `pnpm pack` and `pnpm publish` take their files from `dist/`, so run them from this folder, never `npm publish` inside `dist/`. Publish with `pnpm publish --tag alpha` so a plain install never picks it up.

Core is a `workspace:*` dependency, so the repo, the demo app and the type-check all use the local `packages/core`. When the package is packed, pnpm writes core's current version into the manifest. Partners get that published version, which can lag `main`. When the Angular package needs a core change, bump and publish core first, then pack this package.

# @remoteoss/remote-flows-angular

Alpha. Angular components for Remote's embeddable flows. The API will change; install with the `alpha` tag.

```bash
npm install @remoteoss/remote-flows-angular@alpha
```

Only the create invoice schedule flow is covered today. See `apps/angular` for a working example.

## Build and pack

```bash
pnpm run build          # syncs core into src/vendor, then runs ng-packagr into dist/
cd dist && npm pack     # the tarball partners get; always publish from dist/, never from the package root
```

Publish with `npm publish --tag alpha` from `dist/` so a plain install never picks it up.

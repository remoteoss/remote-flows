---
description: Entry points, bundle externals and size limits
paths:
  - 'package.json'
  - 'tsdown.config.ts'
  - '.sizelimit.json'
  - 'src/index.tsx'
  - 'src/internals.ts'
  - 'src/default-components.ts'
---

# Package exports and bundle

[package.json](../../package.json) ships **multiple ESM entry points** — `.`, `./internals`, `./default-components`, `./flows/*`, `./styles`, `./styles.css`, `./index.css`. Tsup builds each as a separate chunk ([tsdown.config.ts](../../tsdown.config.ts)), `react`/`react-dom` are externals, `react-hook-form` + `@hookform/resolvers` are bundled (`noExternal`). Bundle limits in [.sizelimit.json](../../.sizelimit.json) are enforced in CI by `.github/workflows/size-check.yml`. The `internals` entry point has **no semver guarantees**.

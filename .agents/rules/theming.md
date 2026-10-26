---
description: Class prefixes, theme tokens and Tailwind setup
paths:
  - 'src/styles/**'
  - 'src/lib/applyTheme.ts'
  - 'src/theme.tsx'
  - '**/*.css'
---

# Theming and CSS

Tailwind v4 (`@tailwindcss/postcss`) + CSS variables. Public component classes are prefixed `RemoteFlows__` (e.g. `RemoteFlows__Button`, `RemoteFlows__CostCalculatorForm`); variants use `RemoteFlows_VariantName`. Theme tokens (`colors`, `spacing`, `borderRadius`, `font`) are injected as CSS custom properties by `applyTheme()` in [src/lib/applyTheme.ts](../../src/lib/applyTheme.ts). Class merging uses the `cn()` helper.

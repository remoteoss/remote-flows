# Migrate to oxlint (full replacement)

## Context

ESLint 9 + typescript-eslint is slow. oxlint covers all rules used here. Two rules are being dropped:
- `react-refresh/only-export-components` — not providing value
- `no-restricted-imports` (vitest globals) — unnecessary since vitest globals are never imported directly

This means ESLint and all its plugins can be removed entirely.

No `eslint-disable` comments exist in the codebase, so no comment migration needed.

---

## Rule ownership after migration

| Rule | Tool |
|---|---|
| JS recommended, TS recommended, react-hooks | oxlint (built-in plugins) |
| `no-console` (warn, allow warn/error) | oxlint |
| `react-refresh/only-export-components` | **dropped** |
| `no-restricted-imports` (vitest globals) | **dropped** |

---

## Step 1 — Install oxlint, remove all ESLint packages

**`package.json` devDependencies:**

Remove:
- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `globals`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

Add:
- `"oxlint": "^0.16.0"`

---

## Step 2 — Create `.oxlintrc.json` at root

```json
{
  "env": {
    "browser": true,
    "es2020": true
  },
  "ignorePatterns": [
    "dist",
    "src/client/**/*.gen.ts"
  ],
  "plugins": ["react", "react-hooks", "typescript"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Step 3 — Delete `eslint.config.mjs`

File is no longer needed.

---

## Step 4 — Update lint script in `package.json`

```json
"lint": "oxlint ."
```

The `ci` script doesn't need to change.

---

## Step 5 — Update `example/` package

**`example/eslint.config.js`** — delete.

**`example/package.json`** — remove all ESLint packages (`eslint`, `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`); add `oxlint`; update lint script to `"lint": "oxlint ."`.

**`example/.oxlintrc.json`** — create:

```json
{
  "env": { "browser": true, "es2020": true },
  "ignorePatterns": ["dist"],
  "plugins": ["react", "react-hooks", "typescript"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Files changed

| File | Action |
|---|---|
| `package.json` | Remove 6 ESLint packages, add `oxlint`, update `lint` script |
| `eslint.config.mjs` | Delete |
| `.oxlintrc.json` | Create |
| `example/package.json` | Remove all ESLint packages, add `oxlint`, update `lint` script |
| `example/eslint.config.js` | Delete |
| `example/.oxlintrc.json` | Create |

---

## Verification

1. `npm install` — confirm ESLint packages are gone, oxlint is present
2. `npx oxlint .` — runs cleanly
3. `npm run lint` — passes
4. `npm run ci` — full pipeline passes
5. Inside `example/`: `npm install && npm run lint`

---

## Rollback

`git restore package.json eslint.config.mjs && npm install` — fully reverts.

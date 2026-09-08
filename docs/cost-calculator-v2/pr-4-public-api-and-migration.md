# PR 4: Public API finalization + MIGRATION.md

Branch: `cost-calculator-v2-schema-unification`
Step 4 of 4 (final) in the CostCalculator v2 rewrite. Builds on [PR 1](pr-1-schema-unification.md), [PR 2](pr-2-rhf-wiring-and-reset.md), and [PR 3](pr-3-yup-removal.md). **This is the PR that should carry the `BREAKING CHANGE` marker and trigger the `2.0.0` major release.**

## What this PR does

Unlike PRs 1-3, this one is documentation and public-surface cleanup, not runtime logic — by the end of PR 3, `useCostCalculator`'s bag already had its final shape. This PR:

1. Fixes `src/flows/CostCalculator/README.md`, which had gone stale independently of this rewrite.
2. Writes the `MIGRATION.md` v2.0.0 entry.
3. Confirms nothing else in the codebase references what's being removed.

## What changed

**`src/flows/CostCalculator/README.md`**

- Two code examples ("Cost calculator with results" and "Cost Calculator with premium benefits") imported and rendered `CostCalculatorResults`, an export that was actually removed back in **v1.0.0** — a pre-existing documentation bug, unrelated to this rewrite, that just hadn't been caught. Both examples now import and use `EstimationResults` (the component that replaced it), matching the real usage in `example/src/CostCalculatorWithResults.tsx`: `estimation={estimations.data.employments?.[0]}`, `title`, `onDelete`, `onExportPdf`, `onEdit`.
- The `useCostCalculator` properties table: removed the `validationSchema` row (Yup, gone since PR 3); added `fieldValues` and `checkFieldUpdates` (added in PR 2); added `resetKey` and updated `resetForm`'s signature to `(options?: { remount?: boolean }) => void` (both from PR 2's reset-semantics rework).

**`MIGRATION.md`**

- Added a `## Version 2.0.0` section above `## Version 1.0.0` (newest first, matching how a reader would look for "what changed since my version"), with a matching Table of Contents entry.
- **Overview**: five bullets covering the `useJSONSchemaForm` pipeline adoption, `validationSchema` removal, the three additive bag fields, the reset-correctness fix, and Yup's removal.
- **Breaking Changes**: two numbered subsections, following the existing doc's convention (prose + `**Before:**`/`**After:**` code fences where there's a call site to change, prose-only where it's a pure removal):
  1. `validationSchema` removed — prose-only removal notice, since there's no replacement call site, just "stop using it."
  2. Reset now applies up-to-date default values — a behavior-fix notice (not a signature change), specifically calling out that anyone who'd built a workaround for the old stale-reset bug should remove it.
- Updated the `## Version History` list (`v2.0.0 (Unreleased)`) and the `_Last updated:_` footer.

## What was _not_ changed

- No code in `src/flows/CostCalculator/*.ts(x)` — everything here is `.md` files.
- The pre-existing formatting bug in `MIGRATION.md`'s **Version 1.0.0 → 3. Internal imports** section (a code fence and the next header got concatenated on one line, first noticed during the initial research for this whole rewrite) was left alone — it predates this effort and touching it isn't part of the CostCalculator v2 scope. Worth a separate, unrelated fix.

## Verification performed

- `npm run type-check` — clean (no code changed, but confirms nothing depends on `validationSchema` anywhere in the codebase — `grep -rn "validationSchema" src example` returns nothing)
- `npx vitest run src/flows/CostCalculator` — 7 files / 77 tests pass
- `npx vitest run` (full repo) — 928 tests pass
- `npm run check-format` — clean after `npm run format` (markdown reflow only)
- `npm run lint` — only the one pre-existing `no-unsafe-optional-chaining` warning in `hooks.tsx`, confirmed to predate this branch in PR 1/2/3's own verification passes

## Before this ships as `2.0.0`

Per `scripts/release.ts`, the major-version bump triggers off the literal substring `BREAKING CHANGE` appearing anywhere in the merged commit's body (a plain substring check, not a strict footer format) — whichever commit/PR actually merges this work needs that string in its description for `npm run release` to cut a `2.0.0` rather than a minor/patch. That's a release-time action, not something in this diff.

## Rollout summary (all 4 PRs)

| PR  | What                                                                                         | Test edits                                | Public API impact                                                   |
| --- | -------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| 1   | Schema unification (one `createHeadlessForm` call instead of two spliced together)           | None                                      | None — invisible to consumers                                       |
| 2   | `useJSONSchemaForm` + `checkFieldUpdates`/`fieldValues` wiring, remount-based reset          | `CostCalculatorResetButton.test.tsx` only | Additive: `fieldValues`, `checkFieldUpdates`, `resetKey` on the bag |
| 3   | Yup fully removed, schema-native validation, `SalaryField` sync extracted to a pure function | None                                      | `validationSchema` removed from the bag (forced by removing Yup)    |
| 4   | README fixes + `MIGRATION.md`                                                                | N/A (docs only)                           | None (documents what PRs 2-3 already changed)                       |

All four PRs are currently uncommitted on a single branch (`cost-calculator-v2-schema-unification`) for review as one unit, or split into four commits/PRs — whichever the reviewing team prefers.
